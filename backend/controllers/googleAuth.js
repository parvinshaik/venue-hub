const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                roll: "N/A",
                password: "google_oauth",
                approved_user: false,
            });
            await user.save();
            const userId = user._id;

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
                <p style="color: red;">Note: User is signed up using Google Account</p>

                    <p>Dear Admin Team,</p>
                    <p>A new user has been registered and waiting for approval. Below are the details:</p>
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
            
                      <p>Thanks and regards,</p>
      <p><strong>Admin Team @Venue Hub</strong></p>
      <p>DVR & Dr. HS MIC College of Technology</p>
      <p>Email: <a href="mailto:venuebooking.adm.mictech@gmail.com">venuebooking.adm.mictech@gmail.com</a></p>
                  `
            };

            await transporter.sendMail(mailOptions);
            return res.status(400).json({ message: "Admin approval is pending." });
        }

        if (user.approved_user == true) {
            const accessToken = await jwt.sign(
                { userId: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );
            res.status(200).json({ token: accessToken, userid: user._id });
        }
        else {
            return res.status(400).json({ message: "Admin approval is pending." });
        }

    } catch (error) {
        res.status(500).json({ message: "Authentication failed" });
    }
};

module.exports = { googleAuth };
