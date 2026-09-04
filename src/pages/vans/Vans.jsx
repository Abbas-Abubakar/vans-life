
import { Await, Link, useLoaderData, useSearchParams } from "react-router-dom"
import { getVans } from "../../api"
import { Suspense, use } from "react"

export function loader() {
  return { vans: getVans() }

}

const Vans = () => {
  const dataPromise = useLoaderData()

  const [searchParams, setSearchParams] = useSearchParams()
  const typeFilter = searchParams.get("type")

  const handleFilterChange = (key, value) => {
    setSearchParams((prev) => {
      if (value == null) {
        prev.delete(key)
      } else {
        prev.set(key, value);
      }
      return prev;
    })
  }

  function VansList({ vansPromise }) {
    const vans = use(vansPromise)
    const displayedVans = typeFilter ? vans.filter(van => van.type === typeFilter) : vans

    const vanElements = displayedVans.map(van => (
      <div key={van.id} className="van-tile">
        <Link to={van.id} state={{ search: searchParams.toString(), type: typeFilter }}>
          <img alt={van.name} src={van.imageUrl} />
          <div className="van-info">
            <h3>{van.name}</h3>
            <p>${van.price}<span>/day</span></p>
          </div>
          <i className={`van-type ${van.type} selected`}>{van.type}</i>
        </Link>
      </div>

    ))

    return (
      <>
        <div className="van-list-filter-buttons">
          <button
            className={`van-type simple ${typeFilter?.toLowerCase() === "simple" ? "selected" : ""}`}
            onClick={() => handleFilterChange("type", "simple")}
          >
            Simple
          </button>

          <button
            className={`van-type luxury ${typeFilter?.toLowerCase() === "luxury" ? "selected" : ""}`}
            onClick={() => handleFilterChange("type", "luxury")}
          >
            Luxury
          </button>

          <button
            className={`van-type rugged ${typeFilter?.toLowerCase() === "rugged" ? "selected" : ""}`}
            onClick={() => handleFilterChange("type", "rugged")}
          >
            Rugged
          </button>

          {typeFilter && (
            <button
              className="van-type clear-filters"
              onClick={() => handleFilterChange("type", null)}
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="van-list">
          {vanElements}
        </div>
      </>
    )
  }
  return (
    <div className="van-list-container">
      <h1>Explore our van options</h1>
      <Suspense fallback={<h2>Loading vans...</h2>}>
         <VansList vansPromise={dataPromise.vans} />
      </Suspense>
    </div>
  )
}


export default Vans