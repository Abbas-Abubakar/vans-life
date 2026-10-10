import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs,
  query, serverTimestamp, updateDoc, where
} from "firebase/firestore"
import { db } from "../config/firebase"
import { getCurrentUser } from "./auth.api"


const vansRef = collection(db, "vans")

const toVan = (snap) => ({ id: snap.id, ...snap.data() })
const notFound = () => ({ message: "Van not found", status: 404 })

// Public: all vans, or one van by id
export async function getVans(id) {
  try {
    if (id) {
      const snap = await getDoc(doc(db, "vans", id))
      if (!snap.exists()) throw notFound()
      return toVan(snap)
    }
    const snap = await getDocs(vansRef)
    return snap.docs.map(toVan)
  } catch (err) {
    throw err.status ? err : { message: "Failed to fetch vans", status: 500 }
  }
}

// Private: only the logged-in user's vans
export async function getHostVans(id) {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }

  try {
    if (id) {
      const snap = await getDoc(doc(db, "vans", id))
      // Public read is allowed, so check ownership here too
      if (!snap.exists() || snap.data().hostId !== user.uid) throw notFound()
      return toVan(snap)
    }
    const q = query(vansRef, where("hostId", "==", user.uid))
    const snap = await getDocs(q)
    return snap.docs.map(toVan)
  } catch (err) {
    throw err.status ? err : { message: "Failed to fetch your vans", status: 500 }
  }
}

export async function addVan(data) {
  const user = await getCurrentUser()
  if (!user) throw { message: "You must be logged in", status: 401 }
  await addDoc(vansRef, { ...data, hostId: user.uid, createdAt: serverTimestamp() })
}

export async function updateVan(id, data) {
  await updateDoc(doc(db, "vans", id), data)
}

export async function deleteVan(id) {
  await deleteDoc(doc(db, "vans", id))
}