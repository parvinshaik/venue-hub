import React, { useState, useEffect } from "react";
import Header from './Header';
import { ToastContainer, toast } from 'react-toastify';
import apiurl from "./Api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BookingForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    venue: "",
    branchName: "",
    activityType: "",
    date: "",
    timings: { start: "", end: "" },
    studentsAttending: 0,
    coordinator: {
      name: "",
      email: "",
      designation: "",
      department: "",
    },
    hod: {
      name: "",
      email: "",
    },
    principal: {
      name: "",
      email: "",
    },
    requirements: {
      ac: false,
      paSystem: false,
      digitalScreen: false,
      projector: false,
      generator: false,
    },
    token: "",
  });

  const [availcheck, setavailcheck] = useState(3);
  useEffect(() => {
    if (!localStorage.getItem("loginToken")) {
      navigate("/");
    }
  }, []);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("requirement_")) {
      setFormData((prev) => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [name.split("_")[1]]: checked,
        },
      }));
    } else if (name.includes("coordinator_")) {
      setFormData((prev) => ({
        ...prev,
        coordinator: {
          ...prev.coordinator,
          [name.split("_")[1]]: value,
        },
      }));
    } else if (name.includes("hod_")) {
      setFormData((prev) => ({
        ...prev,
        hod: {
          ...prev.hod,
          [name.split("_")[1]]: value,
        },
      }));
    } else if (name.includes("principal_")) {
      setFormData((prev) => ({
        ...prev,
        principal: {
          ...prev.principal,
          [name.split("_")[1]]: value,
        },
      }));
    } else if (name === "timings_start" || name === "timings_end") {
      setFormData((prev) => ({
        ...prev,
        timings: {
          ...prev.timings,
          [name.split("_")[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "number" ? +value : value }));
    }
  };

  const checkVenue = async (e) => {
    e.preventDefault();
  setLoading(true);
    if (formData.date === "" || formData.timings.start === "" || formData.timings.end === "") {
      alert("Please enter a valid date and time");
      return;
    }
  
    try {
      const response = await axios.get(`${apiurl}/bookings`);
      const bookings = response.data;
      console.log(bookings);
  
      setavailcheck(4); 
  
      let isAvailable = true;
  
      for (const booking of bookings) {
        const existingDate = booking.date.split("T")[0]; 
  
        if (existingDate === formData.date) {
          const [existingStart, existingEnd] = booking.timings.split(" - ");
  
          const newStart = formData.timings.start;
          const newEnd = formData.timings.end;
  
          if (
            (newStart >= existingStart && newStart < existingEnd) || 
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd) 
          ) {
            isAvailable = false;
            break; 
          }
        }
      }
  
      setavailcheck(isAvailable ? 1 : 2); 
      console.log(isAvailable ? "Available" : "Unavailable");
    } catch (error) {
      console.error("Error fetching bookings", error);
    }
    finally{
      setLoading(false);
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(availcheck != 1){
      alert("Please check venue availability");
      return;
    }
    console.log("Submitted Data:", formData);
    const usertoken = await localStorage.getItem("loginToken");
    formData.token = usertoken;
    setLoading(true);
    try {
      const response = await fetch(`${apiurl}/book-venue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result) {
        toast.success("Venue Booking has been successfully Submitted. Redirecting to booking history");
        setTimeout(()=>{
          navigate("/bookingstatus");
        },3000)
        
      }
      console.log("API Response:", result);
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
    finally{
      setLoading(false);
    }
  };



  return (
    <div className="">
      <Header loading={loading} />
      <ToastContainer />
      <div className="p-6 bg-white rounded-sm mt-4 border-1 border-gray-400 overflow-y-hidden">
        <div className=" w-full bg-[#2575fc] text-white font-bold text-lg py-2 px-4 rounded-t-lg">
          Application for Booking of <span className="capitalize">{formData.venue || "Venue"}</span>
        </div>

        <form className="space-y-6">
          <div className="flex justify-between items-center mt-4">
            <label className="font-semibold w-1/3">Select a Venue:</label>
            <select
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-2/3 p-2 border rounded"
              required
            >
              <option value="-">-- Select --</option>
              <option value="Playground">Playground</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Seminar Hall-CSE">Seminar Hall-CSE</option>
              <option value="Seminar Hall-ECE">Seminar Hall-ECE</option>
              <option value="Seminar Hall-EEE">Seminar Hall-EEE</option>
              <option value="Party Area">Party Area</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Name of the Branch:</label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Type of Activity:</label>
              <input
                type="text"
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Date of Programme/Activity:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block font-semibold mb-1">Start Time:</label>
                <input
                  type="time"
                  name="timings_start"
                  value={formData.timings.start}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">End Time:</label>
                <input
                  type="time"
                  name="timings_end"
                  value={formData.timings.end}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <label className={`block font-semibold mb-1 mt-6 ${ availcheck == 1? 'text-green-600' : 'text-red-500'}`} >{
              availcheck == 1 ? "Venue is Available" : availcheck == 2 ? "Venue Not available" : availcheck==4 ? "Checking Please wait!" : "Kindly Check availability before proceeding" }
              </label>
              <div>
              <label className="block font-semibold mb-1"></label>
                <button
                onClick={(e)=>{checkVenue(e)}}
                  className="bg-green-700 text-white py-2 mt-6 w-48 rounded hover:bg-green-800"
                >
                  Check Venue Availability
                </button>
              </div>
              
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">No. of Students Attending:</label>
            <input
              type="number"
              name="studentsAttending"
              value={formData.studentsAttending}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <h3 className="font-bold mb-2">Details of Coordinator:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Name:</label>
                <input
                  type="text"
                  name="coordinator_name"
                  value={formData.coordinator.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email:</label>
                <input
                  type="email"
                  name="coordinator_email"
                  value={formData.coordinator.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Designation:</label>
                <input
                  type="text"
                  name="coordinator_designation"
                  value={formData.coordinator.designation}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Department:</label>
                <input
                  type="text"
                  name="coordinator_department"
                  value={formData.coordinator.department}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Details of HOD:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Name:</label>
                <input
                  type="text"
                  name="hod_name"
                  value={formData.hod.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email:</label>
                <input
                  type="email"
                  name="hod_email"
                  value={formData.hod.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Details of Principal:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Name:</label>
                <input
                  type="text"
                  name="principal_name"
                  value={formData.principal.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email:</label>
                <input
                  type="email"
                  name="principal_email"
                  value={formData.principal.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Requirements:</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "AC's", key: "ac" },
                { label: "PA System", key: "paSystem" },
                { label: "Digital Screen", key: "digitalScreen" },
                { label: "Projector", key: "projector" },
                { label: "Generator (Backup Supply)", key: "generator" },
              ].map((req) => (
                <label key={req.key} className="flex items-center">
                  <input
                    type="checkbox"
                    name={`requirement_${req.key}`}
                    checked={formData.requirements[req.key]}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {req.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-red-600 w-96 mr-20 text-white py-2 px-6 rounded hover:brown-400"
            >
              Clear all Fields
            </button>
            <button
              type="submit"
              onClick={(e)=>{handleSubmit(e)}}
              className="bg-blue-600 w-96 text-white py-2 px-6 rounded hover:bg-[#6a11cb]"
            >
              Submit
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
