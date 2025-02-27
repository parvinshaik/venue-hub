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

async function connectToDB(){
  await mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 25000,
    socketTimeoutMS: 25000,
    connectTimeoutMS: 20000
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });
}
connectToDB();
const userRouter = require("./routes/userRoute");
app.use("/api/user", userRouter);
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
