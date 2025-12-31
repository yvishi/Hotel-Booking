import user from "../models/user.js";

//Middleware to chek if user is authenticated
export const protect= async(req,res,next)=>{
    const{userId}=req.auth;
    if(!userId){
        res.json({success:false, message: "not Authorized"});
    }else{
        const User= await user.findById(userId);
        req.User=User;
        next();
    }
}