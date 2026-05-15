const express=require('express');
const app=express.app();
const port=3000;
const mongoose=require('mongoose')
const product =require('./models/products.model')
const dotenv=require('dotenv');
dotenv.config()

mongoose.connect(process.env.MONGO_URI)

.then(()=>{
    console.log("mongoDB is connected")
})

.catch(
    console.log("mongoDB is not connected")
)


app.use(express.json());

app.get('./api/products/:id',async (req,res)=>{
    try{
       const {id} =req.prams;
    const product=await Product.findById(id)
    res.status(200).json(product);

    }
    catch{
    res.status(500).json({message:"product not found"})
    }

})
app.get('/',(req,res)=>{
    res.send("hello node api updated")
});


app.get('./api/products/',(req,res)=>{


})
app.post('./api/products',(req,res)=>{

})
app.post('./api/products',(req,res)=>{

})
app.post('./api/products',(req,res)=>{

})
app.listen(port,()=>{
    console.log("app is listen")
})