export function averageRating(reviews) {
  if (!reviews.length) return null
  const sum = reviews.reduce((total, r) => total + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function sortNewest(reviews) {
  return [...reviews].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}

export function reviewDate(review) {
  return review.createdAt?.toDate().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }) ?? ""
}