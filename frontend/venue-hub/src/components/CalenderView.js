import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";

const localizer = momentLocalizer(moment);

const VenueCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user/bookings");
        const bookings = response.data;

        console.log("API Response:", bookings); // Debugging: Check API response structure

        const calendarEvents = bookings.map((booking) => {
          // Ensure `timings` and `date` exist and are valid
          if (!booking.date || !booking.timings) {
            console.error("Missing or invalid date/timings:", booking);
            return null;
          }

          // Extract start and end times from the timings string
          const [startTime, endTime] = booking.timings.split(" - ");

          // Ensure the times are valid
          if (!startTime || !endTime) {
            console.error("Invalid timings format:", booking);
            return null;
          }

          // Format the `start` and `end` times properly by combining with the date
          const date = moment(booking.date).local().format("YYYY-MM-DD"); // Convert to local time
          const startDateTime = moment(`${date} ${startTime}`, "YYYY-MM-DD HH:mm").local();
          const endDateTime = moment(`${date} ${endTime}`, "YYYY-MM-DD HH:mm").local();

          // Check if `startDateTime` and `endDateTime` are valid
          if (!startDateTime.isValid() || !endDateTime.isValid()) {
            console.error("Invalid start or end date:", booking);
            return null;
          }

          // Return the event object
          return {
            title: booking.venue || "Unknown Venue", // Use a fallback for missing title
            start: startDateTime.toDate(),
            end: endDateTime.toDate(),
            isApproved: booking.pending === "All Approved" ? true :  false, // Default to false if not present
          };
        });

        // Filter out invalid events
        setEvents(calendarEvents.filter((event) => event !== null));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  // Custom event style based on approval status
  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: event.isApproved ? "green" : "red",
        color: "white",
        borderRadius: "5px",
        border: "none",
        padding: "2px 5px",
      },
    };
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventPropGetter} // Apply custom styles
        views={["month", "week", "day", "agenda"]} // Enable multiple views
        defaultView="day" // Set default view to Agenda
      />
    </div>
  );
};

export default VenueCalendar;
