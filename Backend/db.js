import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

import mongoose from "mongoose";

const Connection = async() =>{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected successfully");
}

export default Connection;