import hotel from "../models/hotel.js";
import {v2 as cloudinary} from "cloudinary";
import room from "../models/room.js";

//api to create new room
export const createRoom=async(req,res)=>{
    
    try {
        const {roomType, pricePerNight, amenities}=req.body;
        const Hotel= await hotel.findOne({owner: req.auth.userId});
        
        if(!Hotel){
            return res.json({success:false, message: "Hotel not found"});
        }
        
        //upload images to Cloudinary
        const uploadImages = req.files.map(async (file) => {
        const response = await cloudinary.uploader.upload(file.path);
        return response.secure_url;
        });

        
        //Wait for all images to upload
        const images= await Promise.all(uploadImages);
        
        
        await room.create({
            hotel: Hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images
        })

        res.json({success:true, message: "Room created successfully"});
    } catch (error) {
        console.log("yahan se aaya hun mai");
        res.json({success:false, message: error.message});
    }
}

//api to get all rooms
export const getRooms=async(req,res)=>{
    try {
        const rooms= await room.find({isAvailable: true}).populate({
            path: 'hotel',
            populate:{
                path:'owner',
                select: 'image'
            }
        }).sort({createdAt: -1});
        res.json({success:true, rooms});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}

//api to get all rooms for a specific hotel
export const getOwnerRooms=async(req,res)=>{
    try {
        const hotelData= await hotel.findOne({owner: req.auth.userId})
        const rooms=await room.find({hotel: hotelData._id.toString()}).populate("hotel");
        res.json({success:true, rooms});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}

//api to toggle availability of a room
export const toggleRoomAvailability=async(req,res)=>{
    try {
        const {roomId}=req.body;
        const roomData= await room.findById(roomId);
        await room.findByIdAndUpdate(roomId, {isAvailable: !roomData.isAvailable});
        res.json({success:true, message: "Room availability updated successfully"});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}