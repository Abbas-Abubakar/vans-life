import { Suspense, use } from "react"
import { Link, useLoaderData } from "react-router-dom"
import { getHostVans } from "../../api/vans.api"
import { requireAuth } from "../../utils/requireAuth"
import { useAuth } from "../../context/AuthContext"
import { VAN_TYPES } from "../../validators/vanForm.validator"
import { getHostRentals } from "../../api/rentals.api"

export async function loader({ request }) {
	await requireAuth({ request })
	return { hostVans: getHostVans(), hostRentals: getHostRentals() }
}

function Stats({ vansPromise, rentalsPromise }) {
	const vans = use(vansPromise)
	const rentals = use(rentalsPromise)
	const earned = rentals.reduce((sum, r) => sum + r.total, 0)

	if (vans.length === 0) {
		return (
			<section className="dashboard-empty">
				<p>You haven't listed any vans yet. Add your first one to see your stats here.</p>
				<Link to="vans/new" className="link-button add-van-button">Add a van</Link>
			</section>
		)
	}

	const total = vans.length
	const average = Math.round(vans.reduce((sum, v) => sum + v.price, 0) / total)
	const byType = VAN_TYPES.map(type => ({
		type,
		count: vans.filter(v => v.type === type).length,
	}))

	const recent = [...vans]
		.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
		.slice(0, 3)

	return (
		<>
			<section className="dashboard-stats">
				<div className="dashboard-stat">
					<p>Total vans</p>
					<h2>{total}</h2>
				</div>
				<div className="dashboard-stat">
					<p>Average price</p>
					<h2>${average}<span>/day</span></h2>
				</div>
				<div className="dashboard-stat">
					<p>Total booked</p>
					<h2>${earned}</h2>
				</div>
			</section>

			<section className="dashboard-types">
				{byType.map(({ type, count }) => (
					<div key={type} className="dashboard-type">
						<i className={`van-type ${type} selected`}>{type}</i>
						<span>{count}</span>
					</div>
				))}
			</section>

			<section className="dashboard-vans">
				<div className="dashboard-vans-header">
					<h2>Recently added</h2>
					<Link to="vans">View all</Link>
				</div>
				{recent.map(van => (
					<Link key={van.id} to={`vans/${van.id}`} className="host-van-link-wrapper">
						<div className="host-van-single">
							<img src={van.imageUrl} alt={`Photo of ${van.name}`} />
							<div className="host-van-info">
								<h3>{van.name}</h3>
								<p>${van.price}/day</p>
							</div>
						</div>
					</Link>
				))}
			</section>
		</>
	)
}

export default function Dashboard() {
	const { hostVans, hostRentals } = useLoaderData()
	const { user } = useAuth()
	const firstName = user?.displayName?.split(" ")[0]

	return (
		<div className="dashboard">
			<h1>Welcome{firstName ? `, ${firstName}` : ""}!</h1>
			 <Suspense fallback={<h2>Loading your stats...</h2>}>
        <Stats vansPromise={hostVans} rentalsPromise={hostRentals} />
      </Suspense>
		</div>
	)
}