import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../appwrite/auth'

const OAuthCallback = () => {
  const navigate = useNavigate()

  useEffect(()=>{
    const finishLogin = async () => {
      try {
        const user = await getUser()
        console.log('Logged in as', user)
        if (user) {
          navigate('/')
        }
      } catch (error) {
        console.error ('OAuth callback failed', error)
        navigate('/')
      }
    }
    finishLogin()
  },[])
  
  
  return <p>Finishing Login...</p>
}

export default OAuthCallback