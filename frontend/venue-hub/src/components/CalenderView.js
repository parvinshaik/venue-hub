import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import apiurl from "./Api";

const localizer = momentLocalizer(moment);

const VenueCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${apiurl}/bookings`);
        const bookings = response.data;

        console.log("API Response:", bookings); 

        const calendarEvents = bookings.map((booking) => {
          if (!booking.date || !booking.timings) {
            console.error("Missing or invalid date/timings:", booking);
            return null;
          }

          const [startTime, endTime] = booking.timings.split(" - ");

          if (!startTime || !endTime) {
            console.error("Invalid timings format:", booking);
            return null;
          }

          const date = moment(booking.date).local().format("YYYY-MM-DD");
          const startDateTime = moment(`${date} ${startTime}`, "YYYY-MM-DD HH:mm").local();
          const endDateTime = moment(`${date} ${endTime}`, "YYYY-MM-DD HH:mm").local();

          if (!startDateTime.isValid() || !endDateTime.isValid()) {
            console.error("Invalid start or end date:", booking);
            return null;
          }

          return {
            title: booking.venue || "Unknown Venue", 
            start: startDateTime.toDate(),
            end: endDateTime.toDate(),
            isApproved: booking.pending === "All Approved" ? true :  false,
          };
        });

        setEvents(calendarEvents.filter((event) => event !== null));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);


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
        eventPropGetter={eventPropGetter} 
        views={["month", "week", "day", "agenda"]}
        defaultView="day"
      />
    </div>
  );
};

export default VenueCalendar;
