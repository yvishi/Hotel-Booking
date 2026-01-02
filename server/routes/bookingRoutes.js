import express from "express";
import { checkAvailabilityAPI, createBooking, getBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter=express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/", protect, createBooking);
bookingRouter.get("/user", protect, getBookings);
bookingRouter.get("/hotel", protect, getBookings);

export default bookingRouter;