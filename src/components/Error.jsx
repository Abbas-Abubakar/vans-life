import { Link, useRouteError } from "react-router-dom"

export default function ErrorPage() {
  const error = useRouteError()
  const message = error?.message || error?.statusText || "Something went wrong."

  return (
    <div className="error-container">
      <h1>Error: {message}</h1>
      {error?.status && <p>Status code: {error.status}</p>}
      <Link to="/" className="link-button">Back to home</Link>
    </div>
  )
}