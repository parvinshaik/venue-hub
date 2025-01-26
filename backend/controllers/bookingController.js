const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Booking = require("../models/Booking"); 
const { generatePDFAndSendEmail } = require("./GeneratePDF");
require("dotenv").config();

const getNextStage = (currentStage) => {
  const stages = ["coordinator", "hod", "principal"];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
};

const approveBooking = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { bookingId, stage } = decoded;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    
    booking.approvalStatus[stage] = true;

    
    const nextStage = getNextStage(stage);

    if (nextStage) {
      await booking.save();
      
      await sendApprovalEmail(bookingId, nextStage);
      return res.status(200).json({ message: `Booking approved by ${stage}. Email sent to ${nextStage}.` });
    } else {

      booking.isApproved = true;
      await booking.save();
      await generatePDFAndSendEmail(bookingId);
      return res.status(200).json({ message: "Booking fully approved!. Application form generation in progress. Kindly wait for few minutes to recieve in mail." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving booking" });
  }
};

const denyBooking = async (req, res) => {
  try {
    const { token } = req.params;

    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { bookingId, stage } = decoded;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    
    const approvedStages = Object.keys(booking.approvalStatus).filter((key) => booking.approvalStatus[key]);
    const emails = approvedStages.map((key) => booking[key].email);

    emails.push(booking.coordinator.email, "venuebooking.adm.mictech@gmail.com");

  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: emails,
      subject: `Booking Rejected - ${booking.venue}`,
      html: `
        <p>The booking request for the following details has been rejected by the ${stage}:</p>
        <ul>
          <li><strong>Venue:</strong> ${booking.venue}</li>
          <li><strong>Branch:</strong> ${booking.branchName}</li>
          <li><strong>Activity Type:</strong> ${booking.activityType}</li>
          <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
          <li><strong>Timings:</strong> ${booking.timings.start} - ${booking.timings.end}</li>
        </ul>
        <p>Please reach out for clarification or resubmit the booking request.</p>
      <br/>
      <br/>
      <p>Thanks and regards,</p>
      <p><strong>Admin Team @Venue Hub</strong></p>
      <p>DVR & Dr. HS MIC College of Technology</p>
      <p>Email: <a href="mailto:venuebooking.adm.mictech@gmail.com">venuebooking.adm.mictech@gmail.com</a></p>
      `,
    };


    await transporter.sendMail(mailOptions);

  
    return res.status(200).json({ message: "Rejection emails sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting booking" });
  }
};


const sendApprovalEmail = async(bookingId, stage = "coordinator") => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error("Booking not found");
      return;
    }

    const { venue, branchName, activityType, date, timings, coordinator, hod, principal } = booking;
    const requesterEmail = booking.coordinator.email;

  
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

  
    let recipient, nextStage, nextRecipient;
    if (stage === "coordinator") {
      recipient = coordinator.email;
      nextStage = "hod";
      nextRecipient = hod.email;
    } else if (stage === "hod") {
      recipient = hod.email;
      nextStage = "principal";
      nextRecipient = principal.email;
    } else if (stage === "principal") {
      recipient = principal.email;
      nextStage = null; 
    }

  
    const token = jwt.sign(
      { bookingId, stage, action: "approve" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    const approveLink = `${process.env.BASE_URL}/approve/${token}`;
    const denyToken = jwt.sign(
      { bookingId, stage, action: "deny" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    const denyLink = `${process.env.BASE_URL}/deny/${denyToken}`;

  
    const mailOptions = {
      from: smtpEmail,
      to: recipient,
      cc: [requesterEmail, "venuebooking.adm.mictech@gmail.com"], 
      subject: `Approval Request for Booking at ${venue}`,
      html: `
        <p>Dear ${stage.charAt(0).toUpperCase() + stage.slice(1)},</p>
        <p>A booking request has been submitted with the following details:</p>
        <ul>
          <li><strong>Venue:</strong> ${venue}</li>
          <li><strong>Branch:</strong> ${branchName}</li>
          <li><strong>Activity Type:</strong> ${activityType}</li>
          <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
          <li><strong>Timings:</strong> ${timings.start} - ${timings.end}</li>
        </ul>
        <p>Please review the request and take an action:</p>
        <p>
          <a href="${approveLink}" style="color: green;">Approve</a> |
          <a href="${denyLink}" style="color: red;">Deny</a>
        </p>
        <br/>
      <br/>

         <p>Thanks and regards,</p>
      <p><strong>Admin Team @Venue Hub</strong></p>
      <p>DVR & Dr. HS MIC College of Technology</p>
      <p>Email: <a href="mailto:venuebooking.adm.mictech@gmail.com">venuebooking.adm.mictech@gmail.com</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${stage}: ${recipient}`);

  } catch (error) {
    console.error("Error sending approval email:", error);
  }
};

module.exports = { approveBooking, denyBooking,sendApprovalEmail };
