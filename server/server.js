//MAIN FILE OF BACK-END
import express from "express"
import "dotenv/config"
import cors from "cors"
import connectDB from "./configs/db.js";

connectDB();
const app=express();
const port=process.env.PORT || 3000;
app.use(cors());


app.get("/",(req,res)=>{
    res.send("API Working!!")
})

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`)
})