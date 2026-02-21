import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import {assets} from '../assets/assets'


const Home = () => {
  return (
    <div className=' flex flex-col  bg-gray-100 min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
      <Navbar />
      <Header />
    </div>
  )
}

export default Home
