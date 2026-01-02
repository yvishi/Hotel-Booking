import booking from "../models/booking.js"
import { hotel as Hotel} from "../models/hotel.js";
import {room as Room} from "../models/room.js"

//Check Availability of room
const checkAvailability=async(checkInDate,checkOutDate,room)=>{
    try {
        const bookings= await booking.find({
            room: room._id, 
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate}
        });
        const isAvailable=bookings.length ===0;
        return isAvailable;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}


//api to check availability of room (/check-availability)
export const checkAvailabilityAPI= async(req,res)=>{
    try {
        const {room, checkInDate, checkOutDate}=req.body;
        const isAvailable=await checkAvailability(checkInDate,checkOutDate,room);
        res.json({success:true, isAvailable});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}


//api to create a new booking (/book)
export const createBooking= async(req,res)=>{
    try {
        const {room, checkInDate, checkOutDate, guests}=req.body;
        const user=req.user._id;
        //check availability
        const isAvailable=await checkAvailability(checkInDate,checkOutDate,room);
        if(!isAvailable){
            return res.json({success:false, message: "Room not available"});
        }
        //getting total price
        const roomData=  await Room.findById(room).populate("hotel");
        let totalPrice= roomData.pricePerNight;

        //calculate for all nights
        const checkIn= new Date(checkInDate);
        const checkOut= new Date(checkOutDate);
        const timeDiff= checkOut.getTime() - checkIn.getTime();
        const nights=Math.ceil(timeDiff/(1000*60*60*24));
        totalPrice*=nights;

        await booking.create({
            user, 
            room, 
            checkInDate, 
            checkOutDate, 
            guests: +guests, 
            totalPrice, 
            hotel: roomData.hotel._id, 
        });
        res.json({success:true, message: "Booking created successfully"});
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}


//api to get all bookings for a user (/user)
export const getUserBookings= async(req,res)=>{
    try {
        const bookings=(await booking.find({user: req.user._id}).populate("room").populate("hotel")).toSorted({createdAt:-1});
        res.json({success:true, bookings});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}


//api to get booking detail for hotel owner
export const getHotelBookings= async(req,res)=>{
    try {
        const hotel = await Hotel.findOne({owner: req.auth.userId});
    if(!hotel){
        return res.json({success:false, message: "Hotel not found"});
    }
    const bookings = await booking.find({hotel: hotel._id}).populate("room hotel user").sort({createdAt: -1});

    //total number of bookings
    const totalBookings= bookings.length;

    //total Revenue
    const totalRevenue=bookings.reduce((total,booking)=>total+booking.totalPrice,0);

    res.json({success:true, dashboardData: {totalBookings, totalRevenue, bookings}});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}
