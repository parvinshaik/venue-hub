import * as React from 'react';
import Header from './Header';
import { Gauge } from '@mui/x-charts/Gauge';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CalenderView from './CalenderView';
import VenueBarChart from './VenueBarChart';
import apiurl from "./Api";
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [approved, setApproved] = useState(0);
  const [pendingCoordinator, setPendingCoordinator] = useState(0);
  const [pendingHOD, setPendingHOD] = useState(0);
  const [pendingPrincipal, setPendingPrincipal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiurl}/bookings`);
        console.log("Gauge chart data", response.data);

        let approvedCount = 0;
        let coordinatorCount = 0;
        let hodCount = 0;
        let principalCount = 0;

        response.data.forEach((booking) => {
          if (booking.pending === "All Approved") {
            approvedCount++;
          } if (booking.pending.includes("Coordinator")) {
            coordinatorCount++;
          }  if (booking.pending.includes("HOD")) {
            hodCount++;
          } if (booking.pending.includes("Principal")) {
            principalCount++;
          }
        });

        setApproved(approvedCount);
        setPendingCoordinator(coordinatorCount);
        setPendingHOD(hodCount);
        setPendingPrincipal(principalCount);
      } catch (error) {
        console.error("Error fetching bookings", error);
      }
      finally{
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);
  const navigate = useNavigate();
  useEffect(()=>{
    if(!localStorage.getItem("loginToken")){
      navigate("/");
    }
  },[]);

  return (
    <div>

      <Header loading={loading} />
      <div className='flex flex-row h-fit'>
      <div className='flex flex-col mt-14 ml-10 mr-40 '>
      <div className='mb-10'>
      <h6 className='font-semibold text-center text-gray-700 '>Overall Booking Status - Till date</h6>
        <div className='flex flex-col mx-20 mt-10'>
        <div className='flex flex-row mb-4 space-x-10'>
            <div className='flex flex-col text-center'>
              <p2 for="all_approved" className='font-mono text-center text-gray-700'> All Approved</p2>
              <Gauge name='all_approved' width={150} height={150}  value={approved} label='' />
              </div>
              <div className='flex flex-col text-center'>
              <p2 for="all_approved" className='font-mono text-center text-gray-700'>Pending at Coordinator</p2>
              <Gauge width={150} height={150} value={pendingCoordinator} max={10} label='' />
              </div>
              
        </div>
        <div className='flex flex-row mt-4 space-x-10'>
        <div className='flex flex-col text-center'>
              <p2 for="all_approved" className='font-mono text-center text-gray-700'>Pending at HOD</p2>
              <Gauge width={150} height={150} value={pendingHOD} max={10} label='' />
              </div>
              <div className='flex flex-col text-center'>
              <p2 for="all_approved" className='font-mono text-center text-gray-700'>Pending at Principal</p2>
              <Gauge width={150} height={150} value={pendingPrincipal} max={10} label='' />
              </div>
        </div>
        </div>
      </div>
      <VenueBarChart/>
      </div>

      <div className='border-1 self-center p-2 bg-white text-black font-semibold rounded-lg border-4 border-blue-600'>
        <CalenderView/>
      </div>
      </div>
    </div>
  );
}
export default Dashboard;
