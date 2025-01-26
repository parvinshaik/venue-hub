const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();

// Middleware
const bodyParser = require('body-parser');

// Body parser middleware to handle JSON and form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS to allow cross-origin requests
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGODB_URL;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

// Import routes
const userRouter = require("./routes/userRoute");
app.use("/api/user", userRouter);

// Start the server
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
