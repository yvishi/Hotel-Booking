//MAIN FILE OF BACK-END
import express from "express"
import "dotenv/config"
import cors from "cors"
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app=express();
const port=process.env.PORT || 3000;

app.use(cors());

//Middleware
app.use(express.json());
app.use(clerkMiddleware());

//API for ClerkWebhook
app.use("/api/clerk", clerkWebhooks);

app.get("/",(req,res)=>{
    res.send("API Working!!")
})

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`)
})