require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("cloudinary").v2;

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Trust proxy for getting real IP behind reverse proxy
app.set("trust proxy", true);

// Helper to get client IP
function getClientIP(req) {
  return req.ip || req.connection.remoteAddress || "unknown";
}

// Multer configuration for memory storage (for Cloudinary upload)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Helper to upload buffer to Cloudinary
function uploadToCloudinary(buffer, folder = "face-rank") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
}

// Helper to delete from Cloudinary
async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
}

// Admin password from environment
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// API Routes

// Get all people with their average ratings (includes user's vote status)
app.get("/api/people", async (req, res) => {
  try {
    const clientIP = getClientIP(req);

    const people = await prisma.person.findMany({
      include: {
        images: true,
        ratings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const peopleWithRatings = people.map((person) => {
      const avgRating =
        person.ratings.length > 0
          ? person.ratings.reduce((sum, r) => sum + r.rating, 0) /
            person.ratings.length
          : 0;

      const userVote = person.ratings.find((r) => r.ipAddress === clientIP);

      return {
        id: person.id,
        name: person.name,
        images: person.images.map((img) => img.url),
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings: person.ratings.length,
        userVoted: !!userVote,
        userRating: userVote ? userVote.rating : null,
        createdAt: person.createdAt,
      };
    });

    res.json(peopleWithRatings);
  } catch (error) {
    console.error("Error fetching people:", error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

// Get leaderboard (sorted by average rating)
app.get("/api/leaderboard", async (req, res) => {
  try {
    const people = await prisma.person.findMany({
      include: {
        images: true,
        ratings: true,
      },
    });

    const leaderboard = people
      .map((person) => {
        const avgRating =
          person.ratings.length > 0
            ? person.ratings.reduce((sum, r) => sum + r.rating, 0) /
              person.ratings.length
            : 0;

        return {
          id: person.id,
          name: person.name,
          image: person.images[0]?.url || null,
          avgRating: Math.round(avgRating * 10) / 10,
          totalRatings: person.ratings.length,
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating);

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Submit a rating
app.post("/api/rate", async (req, res) => {
  try {
    const { personId, rating } = req.body;
    const clientIP = getClientIP(req);

    if (!personId || rating === undefined) {
      return res
        .status(400)
        .json({ error: "Person ID and rating are required" });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: "Rating must be between 1 and 10" });
    }

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    // Check if user already voted (using unique constraint)
    const existingVote = await prisma.rating.findUnique({
      where: {
        personId_ipAddress: {
          personId,
          ipAddress: clientIP,
        },
      },
    });

    if (existingVote) {
      return res.status(400).json({
        error:
          "You have already voted for this person. Delete your previous vote to vote again.",
        alreadyVoted: true,
      });
    }

    // Create new rating
    await prisma.rating.create({
      data: {
        rating,
        ipAddress: clientIP,
        personId,
      },
    });

    res.json({ success: true, message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

// Delete user's vote for a person
app.delete("/api/rate/:personId", async (req, res) => {
  try {
    const { personId } = req.params;
    const clientIP = getClientIP(req);

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    // Find and delete the vote
    const existingVote = await prisma.rating.findUnique({
      where: {
        personId_ipAddress: {
          personId,
          ipAddress: clientIP,
        },
      },
    });

    if (!existingVote) {
      return res
        .status(404)
        .json({ error: "You haven't voted for this person" });
    }

    await prisma.rating.delete({
      where: { id: existingVote.id },
    });

    res.json({ success: true, message: "Vote deleted successfully" });
  } catch (error) {
    console.error("Error deleting vote:", error);
    res.status(500).json({ error: "Failed to delete vote" });
  }
});

// Admin authentication
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: "Admin access granted" });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Admin middleware
function adminAuth(req, res, next) {
  const adminPassword = req.headers["x-admin-password"];
  if (adminPassword === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Add a new person (admin only)
app.post(
  "/api/admin/people",
  adminAuth,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // Upload images to Cloudinary
      const imagePromises = req.files
        ? req.files.map((file) => uploadToCloudinary(file.buffer))
        : [];
      const uploadedImages = await Promise.all(imagePromises);

      // Create person with images in database
      const newPerson = await prisma.person.create({
        data: {
          name,
          images: {
            create: uploadedImages.map((img) => ({
              url: img.secure_url,
              publicId: img.public_id,
            })),
          },
        },
        include: {
          images: true,
        },
      });

      res.json({
        success: true,
        person: {
          id: newPerson.id,
          name: newPerson.name,
          images: newPerson.images.map((img) => img.url),
          createdAt: newPerson.createdAt,
        },
      });
    } catch (error) {
      console.error("Error adding person:", error);
      res.status(500).json({ error: "Failed to add person" });
    }
  },
);

// Add images to existing person (admin only)
app.post(
  "/api/admin/people/:id/images",
  adminAuth,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if person exists
      const person = await prisma.person.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }

      // Upload new images to Cloudinary
      const imagePromises = req.files
        ? req.files.map((file) => uploadToCloudinary(file.buffer))
        : [];
      const uploadedImages = await Promise.all(imagePromises);

      // Add images to database
      await prisma.image.createMany({
        data: uploadedImages.map((img) => ({
          url: img.secure_url,
          publicId: img.public_id,
          personId: id,
        })),
      });

      // Fetch updated person
      const updatedPerson = await prisma.person.findUnique({
        where: { id },
        include: { images: true },
      });

      res.json({
        success: true,
        person: {
          id: updatedPerson.id,
          name: updatedPerson.name,
          images: updatedPerson.images.map((img) => img.url),
        },
      });
    } catch (error) {
      console.error("Error adding images:", error);
      res.status(500).json({ error: "Failed to add images" });
    }
  },
);

// Delete a person (admin only)
app.delete("/api/admin/people/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if person exists and get their images
    const person = await prisma.person.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    // Delete images from Cloudinary
    const deletePromises = person.images.map((img) =>
      deleteFromCloudinary(img.publicId),
    );
    await Promise.all(deletePromises);

    // Delete person (cascades to images and ratings)
    await prisma.person.delete({
      where: { id },
    });

    res.json({ success: true, message: "Person deleted successfully" });
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ error: "Failed to delete person" });
  }
});

// Delete specific image from person (admin only)
app.delete("/api/admin/people/:id/images", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    // Find the image
    const image = await prisma.image.findFirst({
      where: {
        personId: id,
        url: imageUrl,
      },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(image.publicId);

    // Delete from database
    await prisma.image.delete({
      where: { id: image.id },
    });

    // Fetch updated person
    const updatedPerson = await prisma.person.findUnique({
      where: { id },
      include: { images: true },
    });

    res.json({
      success: true,
      person: {
        id: updatedPerson.id,
        name: updatedPerson.name,
        images: updatedPerson.images.map((img) => img.url),
      },
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Face Rank server running on http://localhost:${PORT}`);
});
