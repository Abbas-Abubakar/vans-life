import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div>
      <h1>Sorry, the page you were looking for was not found</h1>
      <Link to="/"className="notfound-link">Return to Home</Link>
    </div>
  )
}

export default NotFound