const { isAuthenticated } = require("../Middleware/verifyJWT");
const express = require("express");
const {signup,signin,
    // forgetpassword,resetpassword,sendotp,
    bookVenue, getAllBookings, getBookingDetails, AdminAction} = require("../controllers/userController");
// const userController = require("../controllers/userController");
const { approveBooking, denyBooking } = require("../controllers/bookingController");

const router = express.Router();
router.route("/register").post(signup);
router.route("/login").post(signin);
// router.route("/forgetpassword").post(forgetpassword);
// router.route("/resetpassword/:userId/:accessToken").post(resetpassword);
// router.route('/send-otp').post(sendotp);
router.post("/book-venue", bookVenue);
router.get("/bookings", getAllBookings);
router.get("/bookings/:bookingId", getBookingDetails);
router.get("/approve/:token", approveBooking);
router.get("/deny/:token", denyBooking);
router.get("/admin/action/:token", AdminAction);

router.use(isAuthenticated);
module.exports = router;