const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit"); 
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

    const pdfPath = path.join(__dirname, `booking_${bookingId}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.font("Times-Roman");

    doc.fontSize(20).text("Application for Booking of " + booking.venue, { align: "center" }).moveDown(1);

    const headingStyle = { bold: true, font: "Times-Roman" };
    const textStyle = { font: "Times-Roman" };

    function formatTimeTo12Hour(time) {
        const [hours, minutes] = time.split(':'); 
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        
        let period = date.getHours() >= 12 ? 'PM' : 'AM';
        let formattedHours = date.getHours() % 12;
        formattedHours = formattedHours ? formattedHours : 12; 
        let formattedMinutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    
        return `${formattedHours}:${formattedMinutes} ${period}`;
    }
    
    const startTimeFormatted = formatTimeTo12Hour(booking.timings.start);
    const endTimeFormatted = formatTimeTo12Hour(booking.timings.end);
    
    doc.fontSize(12)
      .text("1. Name of the Branch: " + booking.branchName, headingStyle).moveDown(0.8)
      .text("2. Type of Activity: " + booking.activityType, headingStyle).moveDown(0.8)
      .text("3. Date of Programme/Activity: " + new Date(booking.date).toLocaleDateString(), headingStyle).moveDown(0.8)
      .text("4. Timings: From " + startTimeFormatted + " to " + endTimeFormatted, textStyle).moveDown(0.8)  
      .text("5. No. of Students Attending: " + booking.studentsAttending, headingStyle).moveDown(0.8)
      .text("6. Details of the Co-ordinator:", headingStyle).moveDown(0.8)
      .text("   a. Name: " + booking.coordinator.name, textStyle).moveDown(0.8)
      .text("   b. Designation: " + booking.coordinator.designation, textStyle).moveDown(0.8)
      .text("   c. Department: " + booking.coordinator.department, textStyle).moveDown(0.8);

    doc.text("7. Requirements:", headingStyle).moveDown(0.8)
      .text("   - ACs: " + (booking.requirements.ac ? "Yes" : "No"), textStyle)
      .text("   - PA System: " + (booking.requirements.paSystem ? "Yes" : "No"), textStyle)
      .text("   - Digital Screen: " + (booking.requirements.digitalScreen ? "Yes" : "No"), textStyle)
      .text("   - Projector: " + (booking.requirements.projector ? "Yes" : "No"), textStyle)
      .text("   - Generator: " + (booking.requirements.generator ? "Yes" : "No"), textStyle)
      .moveDown(0.8);


    doc.text("Approval Status:", headingStyle).moveDown(0.8)
      .text("   - Co-ordinator: Approved", textStyle)
      .text("   - HOD: Approved", textStyle)
      .text("   - Principal: Approved", textStyle).moveDown(0.8);

    doc.image(path.join(__dirname, "stamp.png"), doc.x + 330, doc.y - 8, { width: stampSize,  align: "right" }).moveDown(8);
    doc.text("(Generated on: " + new Date().toLocaleString()+ ")", { align: "right", font: "Times-Roman" });

    doc.end();

    console.log("sending mail");
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
            <li><strong>Timings:</strong> ${startTimeFormatted} - ${endTimeFormatted}</li>
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
            path: pdfPath,
          },
        ],
      };

      
      await transporter.sendMail(mailOptions);
      console.log("Application form sent to all");
      fs.unlinkSync(pdfPath);
    

  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while generating the PDF or sending the email.");
  }
};

module.exports = {
  generatePDFAndSendEmail
};
