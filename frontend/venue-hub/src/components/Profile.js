import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiurl from "./Api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from './Header';

const UpdateUser = () => {
    const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roll: "",
    password: "",
    approved_user: true,
  });

  useEffect(() => {
    setLoading(true);
    const uid = localStorage.getItem('userid');
    setUserId(uid);
    axios
      .get(`${apiurl}/${uid}`)
      .then((res) => {
        const { name, email, roll } = res.data;
        setFormData({ name, email, roll, password: "", approved_user: true});
        console.log(res);
      })
      .catch((err) => console.error("Error fetching user:", err)).finally(
        setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`${apiurl}/update/${userId}`, { ...formData, approved_user: true });
      console.log(response);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Error updating user");
    }
    finally{
        setLoading(false);
    }
  };

  return (
    <div>
   <Header loading={loading}/>
   <div className="bg-gray-100 h-screen">
    <div className="flex flex-col items-center justify-center pt-10">
      <ToastContainer />
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">My Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="roll"
            value={formData.roll}
            onChange={handleChange}
            placeholder="Roll Number"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter current Password"
            className="w-full p-2 border rounded"
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
        </form>
      </div>
    </div>
    </div>
    </div>
  );
};

export default UpdateUser;