import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function Navbar() {
  // this is a hook React Router gives your component access to the navigation system. It allows you to programmatically navigate to different routes in your application.
  const navigate = useNavigate();
  const { user, BACKEND_URL, setUser, setIsLoggedIn } = useContext(AppContext);
  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${BACKEND_URL}/api/user/send-verification-otp`, { email: user.email })
      if (data.success) {
        navigate('/verify-email')
        toast.success(data.message)
      }
      else {
        toast.error(data.message)
      }
    }
    catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div className="flex w-full items-center justify-between px-6 py-3 bg-gray-900 text-white fixed top-0 left-0 z-50 shadow-md">

      <img
        src={assets.logo}
        alt="Logo"
        className="w-24 sm:w-28 object-contain"
      />

      <button className="flex items-center gap-2 bg-blue-500 px-5 py-2 rounded-full hover:bg-blue-600 transition" onClick={() => navigate('/login')}>
        Login
        <img
          src={assets.arrow_icon}
          alt="Login Icon"
          className="w-4"
        />
      </button>

    </div>
  )
}
export default Navbar;