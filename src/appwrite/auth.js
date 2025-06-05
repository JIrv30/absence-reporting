import { account, OAuthProvider } from "./config";

export const loginWithGoogle = async () => {
  try {
    await account.createOAuth2Session(OAuthProvider.Google,'http://https://kgabp-absence-reporting.netlify.app/userabsence',
    'https://kgabp-absence-reporting.netlify.app/fail'
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