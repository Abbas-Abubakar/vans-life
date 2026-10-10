import { redirect } from "react-router-dom"
import { getCurrentUser } from "../api/auth.api"

export async function requireAuth({ request }) {
  const user = await getCurrentUser()

  if (!user) {
    const { pathname, search } = new URL(request.url)
    const redirectTo = encodeURIComponent(pathname + search)
    const message = encodeURIComponent("You must log in first")
    throw redirect(`/login?message=${message}&redirectTo=${redirectTo}`)
  }

  return null
}