import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore"
import { countDays } from "../utils/rentals"
import { getCurrentUser } from "./auth.api"
import { db } from "../config/firebase"

const rentalsRef = collection(db, "rentals")
const toVan = (snap) => ({ id: snap.id, ...snap.data() })

export async function createRental({ van, startDate, endDate }) {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }

  const days = countDays(startDate, endDate)
  await addDoc(rentalsRef, {
    vanId: van.id,
    vanName: van.name,          // copied so history survives if the van is deleted
    vanImageUrl: van.imageUrl,
    hostId: van.hostId,
    renterId: user.uid,
    renterName: user.displayName || user.email,
    startDate,
    endDate,
    days,
    total: van.price * days,
    createdAt: serverTimestamp(),
  })
}

// Bookings on the logged-in user's vans
export async function getHostRentals() {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }
  try {
    const snap = await getDocs(query(rentalsRef, where("hostId", "==", user.uid)))
    return snap.docs.map(toVan)
  } catch {
    throw { message: "Failed to fetch your bookings", status: 500 }
  }
}

// Trips the logged-in user has booked
export async function getMyRentals() {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }
  try {
    const snap = await getDocs(query(rentalsRef, where("renterId", "==", user.uid)))
    return snap.docs.map(toVan)
  } catch {
    throw { message: "Failed to fetch your trips", status: 500 }
  }
}