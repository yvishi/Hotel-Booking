import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        // mongoose.connection.on('connected',()=>console.log("Database connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}/hotelBooking`);
        console.log("Database connected");
    }catch(e){
        console.log(e.message);
    }
}

export default connectDB