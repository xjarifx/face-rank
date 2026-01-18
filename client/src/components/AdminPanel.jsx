import { useState, useRef } from "react";
import { useAdmin } from "../context/AdminContext";
import { useToast } from "../context/ToastContext";
import { addPerson, addImagesToPerson, deletePerson } from "../api";

export function AdminPanel({ people, onRefresh }) {
  const { adminPassword, logoutAdmin } = useAdmin();
  const { showToast } = useToast();
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

  const handleDeletePerson = async (personId) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    try {
      await deletePerson(personId, adminPassword);
      showToast("Person deleted successfully!", "success");
      onRefresh();
    } catch (err) {
      showToast("Error deleting person", "error");
    }
  };

  const defaultImage =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/></svg>';

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-5 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-100">👑 Admin Panel</h2>
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
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Person's name"
          className="w-full p-3 border-2 border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-400 rounded-lg text-base mb-3 focus:outline-none focus:border-cyan-400"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="mb-4 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-200 hover:file:bg-cyan-500/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white rounded-lg font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 cursor-pointer"
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
                className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={person.images[0] || defaultImage}
                    alt={person.name}
                    className="w-14 h-14 object-cover rounded-full"
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
