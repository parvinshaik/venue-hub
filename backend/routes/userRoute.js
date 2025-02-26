const { isAuthenticated } = require("../Middleware/verifyJWT");
const express = require("express");
const {signup,signin, bookVenue, getAllBookings, getBookingDetails, AdminAction, updateProfile, getuser, changePassword } = require("../controllers/userController");
const { approveBooking, denyBooking } = require("../controllers/bookingController");
const {googleAuth} = require("../controllers/googleAuth");

const router = express.Router();
router.route("/register").post(signup);
router.route("/login").post(signin);
router.post("/book-venue", bookVenue);
router.get("/bookings", getAllBookings);
router.get("/bookings/:bookingId", getBookingDetails);
router.get("/approve/:token", approveBooking);
router.get("/deny/:token", denyBooking);
router.get("/admin/action/:token", AdminAction);
router.get("/ping", (req,res)=> { res.send("Hello"); });
router.route("/update/:id").put(updateProfile);
router.get("/:id", getuser);
router.post("/change-password/:id", changePassword);
router.post("/auth/google", googleAuth);



router.use(isAuthenticated);
module.exports = router;
