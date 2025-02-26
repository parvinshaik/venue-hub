import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiurl from "./Api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    const uid = localStorage.getItem("userid");
    setUserId(uid);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`${apiurl}/change-password/${userId}`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success(response.data.message);
     // Redirect to home or profile page
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || "Error updating password");
    }
    finally{
        setLoading(false);
    }
  };

  return (
    <div>
      <Header loading={loading} />
      <div className="bg-gray-100 h-screen">
        <div className="flex flex-col items-center justify-center pt-10">
          <ToastContainer />
          <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">
              Change Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter Current Password"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter New Password"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
                className="w-full p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
