import { Suspense, use } from "react"
import { useLoaderData } from "react-router-dom"
import { getHostRentals } from "../../api/rentals.api"
import { requireAuth } from "../../utils/requireAuth"
import { formatDate } from "../../utils/rentals"

export async function loader({ request }) {
  await requireAuth({ request })
  return { rentals: getHostRentals() }
}

function lastSixMonths(rentals) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const amount = rentals
      .filter(r => r.startDate.startsWith(key))
      .reduce((sum, r) => sum + r.total, 0)
    return { key, label: d.toLocaleDateString("en-US", { month: "short" }), amount }
  })
}

function IncomeData({ rentalsPromise }) {
  const rentals = use(rentalsPromise)

  if (rentals.length === 0) {
    return <p>No bookings yet. When someone rents one of your vans, it will show up here.</p>
  }

  const total = rentals.reduce((sum, r) => sum + r.total, 0)
  const months = lastSixMonths(rentals)
  const thisMonth = months[months.length - 1].amount
  const max = Math.max(...months.map(m => m.amount), 1)
  const sorted = [...rentals].sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <>
      <section className="dashboard-stats">
        <div className="dashboard-stat">
          <p>Total booked</p>
          <h2>${total}</h2>
        </div>
        <div className="dashboard-stat">
          <p>This month</p>
          <h2>${thisMonth}</h2>
        </div>
        <div className="dashboard-stat">
          <p>Bookings</p>
          <h2>{rentals.length}</h2>
        </div>
      </section>

      <section className="income-chart">
        {months.map(m => (
          <div key={m.key} className="income-bar-wrapper">
            <span className="income-bar-amount">${m.amount}</span>
            <div className="income-bar" style={{ height: `${(m.amount / max) * 100}%` }} />
            <span className="income-bar-label">{m.label}</span>
          </div>
        ))}
      </section>

      <h2>Bookings</h2>
      {sorted.map(r => (
        <div className="host-van-single income-row" key={r.id}>
          <img src={r.vanImageUrl} alt={`Photo of ${r.vanName}`} />
          <div className="host-van-info">
            <h3>{r.vanName}</h3>
            <p>{r.renterName} · {formatDate(r.startDate)} – {formatDate(r.endDate)}</p>
          </div>
          <strong className="income-amount">${r.total}</strong>
        </div>
      ))}
    </>
  )
}

export default function Income() {
  const { rentals } = useLoaderData()
  return (
    <div className="dashboard">
      <h1>Income</h1>
      <Suspense fallback={<h2>Loading income...</h2>}>
        <IncomeData rentalsPromise={rentals} />
      </Suspense>
    </div>
  )
}