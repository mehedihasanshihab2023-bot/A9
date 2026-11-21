import { createAuthClient } from "better-auth/react"

import { SERVER_URL } from "@/lib/api"

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  fetchOptions: {
    credentials: "include",
  },
})

export const { useSession, signIn, signUp, signOut, updateUser } = authClient
