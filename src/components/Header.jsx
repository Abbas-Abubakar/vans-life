import { Link, NavLink, useNavigate } from "react-router-dom"
import avatarIcon from "../assets/images/avatar-icon.png"
import { useAuth } from "../context/AuthContext"
import { logoutUser } from "../api/auth.api"

const Header = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const activeStyles = {
    fontWeight: "bold",
    textDecoration: "underline",
    color: "#161616"
  }

  async function handleLogout() {
    await logoutUser()
    navigate("/")
  }

  return (
    <header>
      <Link className="site-logo" to="/">#VanLife</Link>
      <nav>
        <NavLink to="/host" style={({ isActive }) => isActive ? activeStyles : null}>
          Host
        </NavLink>
        <NavLink to="/about" style={({ isActive }) => isActive ? activeStyles : null}>
          About
        </NavLink>
        <NavLink to="/vans" style={({ isActive }) => isActive ? activeStyles : null}>
          Vans
        </NavLink>
        {!loading && (
          user ? (
            <button className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="login-link">
              <img src={avatarIcon} className="login-icon" />
            </Link>
          )
        )}
      </nav>
    </header>
  )
}

export default Header