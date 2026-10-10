import { Suspense, use } from "react"
import { useLoaderData } from "react-router-dom"
import { getHostReviews } from "../../api/review.api"
import { requireAuth } from "../../utils/requireAuth"
import { averageRating } from "../../utils/review"
import ReviewList from "../../components/ReviewList"
import Stars from "../../components/Stars"

export async function loader({ request }) {
  await requireAuth({ request })
  return { reviews: getHostReviews() }
}

function ReviewsData({ reviewsPromise }) {
  const reviews = use(reviewsPromise)

  if (reviews.length === 0) {
    return <p>No reviews yet. Renters can review a van once their trip has ended.</p>
  }

  const average = averageRating(reviews)
  const breakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
  }))

  return (
    <>
      <section className="reviews-overview">
        <div className="reviews-average">
          <h2>{average.toFixed(1)}</h2>
          <Stars rating={average} />
          <p>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
        </div>
        <div className="reviews-breakdown">
          {breakdown.map(({ stars, count }) => (
            <div key={stars} className="rating-row">
              <span>{stars} ★</span>
              <div className="rating-track">
                <div className="rating-fill" style={{ width: `${(count / reviews.length) * 100}%` }} />
              </div>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </section>

      <h2>All reviews</h2>
      <ReviewList reviews={reviews} showVan />
    </>
  )
}

export default function Reviews() {
  const { reviews } = useLoaderData()
  return (
    <div className="dashboard">
      <h1>Reviews</h1>
      <Suspense fallback={<h2>Loading reviews...</h2>}>
        <ReviewsData reviewsPromise={reviews} />
      </Suspense>
    </div>
  )
}