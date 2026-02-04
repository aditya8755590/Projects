import express from 'express'
import cors from 'cors'
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js'
const app=express();
const port=process.env.PORT||4000
connectDB();
app.use(express.json());
app.use(cookieParser());
// CORS allows the browser to let frontend and backend communicate securely, and credentials: true allows authentication data to be sent.
app.use(cors({credentials:true}))
app.get('/',(req,res)=> res.send('ye dil tum bin khahi lagta nahi '));
app.listen(port,()=>console.log(`server stated on port :${port}`));

