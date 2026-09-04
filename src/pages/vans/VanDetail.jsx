
import { useLocation, Link, useLoaderData } from "react-router-dom"
import { getVans } from "../../api"
import { Suspense, use } from "react"

export function loader({ params }) {
  return { van: getVans(params.id) }
}

const VanDetail = () => {

  const dataPromise = useLoaderData()

  const location = useLocation()

  const search = `?${location.state?.search}` || ""
  const type = location.state?.type || "all"

  function Van({ vanPromise }) {
    const van = use(vanPromise)
    
    return (
      <div className="van-detail">
        <img alt={van.name} src={van.imageUrl} />
        <i className={`van-type ${van.type} selected`}>
          {van.type}
        </i>
        <h2>{van.name}</h2>
        <p className="van-price"><span>${van.price}</span>/day</p>
        <p>{van.description}</p>
        <button className="link-button">Rent this van</button>
      </div>
    )
  }

  return (
    <div className="van-detail-container">
      <Link
        to={`..${search}`}
        relative="path"
        className="back-button"
      >&larr; <span>Back to {type} vans</span></Link>
      <Suspense fallback={<h2>Loading van...</h2>}>
        <Van vanPromise={dataPromise.van}/>
      </Suspense>
    </div>
  )
}

export default VanDetail