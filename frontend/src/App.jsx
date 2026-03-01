import React, { useState, useEffect } from 'react'
import Autorization from './autorization/autorization'
import Mainpage from './mainpage/mainpage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

 
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    
    localStorage.removeItem('currentUser')
  }

  if (isLoggedIn) {
    return <Mainpage 
      onLogout={handleLogout} 
      currentUser={currentUser}
    />
  }

  return <Autorization onLogin={handleLogin} />
}

export default App