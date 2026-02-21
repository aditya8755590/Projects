import React from 'react'
//React Context is a global data-sharing mechanism inside React component tree.
//“Internal app-level data channel.”
//Context provides shared state to components without manually passing props.
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = React.createContext()

export const AppContextProvider = ({ children }) => {

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [user, setUser] = React.useState(false);
  const value = {
    BACKEND_URL,
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
