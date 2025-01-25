import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";
import moment from "moment";

const VenueBarChart = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("https://06d2-103-232-27-107.ngrok-free.app/api/user/bookings");
        const bookings = response.data;

        const now = moment().local(); // Current time in local timezone
        const futureTime = moment(now).add(4, "hours"); // Rename to `futureTime` for clarity

        const venues = ["Playground", "Seminar Hall", "Auditorium"];
        const availability = venues.map((venue) => {
          const isAvailable = !bookings.some((booking) => {
            if (!booking.timings || !booking.date) {
              return false;
            }

            // Split timings into start and end
            const [startTime, endTimeString] = booking.timings.split(" - ");
            const bookingDate = moment(booking.date).local(); // Convert booking date to local time

            // Create full datetime for start and end
            const bookingStartTime = moment(
              `${bookingDate.format("YYYY-MM-DD")} ${startTime}`,
              "YYYY-MM-DD HH:mm"
            );
            const bookingEndTime = moment(
              `${bookingDate.format("YYYY-MM-DD")} ${endTimeString}`,
              "YYYY-MM-DD HH:mm"
            );

            // Check for overlap with the current 4-hour window
            return (
              booking.venue === venue &&
              now.isBefore(bookingEndTime) &&
              bookingStartTime.isBefore(futureTime)
            );
          });

          return { venue, isAvailable };
        });

        // Prepare chart data
        const labels = availability.map((a) => a.venue);
        const data = availability.map((a) => (a.isAvailable ? 1 : 0)); // 1 for available, 0 for booked
        const backgroundColors = availability.map((a) => (a.isAvailable ? "green" : "red"));

        setChartData({
          labels,
          datasets: [
            {
              label: "Venue Availability (Next 4 Hours)",
              data,
              backgroundColor: backgroundColors,
              hoverBackgroundColor: backgroundColors,
            },
          ],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings data:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>There was an error loading the data. Please try again later.</p>;
  }

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Venue Availability for Next 4 Hours",
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (value) => (value === 1 ? "Available" : "Booked"),
              },
              beginAtZero: true,
              max: 1,
            },
          },
        }}
      />
    </div>
  );
};

export default VenueBarChart;
