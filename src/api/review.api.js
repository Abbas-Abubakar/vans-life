import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs,
  query, serverTimestamp, setDoc, updateDoc, where
} from "firebase/firestore"

import { db } from "../config/firebase"
import { getCurrentUser } from "./auth.api"

const reviewsRef = collection(db, "reviews")
const toVan = (snap) => ({ id: snap.id, ...snap.data() })

// One rental (only if it belongs to the logged-in user)
export async function getRental(id) {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }
  try {
    const snap = await getDoc(doc(db, "rentals", id))
    if (!snap.exists() || snap.data().renterId !== user.uid) throw 0
    return toVan(snap)
  } catch {
    // Reading a missing document is a permissions error under our rules, so treat both as not found
    throw { message: "Trip not found", status: 404 }
  }
}

export async function createReview({ rental, rating, text }) {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }

  // Using the rental's ID as the review's ID means a trip can only be reviewed once
  await setDoc(doc(db, "reviews", rental.id), {
    rentalId: rental.id,
    vanId: rental.vanId,
    vanName: rental.vanName,
    hostId: rental.hostId,
    renterId: user.uid,
    renterName: user.displayName || "Anonymous",
    rating,
    text,
    createdAt: serverTimestamp(),
  })
}

export async function getVanReviews(vanId) {
  try {
    const snap = await getDocs(query(reviewsRef, where("vanId", "==", vanId)))
    return snap.docs.map(toVan)
  } catch(err) {
    throw { message: "Failed to fetch reviews", status: 500 }
  }
}

export async function getHostReviews() {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }
  try {
    const snap = await getDocs(query(reviewsRef, where("hostId", "==", user.uid)))
    return snap.docs.map(toVan)
  } catch(err) {
    throw { message: "Failed to fetch your reviews", status: 500 }
  }
}

export async function getMyReviews() {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }
  try {
    const snap = await getDocs(query(reviewsRef, where("renterId", "==", user.uid)))
    return snap.docs.map(toVan)
  } catch(err) {
    throw { message: "Failed to fetch your reviews", status: 500 }
  }
}