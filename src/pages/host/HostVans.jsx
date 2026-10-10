import { Link, useLoaderData } from "react-router-dom"
import { getHostVans } from "../../api/vans.api"
import { requireAuth } from "../../utils/requireAuth"
import { Suspense, use } from "react"

export async function loader({ request }) {
  await requireAuth({ request })
  return { hostVans: getHostVans() }
}

const HostVans = () => {
  const dataPromise = useLoaderData()

  function VansList({ vansPromise }) {
    const vans = use(vansPromise)

    if (vans.length === 0) {
      return (
        <div className="host-vans-list">
          <p>You haven't listed any vans yet. Add your first one to get started.</p>
        </div>
      )
    }

    const hostVansEls = vans.map(van => (
      <Link
        to={van.id}
        key={van.id}
        className="host-van-link-wrapper"
      >
        <div className="host-van-single" key={van.id}>
          <img src={van.imageUrl} alt={`Photo of ${van.name}`} />
          <div className="host-van-info">
            <h3>{van.name}</h3>
            <p>${van.price}/day</p>
          </div>
        </div>
      </Link>
    ))

    return (
      <div className="host-vans-list">
        <section>
          {hostVansEls}
        </section>
      </div>
    )
  }



  return (
    <section>
      <div className="host-vans-header">
        <h1 className="host-vans-title">Your listed vans</h1>
        <Link to="new" className="link-button add-van-button">Add a van</Link>
      </div>
      <Suspense fallback={<h2>Loading vans...</h2>}>
        <VansList vansPromise={dataPromise.hostVans} />
      </Suspense>
    </section>
  )
}

export default HostVans