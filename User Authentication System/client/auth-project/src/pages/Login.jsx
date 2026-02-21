import React from 'react'
import {assets} from '../assets/assets'

const Login = () => {
  
  const [state,setState]=React.useState('sign up')
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 relative px-6 sm:px bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
     <img src={assets.logo} alt=""  className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 curser-pointer'/>
     <div className='bg-slate-900 bg-opacity-80 rounded-lg p-10 flex flex-col items-center w-full sm:w-auto shadow-lg w-full sm:w-96 text-indigo-100 text-sm'>

      <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state=== 'sign up' ? 'Create an account' : 'Welcome back!'}</h2>
        <p className=' text-center text-sm mb-6'>{state === 'sign up' ? 'Sign up to get started' : 'Login to your account'}</p>

        <form className='flex flex-col gap-4 mt-6 w-full sm:w-96'>
          {state === 'sign up' && (
            <div className='mb-4 flex items-center gap-3 bg-opacity-20 bg-[#333A5C] rounded-full px-4 py-2'>
              <img src={assets.person_icon} alt="" />
              <input type="text" placeholder='Full Name' className='bg-transparent outline-none flex-1' />
            </div>
          )}
         <div className='mb-4 flex items-center gap-3 bg-opacity-20 bg-[#333A5C] rounded-full px-4 py-2'>
          <img src={assets.mail_icon} alt="" />
          <input type="text" placeholder='Email Address' className='bg-transparent outline-none flex-1' />
         </div>
         <div className='mb-4 flex items-center gap-3 bg-opacity-20 bg-[#333A5C] rounded-full px-4 py-2'>
          <img src={assets.lock_icon} alt="" />
          <input type="text" placeholder='Password' className='bg-transparent outline-none flex-1' />
         </div>
         <p className='text-center text-sm mt-2 cursor-pointer'>Forget password?</p>
         
          <button className='bg-blue-500 hover:bg-blue-600 transition text-white py-2 rounded-full mt-4 font-medium' > {state === 'sign up' ? 'Sign Up' : 'Login'} </button>

        </form>

        <p className='text-center text-sm mt-4 cursor-pointer' onClick={() => setState(state === 'sign up' ? 'login' : 'sign up')}>
          {state === 'sign up' ? 'Already have an account?' : "Don't have an account?"}
          <span className='text-blue-500 cursor-pointer underline'>{state === 'sign up' ? 'Login' : 'Sign Up'}</span>
        </p>
       
     </div>
    </div>
  )
}

export default Login
