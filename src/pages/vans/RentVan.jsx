import { useState } from "react"
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router-dom"
import { getVans } from "../../api/vans.api"
import { createRental } from "../../api/rentals.api"
import { getCurrentUser } from "../../api/auth.api"
import { requireAuth } from "../../utils/requireAuth"
import { countDays, todayISO, validateDates } from "../../utils/rentals"

export async function loader({ request, params }) {
  await requireAuth({ request })
  const [van, user] = await Promise.all([getVans(params.id), getCurrentUser()])
  if (van.hostId === user.uid) {
    throw { message: "You can't rent your own van.", status: 403 }
  }
  return van
}

export async function action({ request, params }) {
  await requireAuth({ request })
  const formData = await request.formData()
  const startDate = formData.get("startDate")
  const endDate = formData.get("endDate")

  const error = validateDates(startDate, endDate)
  if (error) return error

  try {
    const van = await getVans(params.id) // fresh read, so the price can't be tampered with
    await createRental({ van, startDate, endDate })
  } catch (err) {
    return err.message || "Could not complete your booking."
  }

  return redirect("/trips?booked=1")
}

export default function RentVan() {
  const van = useLoaderData()
  const errorMessage = useActionData()
  const { state } = useNavigation()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const days = startDate && endDate && !validateDates(startDate, endDate)
    ? countDays(startDate, endDate)
    : 0

  return (
    <div className="van-detail-container">
      <Link to=".." relative="path" className="back-button">&larr; <span>Back to van</span></Link>
      <h1>Rent {van.name}</h1>
      <p className="van-price"><span>${van.price}</span>/day</p>

      {errorMessage && <h3 className="red">{errorMessage}</h3>}
      <Form method="post" className="van-form" replace>
        <label htmlFor="startDate">Start date</label>
        <input
          id="startDate" name="startDate" type="date" required
          min={todayISO()} value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <label htmlFor="endDate">End date</label>
        <input
          id="endDate" name="endDate" type="date" required
          min={startDate || todayISO()} value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        {days > 0 && (
          <p className="rent-summary">
            {days} {days === 1 ? "day" : "days"} × ${van.price} = <strong>${days * van.price}</strong>
          </p>
        )}

        <button disabled={state === "submitting"}>
          {state === "submitting" ? "Booking..." : "Confirm booking"}
        </button>
      </Form>
    </div>
  )
}