import Stars from "./Stars"
import { reviewDate, sortNewest } from "../utils/review"

export default function ReviewList({ reviews, showVan }) {
  return (
    <div className="review-list">
      {sortNewest(reviews).map(r => (
        <article key={r.id} className="review">
          <Stars rating={r.rating} />
          <h4>
            {r.renterName}
            {showVan && <span> on {r.vanName}</span>}
          </h4>
          <time>{reviewDate(r)}</time>
          {r.text && <p>{r.text}</p>}
        </article>
      ))}
    </div>
  )
}