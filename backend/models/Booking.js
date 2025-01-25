const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    venue: {
      type: String,
      required: [true, "Venue is required"],
      enum: ["Playground", "Seminar Hall", "Auditorium"], // Accept only these values
    },
    branchName: {
      type: String,
      required: [true, "Branch name is required"],
    },
    activityType: {
      type: String,
      required: [true, "Activity type is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    timings: {
      start: {
        type: String,
        required: [true, "Start time is required"],
      },
      end: {
        type: String,
        required: [true, "End time is required"],
      },
    },
    studentsAttending: {
      type: Number,
      required: [true, "Number of students attending is required"],
      min: [1, "Number of students must be at least 1"],
    },
    coordinator: {
      name: {
        type: String,
        required: [true, "Coordinator name is required"],
      },
      email: {
        type: String,
        required: [true, "Coordinator email is required"],
        match: [/.+@.+\..+/, "Coordinator email must be valid"],
      },
      designation: {
        type: String,
        required: [true, "Coordinator designation is required"],
      },
      department: {
        type: String,
        required: [true, "Coordinator department is required"],
      },
    },
    hod: {
      name: {
        type: String,
        required: [true, "HOD name is required"],
      },
      email: {
        type: String,
        required: [true, "HOD email is required"],
        match: [/.+@.+\..+/, "HOD email must be valid"],
      },
    },
    principal: {
      name: {
        type: String,
        required: [true, "Principal name is required"],
      },
      email: {
        type: String,
        required: [true, "Principal email is required"],
        match: [/.+@.+\..+/, "Principal email must be valid"],
      },
    },
    requirements: {
      ac: { type: Boolean, default: false },
      paSystem: { type: Boolean, default: false },
      digitalScreen: { type: Boolean, default: false },
      projector: { type: Boolean, default: false },
      generator: { type: Boolean, default: false },
    },
    approvalStatus: {
      coordinator: { type: Boolean, default: false },
      hod: { type: Boolean, default: false },
      principal: { type: Boolean, default: false },
      user: { type: Boolean, default: false },
    },
    isApproved: {
      type: Boolean,
      default: false, 
    },
    requestor_email:{
      type: String,
      required: [true, "Requestor email is required"],
      match: [/.+@.+\..+/, "Requestor email must be valid"],
    }
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Booking", BookingSchema);
