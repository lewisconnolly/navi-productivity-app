import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

// Generic helper to get a subcollection reference for a user
export function getUserCollection(userId: string, collectionName: string) {
  return collection(db, 'users', userId, collectionName)
}

// Generic helper to get a document reference
export function getUserDoc(userId: string, collectionName: string, docId: string) {
  return doc(db, 'users', userId, collectionName, docId)
}

// Add a document to a user's subcollection
export async function addUserDocument<T extends DocumentData>(
  userId: string,
  collectionName: string,
  data: T
) {
  const collectionRef = getUserCollection(userId, collectionName)
  return addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Update a document in a user's subcollection
export async function updateUserDocument<T extends Partial<DocumentData>>(
  userId: string,
  collectionName: string,
  docId: string,
  data: T
) {
  const docRef = getUserDoc(userId, collectionName, docId)
  return updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// Delete a document from a user's subcollection
export async function deleteUserDocument(
  userId: string,
  collectionName: string,
  docId: string
) {
  const docRef = getUserDoc(userId, collectionName, docId)
  return deleteDoc(docRef)
}

// Get a single document from a user's subcollection
export async function getUserDocument(
  userId: string,
  collectionName: string,
  docId: string
) {
  const docRef = getUserDoc(userId, collectionName, docId)
  const snapshot = await getDoc(docRef)
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() }
  }
  return null
}

// Get all documents from a user's subcollection
export async function getUserDocuments(
  userId: string,
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const collectionRef = getUserCollection(userId, collectionName)
  const q = query(collectionRef, ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Subscribe to a user's subcollection
export function subscribeToUserCollection(
  userId: string,
  collectionName: string,
  callback: (docs: Array<{ id: string } & DocumentData>) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const collectionRef = getUserCollection(userId, collectionName)
  const q = query(collectionRef, ...constraints)

  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    callback(docs)
  }, (error) => {
    console.error(`Firestore subscription error (${collectionName}):`, error)
    callback([])
  })
}

// Subscribe to a single document
export function subscribeToUserDocument(
  userId: string,
  collectionName: string,
  docId: string,
  callback: (doc: ({ id: string } & DocumentData) | null) => void
): Unsubscribe {
  const docRef = getUserDoc(userId, collectionName, docId)

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() })
    } else {
      callback(null)
    }
  }, (error) => {
    console.error(`Firestore subscription error (${collectionName}/${docId}):`, error)
    callback(null)
  })
}

// Export query helpers for convenience
export { query, where, orderBy }
