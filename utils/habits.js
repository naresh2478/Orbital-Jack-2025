import {
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
  getDoc, query, orderBy,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db, auth } from './firebase';

const getUid = () => auth.currentUser?.uid;

export const getTasks = async () => {
  const uid = getUid();
  if (!uid) return [];

  const habitsRef = collection(db, 'users', uid, 'habits');
  const snapshot = await getDocs(query(habitsRef, orderBy('createdAt', 'asc')));

  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addTask = async (taskName) => {
  const uid = getUid();
  if (!uid) return;

  const tasks = await getTasks();
  if (tasks.find(t => t.name === taskName)) return;

  const newTaskRef = doc(collection(db, 'users', uid, 'habits'));
  await setDoc(newTaskRef, {
    name: taskName,
    lastCompleted: null,
    streak: 0,
    createdAt: new Date(),
  });
};

export const deleteTaskById = async (taskId) => {
  const uid = getUid();
  if (!uid) return;

  const taskDoc = doc(db, 'users', uid, 'habits', taskId);
  await deleteDoc(taskDoc);
};

export const renameTaskById = async (taskId, newName) => {
  const uid = getUid();
  if (!uid) return;

  const taskDoc = doc(db, 'users', uid, 'habits', taskId);
  await updateDoc(taskDoc, { name: newName });
};

export const toggleTaskById = async (taskId) => {
  const uid = getUid();
  if (!uid) return;

  const taskDoc = doc(db, 'users', uid, 'habits', taskId);
  const snap = await getDoc(taskDoc);
  if (!snap.exists()) return;

  const task = snap.data();
  const today = format(new Date(), 'yyyy-MM-dd');

  let newLastCompleted = null;
  let newStreak = 0;

  if (task.lastCompleted === today) {
    const updatedStreak = Math.max(task.streak - 1, 0);
    if (updatedStreak > 0) {
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - updatedStreak);
      newLastCompleted = format(previousDate, 'yyyy-MM-dd');
    }
    newStreak = updatedStreak;
  } else {
    const yesterday = format(
      new Date(new Date().setDate(new Date().getDate() - 1)),
      'yyyy-MM-dd'
    );
    newStreak = task.lastCompleted === yesterday ? task.streak + 1 : 1;
    newLastCompleted = today;
  }

  await updateDoc(taskDoc, {
    lastCompleted: newLastCompleted,
    streak: newStreak,
  });
};

export const getStreakById = async (taskId) => {
  const uid = getUid();
  if (!uid) return 0;

  const taskDoc = doc(db, 'users', uid, 'habits', taskId);
  const snap = await getDoc(taskDoc);
  return snap.exists() ? snap.data().streak : 0;
};
