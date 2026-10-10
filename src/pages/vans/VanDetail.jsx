import { Suspense, use } from "react"
import { Link, useLoaderData, useLocation } from "react-router-dom"
import { getVans } from "../../api/vans.api"
import { getVanReviews } from "../../api/review.api"
import ReviewList from "../../components/ReviewList"
import Stars from "../../components/Stars"
import { averageRating } from "../../utils/review"

export function loader({ params }) {
  return { van: getVans(params.id), reviews: getVanReviews(params.id) }
}

function Van({ vanPromise }) {
  const van = use(vanPromise)

  return (
    <div className="van-detail">
      <img alt={van.name} src={van.imageUrl} />
      <i className={`van-type ${van.type} selected`}>{van.type}</i>
      <h2>{van.name}</h2>
      <p className="van-price"><span>${van.price}</span>/day</p>
      <p>{van.description}</p>
      <Link to="rent" className="link-button">Rent this van</Link>
    </div>
  )
}

function VanReviews({ reviewsPromise }) {
  const reviews = use(reviewsPromise)
  const average = averageRating(reviews)

  return (
    <section className="van-reviews">
      <h2>Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <>
          <p className="review-summary">
            <Stars rating={average} /> {average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
          <ReviewList reviews={reviews} />
        </>
      )}
    </section>
  )
}

const VanDetail = () => {
  const { van, reviews } = useLoaderData()
  const location = useLocation()

  const search = location.state?.search ? `?${location.state.search}` : ""
  const type = location.state?.type || "all"

  return (
    <div className="van-detail-container">
      <Link
        to={`..${search}`}
        relative="path"
        className="back-button"
      >&larr; <span>Back to {type} vans</span></Link>
      <Suspense fallback={<h2>Loading van...</h2>}>
        <Van vanPromise={van} />
      </Suspense>
      <Suspense fallback={<h3>Loading reviews...</h3>}>
        <VanReviews reviewsPromise={reviews} />
      </Suspense>
    </div>
  )
}

export default VanDetail