import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';
export const register=async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name|!email|!password){
        return res.json({sucess:false,message:'Missing detail'})
    }
    try{
        const existingUser=await userModel.findOne({email})
        if(existingUser){
            return res.json({sucess:false,message:"user alrady register"})
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user= new userModel({name,email,password:hashedPassword});
        await user.save();
        const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token ,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            // check for the deployment
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });
        return res.json({sucess:true})
    }
    catch(error){
        res.json({sucess:false,message:error.message})
    }
}
export  const login =async(res,res)=>{
    const {email,password}=res.body;
    if(!email||!password){
        return res.json({sucess:false,message:'email and password required'})
        
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            
            return res.json({sucess:false,message:"invalid email"})
        }
        const isMatch=await bcrypt.compare(password,user.password)
        
        if(!isMatch){

            return res.json({sucess:false,message:"password is invalid"})

        }
         // user verify 
          const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token ,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            // check for the deployment
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });
        return res.json({sucess:true});
    }
    catch(error){
        res.json({sucess:false,message:error.message})
    }
}

export const logout=async(res,req)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            // check for the deployment
            sameSite:process.env.NODE_ENV==='production'?'none':'strict'
        })
       return res.status(200).json({
      success: true,
      message: "Logged Out"
    });
    }
    catch(error){
     return res.status(500).json({
      success: false,
      message: "Logout failed"
    });
    }
}