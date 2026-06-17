import { account, OAuthProvider } from "./config";

export const loginWithGoogle = async () => {
  const origin = window.location.origin;

  try {
    await account.createOAuth2Session(
      OAuthProvider.Google,
      `${origin}/`,
      `${origin}/fail`
    );
  } catch (error) {
    console.error(error);
  }
};

export const logOutUser = async () => {
  try {
    await account.deleteSession("current");
    window.location.href = `${window.location.origin}/`;
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    console.error(error);
  }
};
