import { useState, useRef } from "react";
import { useAdmin } from "../context/AdminContext";
import { useToast } from "../context/ToastContext";
import {
  addPerson,
  addImagesToPerson,
  deletePerson,
  deletePersonImage,
} from "../api";

export function AdminPanel({ people, onRefresh }) {
  const { adminPassword, logoutAdmin } = useAdmin();
  const { showToast, showConfirm } = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a name", "error");
      return;
    }

    const files = fileInputRef.current?.files || [];
    setLoading(true);

    try {
      await addPerson(name, files, adminPassword);
      setName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Person added successfully!", "success");
      onRefresh();
    } catch (err) {
      showToast("Error adding person", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddImages = async (personId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = async () => {
      if (!input.files?.length) return;
      try {
        await addImagesToPerson(personId, input.files, adminPassword);
        showToast("Images added successfully!", "success");
        onRefresh();
      } catch (err) {
        showToast("Error adding images", "error");
      }
    };

    input.click();
  };

  const handleDeletePerson = (personId) => {
    showConfirm("Delete this person and all their images?", {
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await deletePerson(personId, adminPassword);
          showToast("Person deleted successfully!", "success");
          onRefresh();
        } catch (err) {
          showToast("Error deleting person", "error");
        }
      },
    });
  };

  const handleDeleteImage = (personId, imageUrl) => {
    showConfirm("Remove this image from the person?", {
      confirmLabel: "Remove",
      onConfirm: async () => {
        try {
          await deletePersonImage(personId, imageUrl, adminPassword);
          showToast("Image removed successfully!", "success");
          onRefresh();
        } catch (err) {
          showToast("Error removing image", "error");
        }
      },
    });
  };

  const defaultImage =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/></svg>';

  return (
    <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 mb-5 shadow-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">👑 Admin Panel</h2>
          <p className="text-sm text-slate-400">
            Manage profiles, images, and voting data.
          </p>
        </div>
        <button
          onClick={logoutAdmin}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-400 cursor-pointer shadow-sm"
        >
          Logout Admin
        </button>
      </div>

      {/* Add Person Form */}
      <form
        onSubmit={handleAddPerson}
        className="bg-slate-800/80 p-5 rounded-xl mb-5 border border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-300 mb-4">
          Add New Person
        </h3>
        <div className="grid gap-3 md:grid-cols-[1.2fr_1fr] md:items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Person's name"
            className="w-full p-3 border-2 border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-400 rounded-lg text-base focus:outline-none focus:border-cyan-400"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-200 hover:file:bg-cyan-500/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Adding..." : "Add Person"}
        </button>
      </form>

      {/* Manage People */}
      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-4">
          Manage People
        </h3>
        {people.length === 0 ? (
          <p className="text-slate-400">No people added yet.</p>
        ) : (
          <div className="space-y-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={person.images[0] || defaultImage}
                      alt={person.name}
                      className="w-14 h-14 object-cover rounded-full ring-2 ring-cyan-500/30"
                    />
                    <div>
                      <strong className="text-slate-100">{person.name}</strong>
                      <br />
                      <small className="text-slate-400">
                        {person.images.length} images | {person.totalRatings}{" "}
                        ratings
                      </small>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddImages(person.id)}
                      className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-400 cursor-pointer"
                    >
                      + Images
                    </button>
                    <button
                      onClick={() => handleDeletePerson(person.id)}
                      className="px-3 py-2 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-400 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {person.images.length === 0 ? (
                    <span className="text-slate-500 text-sm">
                      No images available.
                    </span>
                  ) : (
                    person.images.map((imageUrl, index) => (
                      <div
                        key={`${person.id}-${index}`}
                        className="relative group"
                      >
                        <img
                          src={imageUrl}
                          alt={`${person.name} ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg ring-1 ring-slate-700"
                        />
                        <button
                          onClick={() => handleDeleteImage(person.id, imageUrl)}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
