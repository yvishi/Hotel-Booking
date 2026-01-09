import Stripe from "stripe";
import transporter from "../configs/nodemailer.js";
import booking from "../models/booking.js";
import Hotel from "../models/hotel.js";
import Room from "../models/room.js"

//Check Availability of room
const checkAvailability=async(checkInDate,checkOutDate,roomId)=>{
    try {
        const bookings= await booking.find({
            room: roomId, 
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

        

        const Booking=await booking.create({
            user, 
            room, 
            checkInDate, 
            checkOutDate, 
            guests: +guests, 
            totalPrice, 
            hotel: roomData.hotel._id, 
        });

        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: "Hotel Booking Confirmation",
            html: `
            <h2>Your Booking Details</h2>
            <p>Dear ${req.user.username},</p>
            <p>Thank you for booking with us. Here are your booking details:</p>
            <ul>
                <li><strong>Booking ID:</strong> ${Booking._id}</li>
                <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                <li><strong>Date:</strong> ${Booking.checkInDate.toDateString()}}</li>
                <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'}${Booking.totalPrice} / night</li>
            </ul>
            <p>We look forward to welcoming you to our hotel.</p>
            <p>If you need to make any changes, feel free to contact us.</p>
            `
        }
        const info=await transporter.sendMail(mailOptions);
        console.log(info.messageId);
        res.json({success:true, message: "Booking created successfully"});
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}


//api to get all bookings for a user (/user)
export const getUserBookings= async(req,res)=>{
    try {
        
        const bookings=(await booking.find({user: req.user._id}).populate("room").populate("hotel").sort({createdAt:-1}));
        
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

export const stripePayment= async(req,res)=>{
    try {
        const {bookingId}= req.body

        const Booking= await booking.findById(bookingId);
        const roomData= await Room.findById(Booking.room).populate('hotel');
        const totalPrice= Booking.totalPrice;
        const {origin}= req.headers;

        const stripeInstance= new Stripe(process.env.STRIPE_SECRET_KEY);

        const line_items=[
            {
                price_data:{
                    currency: "inr",
                    product_data:{
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice*100
                },
                quantity:1,
            }
        ]

        const session= await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader/myBookings`,
            cancel_url: `${origin}/myBookings`,
            metadata:{
                bookingId,
            }
            
        })

        res.json({success:true, url: session.url});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}
