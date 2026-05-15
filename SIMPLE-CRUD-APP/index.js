const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const productRoute=require('./routes/product.route')


dotenv.config();

const app=express()
// This is the "Translator" that lets Express read JSON
app.use(express.json());

// app.use(express.urlencoded({extended:false}));

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// routes middleware
app.use("/api/products",productRoute)

app.get('/',(req,res)=>{
    res.send("hello node api updated")
});


app.listen(3000,()=>{
    console.log('server is runnning on port 3000')
})