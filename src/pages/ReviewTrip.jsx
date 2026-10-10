import { Link, Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router-dom"
import { createReview, getRental } from "../api/review.api"
import { requireAuth } from "../utils/requireAuth"
import { hasEnded } from "../utils/rentals"

export async function loader({ request, params }) {
  await requireAuth({ request })
  const rental = await getRental(params.id)
  if (!hasEnded(rental)) {
    throw { message: "You can review a van once your trip has ended.", status: 403 }
  }
  return rental
}

export async function action({ request, params }) {
  await requireAuth({ request })
  const formData = await request.formData()
  const rating = Number(formData.get("rating"))
  const text = formData.get("text")?.trim() || ""

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return "Please choose a rating."
  if (text.length > 1000) return "Reviews can be at most 1000 characters."

  try {
    const rental = await getRental(params.id)
    if (!hasEnded(rental)) return "You can review a van once your trip has ended."
    await createReview({ rental, rating, text })
  } catch (err) {
    return err.status
      ? err.message
      : "Could not save your review. You may have already reviewed this trip."
  }

  return redirect("/trips?reviewed=1")
}

export default function ReviewTrip() {
  const rental = useLoaderData()
  const errorMessage = useActionData()
  const { state } = useNavigation()

  return (
    <div className="van-detail-container">
      <Link to="/trips" className="back-button">&larr; <span>Back to trips</span></Link>
      <h1>Review {rental.vanName}</h1>

      {errorMessage && <h3 className="red">{errorMessage}</h3>}
      <Form method="post" className="van-form" replace>
        <label>Your rating</label>
        <div className="star-input" role="radiogroup" aria-label="Rating">
          {[5, 4, 3, 2, 1].map(n => (
            <span key={n} className="star-option">
              <input type="radio" id={`star${n}`} name="rating" value={n} required />
              <label htmlFor={`star${n}`} title={`${n} ${n === 1 ? "star" : "stars"}`}>★</label>
            </span>
          ))}
        </div>

        <label htmlFor="text">Your review (optional)</label>
        <textarea id="text" name="text" rows="5" maxLength="1000" placeholder="How was your trip?" />

        <button disabled={state === "submitting"}>
          {state === "submitting" ? "Submitting..." : "Submit review"}
        </button>
      </Form>
    </div>
  )
}