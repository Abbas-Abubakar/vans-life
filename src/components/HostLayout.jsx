import React from "react"
import { Navigate, NavLink, Outlet, useLoaderData } from "react-router-dom"

const HostLayout = () => {

  // const data = useLoaderData()

  // if (!data.isLoggedIn) {
  //   return <Navigate to="/login" replace />
  // }

  const activeStyles = {
    fontWeight: "bold",
    textDecoration: "underline",
    color: "#161616"
  }   

  return (
    <>
      <nav className="host-nav">
        <NavLink
          to="."
          end
          style={({ isActive }) => isActive ? activeStyles : null}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="income"
          style={({ isActive }) => isActive ? activeStyles : null}
        >
          Income
        </NavLink>

        <NavLink
          to="vans"
          style={({ isActive }) => isActive ? activeStyles : null}
        >
          Vans
        </NavLink>

        <NavLink
          to="reviews"
          style={({ isActive }) => isActive ? activeStyles : null}
        >
          Reviews
        </NavLink>

      </nav>
      <Outlet />
    </>
  )
} 

export default HostLayout