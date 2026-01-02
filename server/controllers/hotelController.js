import hotel from "../models/hotel.js";
import user from "../models/user.js";


export const registerHotel= async(req,res)=>{
    try {
        const {name,address,contact,city}=req.body;
        const owner=req.user._id;
        
        //Check if user already registered
        const Hotel=await hotel.findOne({owner});
        if(Hotel){
            return res.json({success:false, message: "Hotel Already Registered"});
        }

        await hotel.create({name,address,contact,owner,city});
        await user.findByIdAndUpdate(owner,{role:"hotelOwner"});
        res.json({success:true, message: "Hotel Registered Successfully"});
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}