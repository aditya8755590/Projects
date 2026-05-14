const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const Product=require('./models/products.model')


dotenv.config();

const app=express()
// This is the "Translator" that lets Express read JSON
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


app.listen(3000,()=>{
    console.log('server is runnning on port 3000')
})

app.get('/',(req,res)=>{
   res.send("hello node api updated")
});

app.get('/api/products',async (req,res)=>{
   try{
     const product=await Product.find({})
      res.status(200).json(product);
   }
   catch(error){
    res.status(500).json({message:error.message});
   }
})
app.post('/api/products',async (req,res)=>{
   try{
     const product=await Product.create(req.body)
      res.status(200).json(product);
   }
   catch(error){
    res.status(500).json({message:error.message});
   }
})

app.get('/api/products/:id',async (req,res)=>{
   try{
     const {id}=req.params
     const product=await Product.findById(id)
      res.status(200).json(product);
   }
   catch(error){
    res.status(500).json({message:error.message});
   }
})
app.put('/api/products/:id',async (req,res)=>{
   try{
     const {id}=req.params
     const product=await Product.findByIdAndUpdate(id,req.body)
     if(!product){
         return res.status(500).json({message:"product not found"});
     }
      const UpdateProduct=await Product.findById(id)
      res.status(200).json(UpdateProduct);
   }
   catch(error){
    res.status(500).json({message:error.message});
   }
})

// delete product 
app.delete('/api/products/:id',async (req,res)=>{
   try{
     const {id}=req.params
     const product=await Product.findByIdAndDelete(id)
      if(!product){
         return res.status(404).json({message:"product not found"});
     }

      res.status(200).json({message:"product delete sucessfully"});
   }
   catch(error){
    res.status(500).json({message:error.message});
   }
})
