import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+91 9876543210",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Here you can call API to save changes
    console.log("Updated Profile:", formData);
    navigate(-1); // go back to previous page (profile tab)
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Edit Profile</h2>

      <label className="flex flex-col text-sm sm:text-base">
        Name
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 p-2 border rounded"
        />
      </label>

      <label className="flex flex-col text-sm sm:text-base">
        Email
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 p-2 border rounded"
        />
      </label>

      <label className="flex flex-col text-sm sm:text-base">
        Phone
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 p-2 border rounded"
        />
      </label>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-system-primary text-white rounded hover:bg-system-primary-dark transition"
        >
          Save
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
