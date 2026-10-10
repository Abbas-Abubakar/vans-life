import { Suspense, use } from "react"
import { Link, useLoaderData, useSearchParams } from "react-router-dom"
import { getMyRentals } from "../api/rentals.api"
import { getMyReviews } from "../api/review.api"
import { requireAuth } from "../utils/requireAuth"
import { formatDate, hasEnded } from "../utils/rentals"
import Stars from "../components/Stars"

export async function loader({ request }) {
  await requireAuth({ request })
  return { trips: Promise.all([getMyRentals(), getMyReviews()]) }
}

function TripsList({ tripsPromise }) {
  const [rentals, reviews] = use(tripsPromise)

  if (rentals.length === 0) {
    return (
      <div className="host-vans-list">
        <p>You haven't booked any vans yet.</p>
        <Link to="/vans" className="link-button add-van-button">Explore vans</Link>
      </div>
    )
  }

  const reviewsByRental = new Map(reviews.map(r => [r.rentalId, r]))
  const sorted = [...rentals].sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <div className="host-vans-list">
      {sorted.map(r => {
        const review = reviewsByRental.get(r.id)
        return (
          <div className="host-van-single" key={r.id}>
            <img src={r.vanImageUrl} alt={`Photo of ${r.vanName}`} />
            <div className="host-van-info">
              <h3>{r.vanName}</h3>
              <p>{formatDate(r.startDate)} – {formatDate(r.endDate)}</p>
              <p>{r.days} {r.days === 1 ? "day" : "days"} · ${r.total}</p>
              <div className="trip-review">
                {review ? (
                  <Stars rating={review.rating} />
                ) : hasEnded(r) ? (
                  <Link to={`/trips/${r.id}/review`}>Leave a review</Link>
                ) : (
                  <span>You can review after your trip ends</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Trips() {
  const { trips } = useLoaderData()
  const [searchParams] = useSearchParams()

  return (
    <section>
      <h1 className="host-vans-title">Your trips</h1>
      {searchParams.get("booked") && <p className="trip-success">Booking confirmed!</p>}
      {searchParams.get("reviewed") && <p className="trip-success">Thanks for your review!</p>}
      <Suspense fallback={<h2>Loading trips...</h2>}>
        <TripsList tripsPromise={trips} />
      </Suspense>
    </section>
  )
}