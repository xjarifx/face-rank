const API_BASE = "";

export async function fetchPeople() {
  const response = await fetch(`${API_BASE}/api/people`);
  if (!response.ok) throw new Error("Failed to fetch people");
  return response.json();
}

export async function fetchLeaderboard() {
  const response = await fetch(`${API_BASE}/api/leaderboard`);
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return response.json();
}

export async function submitRating(personId, rating) {
  const response = await fetch(`${API_BASE}/api/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, rating }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Failed to submit rating");
    error.alreadyVoted = data.alreadyVoted;
    throw error;
  }
  return data;
}

export async function deleteVote(personId) {
  const response = await fetch(`${API_BASE}/api/rate/${personId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete vote");
  return response.json();
}

export async function loginAdmin(password) {
  const response = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error("Invalid password");
  return response.json();
}

export async function addPerson(name, images, adminPassword) {
  const formData = new FormData();
  formData.append("name", name);
  for (const image of images) {
    formData.append("images", image);
  }

  const response = await fetch(`${API_BASE}/api/admin/people`, {
    method: "POST",
    headers: { "X-Admin-Password": adminPassword },
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to add person");
  return response.json();
}

export async function addImagesToPerson(personId, images, adminPassword) {
  const formData = new FormData();
  for (const image of images) {
    formData.append("images", image);
  }

  const response = await fetch(
    `${API_BASE}/api/admin/people/${personId}/images`,
    {
      method: "POST",
      headers: { "X-Admin-Password": adminPassword },
      body: formData,
    },
  );
  if (!response.ok) throw new Error("Failed to add images");
  return response.json();
}

export async function deletePerson(personId, adminPassword) {
  const response = await fetch(`${API_BASE}/api/admin/people/${personId}`, {
    method: "DELETE",
    headers: { "X-Admin-Password": adminPassword },
  });
  if (!response.ok) throw new Error("Failed to delete person");
  return response.json();
}
