import React from 'react'
import {assets} from '../assets/assets.js'

function Navbar() {
  return (
    <div className='flex  w-full items-center justify-between p-4 bg-gray-800 text-white absolute top-0 left-0'>
     <img src={assets.logo} alt="Logo" className='w-28 h-28 sm:w-32 sm:h-32'  />
     <button className='flex items-center bg-blue-500 text-white px-6 py-2 rounded-full text-gray-800 hover:bg-gray-400 transition-all'>Login <img src={assets.arrow_icon} alt="Login Icon" className='ml-2' /></button>
    </div>
  )
}

export default Navbar
