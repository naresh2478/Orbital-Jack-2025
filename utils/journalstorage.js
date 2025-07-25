import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

import { auth, db } from './firebase';

// 🔹 Helper to get current user UID
const getUid = () => auth.currentUser?.uid;

// ✅ Add a new journal entry
export const addJournalEntry = async (content) => {
  const uid = getUid();
  if (!uid) {
    console.error("❌ No UID in addJournalEntry");
    return;
  }

  const journalRef = collection(db, 'users', uid, 'journalEntries');

  await addDoc(journalRef, {
    content,
    createdAt: serverTimestamp(),
  });

  console.log("✅ Journal entry added");
};

// ✅ Fetch all journal entries (latest first)
export const getJournalEntries = async () => {
  const uid = getUid();
  if (!uid) {
    console.error("❌ No UID in getJournalEntries");
    return [];
  }

  const journalRef = collection(db, 'users', uid, 'journalEntries');
  const q = query(journalRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// ✅ Update a journal entry (if you want editing)
export const updateJournalEntry = async (entryId, newContent) => {
  const uid = getUid();
  if (!uid) {
    console.error("❌ No UID in updateJournalEntry");
    return;
  }

  const entryRef = doc(db, 'users', uid, 'journalEntries', entryId);
  await updateDoc(entryRef, {
    content: newContent,
  });

  console.log("✏️ Journal entry updated:", entryId);
};

// ✅ Delete a journal entry
export const deleteJournalEntry = async (entryId) => {
  const uid = getUid();
  if (!uid) {
    console.error("❌ No UID in deleteJournalEntry");
    return;
  }

  const entryRef = doc(db, 'users', uid, 'journalEntries', entryId);
  await deleteDoc(entryRef);

  console.log("🗑️ Journal entry deleted:", entryId);
};
