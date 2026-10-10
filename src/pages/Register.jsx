import { Form, Link, redirect, useActionData, useNavigation } from "react-router-dom"
import { registerUser } from "../api/auth.api"

export async function action({ request }) {
  const formData = await request.formData()
  const name = formData.get("name")?.trim()
  const email = formData.get("email")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")

  if (!name) return "Please enter your name."
  if (password !== confirmPassword) return "Passwords don't match."

  try {
    await registerUser({ name, email, password })
  } catch (err) {
    return err.message
  }

  return redirect("/host")
}

export default function Register() {
  const errorMessage = useActionData()
  const { state } = useNavigation()

  return (
    <div className="login-container">
      <h1>Create your account</h1>
      {errorMessage && <h3 className="red">{errorMessage}</h3>}
      <Form method="post" className="login-form" replace>
        <input name="name" type="text" placeholder="Full name" required />
        <input name="email" type="email" placeholder="Email address" required />
        <input name="password" type="password" placeholder="Password" required />
        <input name="confirmPassword" type="password" placeholder="Confirm password" required />
        <button disabled={state === "submitting"}>
          {state === "submitting" ? "Creating account..." : "Create account"}
        </button>
      </Form>
      <p className="login-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}