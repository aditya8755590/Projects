import React, { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const { BACKEND_URL } = useContext(AppContext)
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)

  const inputRefs = useRef([])

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pastArray = paste.split('');
    pastArray.forEach((element, index) => {
      if (index < 6 && inputRefs.current[index]) {
        inputRefs.current[index].value = element;
      }
    });
  }

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${BACKEND_URL}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending OTP');
    }
  }

  const onSubmitOtp = (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(el => el.value);
    const otpString = otpArray.join('');
    if (otpString.length < 6) {
       toast.error('Please enter a 6 digit OTP');
       return;
    }
    setOtp(otpString);
    setIsOtpSubmitted(true);
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error resetting password');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative px-6 sm:px-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <img src={assets.logo} onClick={() => navigate('/')} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
      
      {/* Enter Email Form */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" className='w-3 h-3'/>
            <input 
              type="email" 
              placeholder='Email id' 
              className='bg-transparent outline-none text-white w-full' 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className='bg-blue-500 hover:bg-blue-600 transition text-white py-2.5 rounded-full mt-4 font-medium w-full'>Submit</button>
        </form>
      )}

      {/* Enter OTP Form */}
      {isEmailSent && !isOtpSubmitted && (
        <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Enter OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6 digit OTP sent to your email id</p>
          <div className='flex justify-between mb-5 text-indigo-300 w-full max-w-md mx-auto' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input 
                type="text" 
                maxLength={1}
                key={index} 
                className='w-12 h-12 p-3 text-center rounded-lg bg-[#333A5C] text-white mt-4 text-xl outline-none focus:ring-2 focus:ring-blue-500' 
                ref={el => inputRefs.current[index] = el}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)} 
                required
              />
            ))}
          </div>
          <button type="submit" className='bg-blue-500 hover:bg-blue-600 transition text-white py-2.5 rounded-full mt-4 font-medium w-full'>Submit</button>
        </form>
      )}

      {/* Enter New Password Form */}
      {isEmailSent && isOtpSubmitted && (
        <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your new password below</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" className='w-3 h-3'/>
            <input 
              type="password" 
              placeholder='New Password' 
              className='bg-transparent outline-none text-white w-full' 
              value={newPassword} 
              onChange={(e)=>setNewPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className='bg-blue-500 hover:bg-blue-600 transition text-white py-2.5 rounded-full mt-4 font-medium w-full'>Reset Password</button>
        </form>
      )}

    </div>
  )
}

export default ResetPassword
