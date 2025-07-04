import { account, OAuthProvider } from "./config";

export const loginWithGoogle = async () => {
  try {
    await account.createOAuth2Session(OAuthProvider.Google,
    'https://kgabp-absence-reporting.netlify.app/',
    'https://kgabp-absence-reporting.netlify.app/'
    )
  } catch (error) {
    console.error (error)
  }
}

export const logOutUser = async () => {
  try {
    await account.deleteSession('current')
    window.location.href = 'https://kgabp-absence-reporting.netlify.app'
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