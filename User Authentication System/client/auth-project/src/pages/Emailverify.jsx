import React from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext, useRef } from 'react';
import { useEffect } from 'react';


const Emailverify = () => {

  axios.defaults.withCredentials = true;
  const { BACKEND_URL, setIsLoggedIn, getUserData, isLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const inputRef = useRef([]);

  const handelInput = (e, index) => {
    if (e.target.value.length === 1 && index < 5) {
      inputRef.current[index + 1].focus();
    }
  }
  const handelkeydown = (e, index) => {
    if (e.key === 'Backspace') {
      inputRef.current[index - 1].focus();
    }
  }
  const handelpaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pastArray = paste.split('');
    pastArray.forEach((element, index) => {
      if (index < 6) {
        inputRef.current[index].value = element;
      }
    });
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRef.current.map(el => el.value);
      const otp = otpArray.join('');
      if (otp.length < 6) {
        toast.error('Please enter a 6 digit OTP');
        return;
      }

      const { data } = await axios.post(`${BACKEND_URL}/api/auth/verify-account`, { otp });
      console.log(data);
      if (data.success) {
        toast.success(data.message || 'Email verified successfully');
        getUserData();
        setIsLoggedIn(true);
        navigate('/');
      }
    }
    catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Something went wrong in emailverify');
    }
  }
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative px-6 sm:px-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <img src={assets.logo} onClick={() => navigate('/')} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email verify otp</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the 6 digit OTP sent to your email</p>
        <div className='flex justify-between mb-5 text-indigo-300' onPaste={(e) => handelpaste(e)}>

          {
            Array(6).fill(0).map((_, index) => {
              return (
                <input type="text" maxLength={1} key={index} className='w-12 p-3 rounded-lg bg-gray-800 text-white mt-4 text-xl' ref={el => inputRef.current[index] = el}
                  onInput={(e) => handelInput(e, index)}
                  onKeyDown={(e) => handelkeydown(e, index)} />
              )
            })
          }
        </div>
        <button className='bg-blue-500 hover:bg-blue-600 transition text-white py-2 rounded-full mt-4 font-medium w-full'>Verify email</button>
      </form>
    </div>
  )
}

export default Emailverify
