import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;



const Connection = async() =>{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected successfully");
}

export default Connection;