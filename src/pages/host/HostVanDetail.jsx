import { Form, Link, NavLink, Outlet, useLoaderData } from "react-router-dom"
import { getHostVans, deleteVan } from "../../api/vans.api"
import { requireAuth } from "../../utils/requireAuth"
import { Suspense, use } from "react"

export async function loader({ request, params }) {
  await requireAuth({ request })
  return { hostVan: getHostVans(params.id) }
}

export async function deleteAction({ request, params }) {
  await requireAuth({ request })
  await deleteVan(params.id)
  return redirect("/host/vans")
}

const HostVanDetail = () => {
  const dataPromise = useLoaderData()

  const activeStyles = {
    fontWeight: "bold",
    textDecoration: "underline",
    color: "#161616"
  }

  function HostVan({ vanPromise }) {
    const currentVan = use(vanPromise)

    return (
      <div className="host-van-detail-layout-container">
        <div className="host-van-detail">
          <img src={currentVan.imageUrl} />
          <div className="host-van-detail-info-text">
            <i
              className={`van-type van-type-${currentVan.type}`}
            >
              {currentVan.type}
            </i>
            <h3>{currentVan.name}</h3>
            <h4>${currentVan.price}/day</h4>
          </div>
        </div>

        <nav className="host-van-detail-nav">
          <NavLink
            to="."
            end
            style={({ isActive }) => isActive ? activeStyles : null}
          >
            Details
          </NavLink>
          <NavLink
            to="pricing"
            style={({ isActive }) => isActive ? activeStyles : null}
          >
            Pricing
          </NavLink>
          <NavLink
            to="photos"
            style={({ isActive }) => isActive ? activeStyles : null}
          >
            Photos
          </NavLink>
        </nav>
        <Outlet context={{ currentVan }} />
        <div className="host-van-actions">
          <Link to="edit" className="link-button edit-button">Edit van</Link>
          <Form
            method="post"
            action="delete"
            onSubmit={(e) => {
              if (!confirm("Delete this van? This can't be undone.")) e.preventDefault()
            }}
          >
            <button className="link-button delete-button">Delete van</button>
          </Form>
        </div>
      </div>
    )
  }

  return (
    <section>
      <Link
        to=".."
        relative="path"
        className="back-button"
      >&larr; <span>Back to all vans</span></Link>
      <Suspense fallback={<h2>Loading van...</h2>}>
        <HostVan vanPromise={dataPromise.hostVan} />
      </Suspense>

    </section>
  )
}

export default HostVanDetail
