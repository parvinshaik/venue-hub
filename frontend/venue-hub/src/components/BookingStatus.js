import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import moment from "moment";
import apiurl from "./Api";


function BookingsList() {
    const [bookings, setBookings] = useState([]);
    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${apiurl}/bookings`);
                
                setBookings(response.data);
                console.log(response);
            } catch (error) {
                console.error("Error fetching bookings", error);
            }
        };
        fetchBookings();
    });
      useEffect(()=>{
        if(!localStorage.getItem("loginToken")){
          navigate("/");
        }
      });


    const viewBookingDetails = (bookingId) => {
        navigate(`/booking/${bookingId}`);
    };

    return (
        <div>
            <Header />
            <ToastContainer />
            <div className="container mx-auto px-4 py-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Sr. No</th>
                                <th className="px-4 py-2 text-left">Venue Name</th>
                                <th className="px-4 py-2 text-left">Activity Type</th>
                                <th className="px-4 py-2 text-left">Date (Start-End Time)</th>
                                <th className="px-4 py-2 text-left">Pending Approval</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.bookingId}>
                                    <td className="px-4 py-2">{booking.srNo}</td>
                                    <td className="px-4 py-2">{booking.venue}</td>
                                    <td className="px-4 py-2">{booking.activityType}</td>
                                    <td className="px-4 py-2">
                                        {moment(booking.date).format("D MMM YYYY")},{" "}
                                        {moment(booking.timings.split(" - ")[0], "HH:mm").format("h:mm A")} -{" "}
                                        {moment(booking.timings.split(" - ")[1], "HH:mm").format("h:mm A")}
                                    </td>

                                    <td className="px-4 py-2 text-blue-600">
                                        {booking.pending === "All Approved" ? (
                                            <span className="bg-green-200 text-green-800 py-1 px-2 rounded">All Approved</span>
                                        ) : (
                                            <span>{booking.pending}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => viewBookingDetails(booking.bookingId)} // Navigate to booking details page
                                            className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
}

export default BookingsList;
