import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import apiurl from "./Api";
import { useNavigate } from "react-router-dom";

const ApprovalsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiurl}/bookings`);
        const allBookings = response.data;

        console.log("All Bookings:", allBookings); 
        const approvedBookings = allBookings.filter((booking) => booking.pending === "All Approved");
        console.log("Approved Bookings:", approvedBookings); 

        setBookings(approvedBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(true);
      }
      finally{
        setLoading(false);
      }
    };

    fetchBookings();
  },[]);
  const navigate = useNavigate();
    useEffect(()=>{
      if(!localStorage.getItem("loginToken")){
        navigate("/");
      }
  },[]);

  return (
    <div>
      <Header loading={loading} />

      <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Approved Bookings</h1>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2">Sr. No.</th>
              <th className="border px-4 py-2">Venue</th>
              <th className="border px-4 py-2">Activity Type</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Timings</th>
              <th className="border px-4 py-2">Approval</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking,index) => (
              <tr key={booking.bookingId}>
                <td className="border px-4 py-2">{index+1}</td>
                <td className="border px-4 py-2">{booking.venue}</td>
                <td className="border px-4 py-2">{booking.activityType}</td>
                <td className="border px-4 py-2">{new Date(booking.date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{booking.timings}</td>
                <td className="border px-4 py-2">
  <div className="flex space-x-4 items-center justify-center">
    {["Coordinator", "HOD", "Principal"].map((role) => (
      <div key={role} className="flex flex-col items-center">
        <span
          className={`h-4 w-4 rounded-full ${
            booking.pending.includes(role) ? "bg-gray-300" : "bg-green-600"
          }`}
          title={role}
        ></span>
        <span className="text-xs mt-1">{role}</span>
      </div>
    ))}
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalsPage;
