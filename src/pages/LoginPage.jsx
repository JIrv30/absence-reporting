import React, { useEffect, useState } from 'react'
import { loginWithGoogle, logOutUser, getUser } from '../appwrite/auth'

const LoginPage = () => {

  const [user, setUser] = useState(null)

useEffect(()=>{
  const checkUser = async () => {
    try {
      const userData = await getUser()
      setUser(userData)
    } catch (error) {
      setUser(null)
      console.error(error)
    }
  }
  checkUser()
},[])

  return (
    <>
      {user ? (
        <>
          <p>Welcolme, {user.name}</p>
          <button onClick={logOutUser}></button>
        </>
      ) : (
        <button onClick={loginWithGoogle}>Login with Google</button>
      )}
    </>
  )
}

export default LoginPage