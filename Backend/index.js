import express from "express";
import cors from "cors";
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import Connection from './db.js';
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
app.use(cookieParser());
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRouter from "./Routes/userRouter.js";

/* -------------------------------------------------------------------------------------------------------------------------- */

app.use("/api/user", userRouter);

/* ----------------------------------------------------------------------------------------------------------------------------- */
const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server is listening on ${PORT}`);
})

Connection();
