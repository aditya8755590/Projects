import React from 'react'
import Navbar from '../components/Navbar'

const Home = () => {
  return (
    <div>
      <Navbar />

      <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
      <p className="mt-4">This is a simple example of a React component styled with Tailwind CSS.</p>
    </div>
  )
}

export default Home
