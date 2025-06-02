import { Client, Databases, Account, OAuthProvider, Teams } from "appwrite";

const client = new Client ()

client
 .setEndpoint(import.meta.env.VITE_ENF)
 .setProject(import.meta.env.VITE_PROJECT_ID)

 const databases = new Databases(client)

 const account = new Account(client)

 const teams = new Teams(client)

 export {client, databases, account, OAuthProvider, teams}