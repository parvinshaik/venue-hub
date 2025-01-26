import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Header from './Header';
import apiurl from "./Api";
import { useNavigate } from "react-router-dom";

function BookingDetailsPage() {
  const { bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(`${apiurl}/bookings/${bookingId}`);
        setBookingDetails(response.data);
      } catch (error) {
        console.error("Error fetching booking details", error);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  const navigate = useNavigate();
    useEffect(()=>{
      if(!localStorage.getItem("loginToken")){
        navigate("/");
      }
    });

  if (!bookingDetails) return <div className="flex justify-center items-center h-screen"><div className="loader"></div></div>;

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-6 font-medium bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-left text-blue-600">Booking Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-b">
            <p className="text-lg"><strong>Venue:</strong> {bookingDetails.venue}</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-lg"><strong>Branch Name:</strong> {bookingDetails.branchName}</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-lg"><strong>Activity Type:</strong> {bookingDetails.activityType}</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-lg"><strong>Date:</strong> {bookingDetails.date}</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-lg"><strong>Timings:</strong> {bookingDetails.timings.start} - {bookingDetails.timings.end}</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-lg"><strong>Coordinator:</strong> {bookingDetails.coordinator.name} ({bookingDetails.coordinator.email})</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-lg"><strong>HOD:</strong> {bookingDetails.hod.name} ({bookingDetails.hod.email})</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-lg"><strong>Principal:</strong> {bookingDetails.principal.name} ({bookingDetails.principal.email})</p>
          </div>
          <div className="p-4 border-b flex flex-row">
            <p className="text-lg">
              <strong>Requirements:</strong>
            </p>
            <ul className="ml-4">
              {Object.keys(bookingDetails.requirements).map((val) => (
                <li key={val}>{val}</li>
              ))}
            </ul>
           
          </div>

        </div>
      </div>
    </div>
  );
}

export default BookingDetailsPage;