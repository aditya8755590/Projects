import React from 'react'
import {assets} from '../assets/assets'
const Header = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-28 pb-10 bg-gray-800 text-white">
      
      <img
        src={assets.header_img}
        alt=""
        className="w-28 sm:w-36 rounded-full mb-4"
      />

      <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold">
        Hey Developer
        <img
          className="w-6 sm:w-8"
          src={assets.hand_wave}
          alt=""
        />
      </h1>

      <h2 className="text-gray-300 mt-2 text-sm sm:text-base">
        Welcome to our app
      </h2>
      <p className='text-gray-400 mt-2 text-sm sm:text-base mx-w-md mb-8'>lets start to a quick tutorial and you know nothing Jhon Snow </p>
      <button className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition">Get Tutorial</button>

    </div>
  )
}

export default Header
