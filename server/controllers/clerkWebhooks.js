import user from "../models/user.js";
import { Webhook } from "svix";


const clerkWebhooks=async(req,res)=>{
    try{
        //svix instance with clerk webhook secret
        const whook=new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        
        const headers={
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };
        console.log(req.headers.Authentication);

        await whook.verify(JSON.stringify(req.body),headers);

        const {data,type}=req.body;
        const userData={
            _id: data.id,
            username: data.first_name + " " + data.last_name,
            email: data.email_addresses?.[0]?.email_address ?? null,
            image: data.image_url,        
            }
            switch (type) {
                case "user.created":{
                    await user.create(userData);
                    break;
                }
                case "user.updated":{
                    await user.findByIdAndUpdate(data.id, userData);
                    break;
                }
                case "user.deleted":{
                    await user.findByIdAndDelete(data.id);
                    break;
                }
                    
                    
                default:
                    break;
            }
            res.json({success:true,message:"Webhook received"});
       
    }catch(e){
        console.log(e.message+"printed from clerkWebhooks");
        res.json({success:false,message:e.message});
    }
}

export default clerkWebhooks;