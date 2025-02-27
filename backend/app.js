const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

const mongoURI = process.env.MONGODB_URL;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds (default is 10 seconds)
  socketTimeoutMS: 45000, // 45 seconds (default is 30 seconds)
  bufferCommands: false, // Optional: Disable buffering
});

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 450000, // 30 seconds (default is 10 seconds)
    socketTimeoutMS: 45000,
    bufferCommands: false,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

const userRouter = require("./routes/userRoute");
app.use("/api/user", userRouter);
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
