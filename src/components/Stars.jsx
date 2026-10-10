export default function Stars({ rating }) {
  const filled = Math.round(rating)
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(filled)}
      <span className="stars-empty">{"★".repeat(5 - filled)}</span>
    </span>
  )
}