import mongoose from "mongoose";
const connectDB=async()=>{
    // MongoDB is the database, Mongoose is the library that connects Node.js to MongoDB, and /mearn-auth is the database name being used
    mongoose.connection.on('connected',()=>console.log("Database connect"))

    await mongoose.connect(`${process.env.MONGODB_URI}/mearn-auth`)
}
export default connectDB;