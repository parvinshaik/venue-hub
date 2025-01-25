import * as React from 'react';
import Header from './Header';
import { PieChart } from '@mui/x-charts/PieChart';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CalenderView from './CalenderView';
import VenueBarChart from './VenueBarChart';

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const[approved, setapproved] = useState(0);
  const [underprogress, setunderprogress] = useState(0);
  const [pending, setpending] = useState(0);

  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("https://803e-103-232-27-107.ngrok-free.app/api/user/bookings");
        setBookings(response.data);
        console.log(response.data);
        response.data.forEach((booking)=>{
          if(booking.Pending == "All Approved"){
            setapproved(approved+ 1);
          }
          else if(booking.pending == "Coordinator, HOD, Principal"){
            setpending(pending + 1);
          }
          else{
            setunderprogress(underprogress + 1);
          }
        });
      } catch (error) {
        console.error("Error fetching bookings", error);
      }
    };
    fetchBookings();
  }, []);

 

  return (
    <div>

      <Header />
      <div className='flex flex-row'>
      <div className='flex flex-col mt-14 ml-10 mr-40 '>
      <div className='mb-32'>
      <h6 className='font-mono text-center text-gray-700 '>Overall Booking Status - Till date</h6>
        <PieChart
          series={[
            {
              data: [
                { id: 0, value: approved, label: 'Approved' },
                { id: 1, value: underprogress, label: 'Under Progress' },
                { id: 2, value: pending, label: 'Pending' },
              ],
            },
          ]}
          width={500}
          height={200}
        />
      </div>
      <VenueBarChart/>
      </div>

      <div className='m-10  border-1 mt-40 p-2 bg-white text-black font-semibold rounded-lg border-4 border-blue-600'>
        <CalenderView/>
      </div>
      </div>
    </div>
  );
}
export default Dashboard;
