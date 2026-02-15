import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

export type { User }

// Sign up with email and password
export async function signUp(email: string, password: string): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Create user profile document
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email: userCredential.user.email,
    createdAt: serverTimestamp(),
    preferences: {
      theme: 'system', // 'light' | 'dark' | 'system'
      resetTime: '00:00', // Daily reset time in HH:mm format
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  return userCredential
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password)
}

// Sign out
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth)
}

// Subscribe to auth state changes
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser
}

// Get user preferences
export async function getUserPreferences(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists()) {
    return userDoc.data().preferences
  }
  return null
}

// Update user preferences
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<{
    theme: 'light' | 'dark' | 'system'
    resetTime: string
    timezone: string
  }>
) {
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    await setDoc(userRef, {
      ...userDoc.data(),
      preferences: {
        ...userDoc.data().preferences,
        ...preferences,
      },
    })
  }
}
