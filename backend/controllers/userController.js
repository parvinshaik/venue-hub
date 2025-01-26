const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const nodemailer = require("nodemailer");
const axios = require('axios');
const randomstring = require('randomstring');
require("dotenv").config();
const _email = process.env.EMAIL
const _password = process.env.EMAIL_PASSWORD
const BookingController = require("./bookingController");

const Booking = require("../models/Booking");

const signup = async (req, res) => {
  try {
    const { name, email, roll, password } = req.body;
    console.log(req.body);


    if (!name || !email || !roll || !password) {
      return res.status(400).json({ message: "Please fill all the required details" });
    }

    const hasNumber = /\d/;
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
    const hasUpperCase = /[A-Z]/;

    if (password.length < 7) {
      return res.status(400).json({ message: "Password must be at least 7 characters long" });
    }

    if (!hasNumber.test(password) || !hasSpecialCharacter.test(password) || !hasUpperCase.test(password)) {
      return res.status(400).json({
        message: "Password must include at least one uppercase letter, one special character, and one number",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const userDetails = {
      name,
      email,
      roll,
      password, 
      approved_user: false, 
    };

    const newUser = await User.create(userDetails);
    const userId = newUser._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const adminEmail = "venuebooking.adm.mictech@gmail.com";

    const approveToken = jwt.sign({ userId, action: "approve" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
    const denyToken = jwt.sign({ userId, action: "deny" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });

    const approveLink = `${process.env.BASE_URL}/admin/action/${approveToken}`;
    const denyLink = `${process.env.BASE_URL}/admin/action/${denyToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: adminEmail,
      subject: `Approve or Deny User Request`,
      html: `
        <p>A user has been registered and waiting for approval. Below are the details:</p>
        <ul>
          <li><strong>User ID:</strong> ${user._id}</li>
          <li><strong>Name:</strong> ${user.name}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Roll:</strong> ${user.roll}</li>
        </ul>





        <p>Click one of the following options:</p>
        <a href="${approveLink}" target="_blank" style="color: green;">Approve User</a><br>
        <a href="${denyLink}" target="_blank" style="color: red;">Deny User</a>
        <p>Note: This link will expire in 7 days.</p>

         <p>Thank you,</p>
     
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, roll: newUser.roll },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred during registration" });
  }
};


const AdminAction = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { userId, action } = decoded;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    let statusMessage = "";
    if (action === "approve") {
      user.approved_user = true;
      statusMessage = "Your account has been approved!";
    } else if (action === "deny") {
      user.approved_user = false;
      statusMessage = "Your account request has been denied.";
    } else {
      return res.status(400).send("Invalid action");
    }

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: `Account Status Update`,
      html: `
       <p>Dear ${user.name},</p>
      <p>${statusMessage}</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <br/>
      <br/>
      <p>Thanks and regards,</p>
      <p><strong>Admin Team @Venue Hub</strong></p>
      <p>DVR & Dr. HS MIC College of Technology</p>
      <p>Email: <a href="mailto:venuebooking.adm.mictech@gmail.com">venuebooking.adm.mictech@gmail.com</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).send(`User ${action}d successfully! The user has been notified.`);
  } catch (err) {
    console.error(err);
    return res.status(400).send("Invalid or expired link");
  }
}


const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Fill all details" });
    }
    const isUser = await User.findOne({ email: email, password: password });
    if (isUser) {
      const isPasswordValid = true;

      if (isPasswordValid) {
        const accessToken = await jwt.sign(
          { userId: isUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).json({
          message: "Login successful",
          name: isUser.name,
          token: accessToken,
          approved_user: isUser.approved_user
        });
      } else {
        return res.status(401).json({ message: "Invalid Credentials" });
      }
    } else {
      return res.status(404).json({ message: "User Not Found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



const bookVenue = async (req, res) => {
  try {
    const {
      venue,
      branchName,
      activityType,
      date,
      timings,
      studentsAttending,
      coordinator,
      hod,
      principal,
      requirements,
      token
    } = req.body;

    if (
      !venue ||
      !branchName ||
      !activityType ||
      !date ||
      !timings.start ||
      !timings.end ||
      !studentsAttending ||
      !coordinator?.name ||
      !coordinator?.email ||
      !coordinator?.designation ||
      !coordinator?.department ||
      !hod?.name ||
      !hod?.email ||
      !principal?.name ||
      !principal?.email
    ) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const emailRegex = /.+@.+\..+/;

    if (!emailRegex.test(coordinator.email)) {
      return res.status(400).json({ message: "Coordinator email is invalid" });
    }

    if (!emailRegex.test(hod.email)) {
      return res.status(400).json({ message: "HOD email is invalid" });
    }

    if (!emailRegex.test(principal.email)) {
      return res.status(400).json({ message: "Principal email is invalid" });
    }

    if (studentsAttending < 1) {
      return res
        .status(400)
        .json({ message: "Number of students attending must be at least 1" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const userId = decoded.userId;

    const user = await User.findById(userId);

    const newBooking = await Booking.create({
      venue,
      branchName,
      activityType,
      date,
      timings,
      studentsAttending,
      coordinator,
      hod,
      principal,
      requirements,
      approvalStatus: {
        coordinator: false,
        hod: false,
        principal: false,
        user: false,
      },
      isApproved: false,
      requestor_email: user.email
    });

    await BookingController.sendApprovalEmail(newBooking._id, "coordinator");
    return res.status(200).json({
      message: "Booking successfully created",
      booking: newBooking,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });;
    const bookingsData = bookings.map((booking, index) => {
      const { venue, activityType, date, timings, approvalStatus } = booking;

      let pending = [];
      if (!approvalStatus.coordinator) pending.push("Coordinator");
      if (!approvalStatus.hod) pending.push("HOD");
      if (!approvalStatus.principal) pending.push("Principal");

      return {
        srNo: index + 1,
        venue,
        activityType,
        date,
        timings: `${timings.start} - ${timings.end}`,
        pending: pending.length ? pending.join(", ") : "All Approved",
        bookingId: booking._id,
      };
    });

    return res.status(200).json(bookingsData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching bookings" });
  }
};
const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching booking details" });
  }
};




module.exports = {
  signup,
  signin,
  bookVenue,
  getAllBookings,
  getBookingDetails,
  AdminAction

};