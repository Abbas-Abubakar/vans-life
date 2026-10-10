import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router-dom"
import { loginUser } from "../api/auth.api"

export function loader({ request }) {
  return new URL(request.url).searchParams.get("message")
}

export async function action({ request }) {
  const formData = await request.formData()
  const email = formData.get("email")
  const password = formData.get("password")
  const pathname = new URL(request.url).searchParams.get("redirectTo") || "/host"

  try {
    await loginUser({ email, password })
  } catch (err) {
    return err.message
  }

  return redirect(pathname)
}

export default function Login() {
  const message = useLoaderData()
  const errorMessage = useActionData()
  const { state } = useNavigation()

  return (
    <div className="login-container">
      {message && <h2 className="red">{message}</h2>}
      <h1>Sign in to your account</h1>
      {errorMessage && <h3 className="red">{errorMessage}</h3>}
      <Form method="post" className="login-form" replace>
        <input name="email" type="email" placeholder="Email address" required />
        <input name="password" type="password" placeholder="Password" required />
        <button disabled={state === "submitting"}>
          {state === "submitting" ? "Logging in..." : "Log in"}
        </button>
      </Form>
      <p className="login-switch">
        Don't have an account? <Link to="/register">Create one now</Link>
      </p>
    </div>
  )
}