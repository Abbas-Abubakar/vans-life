import React, { useState } from "react"
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router-dom"
import { loginUser } from "../api"

export function loader({ request }) {
  return new URL(request.url).searchParams.get("message")
}

export async function action({ request }) {
  const formData = await request.formData()
  const email = formData.get("email")
  const password = formData.get("password")
  const pathname = new URL(request.url).searchParams.get("redirectTo") || "/host"
  console.log(pathname);
  
  try {
      const data = await loginUser({ email, password })
      localStorage.setItem("loggedIn", true)
    } catch (err) {
      return err.message
    }
    
    // throw redirect(pathname);
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
        <input
          name="email"
          type="email"
          placeholder="Email address"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
        />
        <button disabled={state === "submitting"}>{state === "submitting" ? "Logging in" : "Log in" }</button>
      </Form>

    </div>
  )

}