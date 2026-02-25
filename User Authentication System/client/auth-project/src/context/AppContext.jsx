import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

//React Context is a global data-sharing mechanism inside React component tree.
//“Internal app-level data channel.”
//Context provides shared state to components without manually passing props.
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = React.createContext()

export const AppContextProvider = ({ children }) => {

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [user, setUser] = React.useState(false);
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/user/is-auth`)

      if (data.success) {
        setIsLoggedIn(true)
        getUserData()
      }
      else {
        setIsLoggedIn(false)
      }
    }
    catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    getAuthState()
  }, [])
  //Axios is a popular, promise-based JavaScript library 
  //used to make HTTP requests from web browsers or Node.js environments. 
  //It acts as a middleman between applications and APIs, 
  //facilitating data fetching, sending POST requests, and managing API interactions with features like automatic JSON transformation and request cancellation
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/user/data`, { withCredentials: true })

      if (data.success) {
        setUser(data.userData)
      }
      else {
        toast.error(data.message)
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  const value = {
    BACKEND_URL,
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    getUserData
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
