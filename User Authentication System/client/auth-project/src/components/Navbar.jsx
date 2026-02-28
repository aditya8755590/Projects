import React, { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function Navbar() {

  const navigate = useNavigate();
  const { user, BACKEND_URL } = useContext(AppContext);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${BACKEND_URL}/api/user/send-verification-otp`,
        { email: user.email }
      );

      if (data.success) {
        navigate('/verify-email');
        toast.success(data.message);
        setOpen(false);   // close dropdown
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${BACKEND_URL}/api/user/logout`);

      if (data.success) {
        navigate('/login');
        toast.success(data.message);
        setOpen(false);   // close dropdown
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex w-full items-center justify-between px-6 sm:px-24 py-4 bg-gray-900 text-white fixed top-0 left-0 z-50 shadow-md">

      {/* Logo */}
      <img
        src={assets.logo}
        alt="Logo"
        className="w-24 sm:w-28 object-contain"
      />

      {user ? (
        <div className="relative" ref={dropdownRef}>

          {/* Profile Circle */}
          <div
            onClick={() => setOpen(!open)}
            className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer"
          >
            {user.name[0].toUpperCase()}
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-100 text-black rounded shadow-lg z-10">
              <ul className="list-none m-0 p-2 text-sm">

                {!user.isAccountVerified && (
                  <li
                    onClick={sendVerificationOtp}
                    className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
                  >
                    Verify Email
                  </li>
                )}

                <li
                  onClick={logout}
                  className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
                >
                  Logout
                </li>

              </ul>
            </div>
          )}

        </div>
      ) : (
        <button
          className="flex items-center gap-2 bg-blue-500 px-5 py-2 rounded-full hover:bg-blue-600 transition"
          onClick={() => navigate('/login')}
        >
          Login
          <img
            src={assets.arrow_icon}
            alt="Login Icon"
            className="w-4"
          />
        </button>
      )}

    </div>
  );
}

export default Navbar;