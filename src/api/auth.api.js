import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../config/firebase"

function friendlyError(err) {
  const messages = {
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
  }
  return { message: messages[err.code] || "Something went wrong. Please try again.", code: err.code }
}

export async function registerUser({ name, email, password }) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: name })
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
    })
    return user
  } catch (err) {
    throw friendlyError(err)
  }
}

export async function loginUser({ email, password }) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  } catch (err) {
    throw friendlyError(err)
  }
}

export function logoutUser() {
  return signOut(auth)
}

// Loaders use this: waits for Firebase to restore the session, then returns the user (or null)
export async function getCurrentUser() {
  await auth.authStateReady()
  return auth.currentUser
}