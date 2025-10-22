import React from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate("/customer/profile/edit"); // navigate to edit page
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl sm:text-2xl font-bold">Customer Profile</h2>
      <p className="text-sm sm:text-base">Name: John Doe</p>
      <p className="text-sm sm:text-base">Email: johndoe@example.com</p>
      <p className="text-sm sm:text-base">Phone: +91 9876543210</p>

      <button
        onClick={handleEdit}
        className="mt-4 px-4 py-2 bg-system-primary text-white rounded hover:bg-system-primary-dark transition"
      >
        Edit Profile
      </button>
    </div>
  );
};

export default Profile;
