import React, { useState } from "react"
import { useLoaderData } from "react-router-dom"
import { loginUser } from "../api"

export function loader({ request }) {
  return new URL(request.url).searchParams.get("message")
}

export default function Login() {
  const [loginFormData, setLoginFormData] = React.useState({ email: "", password: "" })
  const message = useLoaderData()
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)
  function handleSubmit(e) {
    e.preventDefault()
    async function loginCred() {
      try {
        setStatus("submitting")
        setError(null)
        const user = await loginUser(loginFormData)
        console.log(user);
      } catch (error) {
        setError(error)
      } finally {
        setStatus("idle")
      }

    }

    loginCred()
  }

  function handleChange(e) {
    const { name, value } = e.target
    setLoginFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="login-container">
      {message && <h2 className="red">{message}</h2>}
      <h1>Sign in to your account</h1>
      {error && <h3 className="red">{error.message}</h3>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          name="email"
          onChange={handleChange}
          type="email"
          placeholder="Email address"
          value={loginFormData.email}
        />
        <input
          name="password"
          onChange={handleChange}
          type="password"
          placeholder="Password"
          value={loginFormData.password}
        />
        <button disabled={status === "submitting"}>Log in</button>
      </form>

    </div>
  )

}