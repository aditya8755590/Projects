import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify';
const Login = () => {
  const navigate = useNavigate()
  const { BACKEND_URL, setIsLoggedIn } = useContext(AppContext)

  const [state, setState] = React.useState('sign up')
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      const { data } = (state === 'sign up' ? await axios.post(`${BACKEND_URL}/api/auth/register`, { name, email, password }) : await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password }))
      if (data.success) {
        setIsLoggedIn(true);
        navigate('/');
      }
      else {
        toast.error(data.message)
      }
      console.log(data);
    }
    catch (error) {
      console.log(error);
    }
  }


  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 relative px-6 sm:px bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
      <img src={assets.logo} onClick={() => navigate('/')} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 curser-pointer' />
      <div className='bg-slate-900 bg-opacity-80 rounded-lg p-10 flex flex-col items-center w-full sm:w-auto shadow-lg w-full sm:w-96 text-indigo-100 text-sm'>

        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'sign up' ? 'Create an account' : 'Welcome back!'}</h2>
        <p className=' text-center text-sm mb-6'>{state === 'sign up' ? 'Sign up to get started' : 'Login to your account'}</p>

        <form className='flex flex-col gap-4 mt-6 w-full sm:w-96' onSubmit={onSubmitHandler}>
          {state === 'sign up' && (
            <div className='mb-4 flex items-center gap-3 bg-opacity-20 bg-[#333A5C] rounded-full px-4 py-2'>
              <img src={assets.person_icon} alt="" />
              <input type="text" onChange={(e) => setName(e.target.value)} value={name} placeholder='Full Name' className='bg-transparent outline-none flex-1' />
            </div>
          )}
          <div className='mb-4 flex items-center gap-3 bg-opacity-20 bg-[#333A5C] rounded-full px-4 py-2'>
            <img src={assets.mail_icon} alt="" />
            <input type="text" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Email Address' className='bg-transparent outline-none flex-1' />
          </div>
          <div className='mb-4 flex items-center gap-3 bg-opacity-20 bg-[#333A5C] rounded-full px-4 py-2'>
            <img src={assets.lock_icon} alt="" />
            <input type="text" onChange={(e) => setPassword(e.target.value)} value={password} placeholder='Password' className='bg-transparent outline-none flex-1' />
          </div>
          <p onClick={() => navigate('/reset-password')} className='text-center text-sm mt-2 cursor-pointer'>Forget password?</p>

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
