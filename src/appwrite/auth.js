import { account, OAuthProvider } from "./config";

export const loginWithGoogle = async () => {
  try {
    await account.createOAuth2Session(OAuthProvider.Google,'http://localhost:5173/userabsence',
    'http://localhost:5173/fail'
    )
  } catch (error) {
    console.error (error)
  }
}

export const logOutUser = async () => {
  try {
    await account.deleteSession('current')
  } catch (error) {
    console.error(error)
  }
}

export const getUser = async () => {
  try {
    return await account.get()
  } catch (error) {
    console.error (error)
  }
}