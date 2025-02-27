const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Booking = require("../models/Booking");

const generatePDFAndSendEmail = async (booking_Id) => {
  try {
    const bookingId = booking_Id;
    const stampSize = 100;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      console.log("Setting up mail transport...");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const emailRecipients = [
        booking.coordinator.email,
        booking.hod.email,
        booking.principal.email,
        booking.requestor_email,
      ];

      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: emailRecipients,
        cc: ["venuebooking.adm.mictech@gmail.com"],
        subject: `Application for Booking - ${booking.venue} : Approved: `,
        html: `
          <p>Hello all,</p>
          <p>The application for booking the following venue has been approved by all relevant parties:</p>
          <ul>
            <li><strong>Venue:</strong> ${booking.venue}</li>
            <li><strong>Branch:</strong> ${booking.branchName}</li>
            <li><strong>Activity Type:</strong> ${booking.activityType}</li>
            <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
            <li><strong>Timings:</strong> ${formatTimeTo12Hour(booking.timings.start)} - ${formatTimeTo12Hour(booking.timings.end)}</li>
          </ul>
          <p>Please find attached the approved application for your reference.</p>
          <br/>
          <br/>
          <p>Thanks and regards,</p>
          <p><strong>Admin Team @Venue Hub</strong></p>
          <p>DVR & Dr. HS MIC College of Technology</p>
          <p>Email: <a href="mailto:venuebooking.adm.mictech@gmail.com">venuebooking.adm.mictech@gmail.com</a></p>
        `,
        attachments: [
          {
            filename: `booking_${bookingId}.pdf`,
            content: pdfBuffer,
          },
        ],
      };

      console.log("Sending email...");
      await transporter.sendMail(mailOptions);
      console.log("Application form sent successfully!");
    });

    doc.font("Times-Roman");
    doc.fontSize(20).text("Application for Booking of " + booking.venue, { align: "center" }).moveDown(1);

    function formatTimeTo12Hour(time) {
      const [hours, minutes] = time.split(':'); 
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);

      let period = date.getHours() >= 12 ? 'PM' : 'AM';
      let formattedHours = date.getHours() % 12 || 12;
      let formattedMinutes = date.getMinutes().toString().padStart(2, '0');

      return `${formattedHours}:${formattedMinutes} ${period}`;
    }

    const startTimeFormatted = formatTimeTo12Hour(booking.timings.start);
    const endTimeFormatted = formatTimeTo12Hour(booking.timings.end);

    doc.fontSize(12)
      .text("1. Name of the Branch: " + booking.branchName).moveDown(0.8)
      .text("2. Type of Activity: " + booking.activityType).moveDown(0.8)
      .text("3. Date of Programme/Activity: " + new Date(booking.date).toLocaleDateString()).moveDown(0.8)
      .text("4. Timings: From " + startTimeFormatted + " to " + endTimeFormatted).moveDown(0.8)
      .text("5. No. of Students Attending: " + booking.studentsAttending).moveDown(0.8)
      .text("6. Details of the Co-ordinator:").moveDown(0.8)
      .text("   a. Name: " + booking.coordinator.name).moveDown(0.8)
      .text("   b. Designation: " + booking.coordinator.designation).moveDown(0.8)
      .text("   c. Department: " + booking.coordinator.department).moveDown(0.8);

    doc.text("7. Requirements:").moveDown(0.8)
      .text("   - ACs: " + (booking.requirements.ac ? "Yes" : "No"))
      .text("   - PA System: " + (booking.requirements.paSystem ? "Yes" : "No"))
      .text("   - Digital Screen: " + (booking.requirements.digitalScreen ? "Yes" : "No"))
      .text("   - Projector: " + (booking.requirements.projector ? "Yes" : "No"))
      .text("   - Generator: " + (booking.requirements.generator ? "Yes" : "No"))
      .moveDown(0.8);

    doc.text("Approval Status:").moveDown(0.8)
      .text("   - Co-ordinator: Approved")
      .text("   - HOD: Approved")
      .text("   - Principal: Approved").moveDown(0.8);

    const stampPath = path.join(__dirname, "stamp.png");
    if (fs.existsSync(stampPath)) {
      doc.image(stampPath, doc.x + 330, doc.y - 8, { width: stampSize, align: "right" }).moveDown(8);
    } else {
      console.warn("Stamp image not found:", stampPath);
    }

    doc.text("(Generated on: " + new Date().toLocaleString() + ")", { align: "right" });

    doc.end();

  } catch (error) {
    console.error("Error generating PDF or sending email:", error);
    throw new Error("An error occurred while generating the PDF or sending the email.");
  }
};

module.exports = {
  generatePDFAndSendEmail
};
