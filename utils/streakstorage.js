import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db, auth } from './firebaseConfig';  // your firebase config file

// Helper: get current user id
const getUid = () => auth.currentUser?.uid;

// Fetch all tasks for current user
export const getTasks = async () => {
  const uid = getUid();
  if (!uid) return [];

  const habitsRef = collection(db, 'users', uid, 'habits');
  const snapshot = await getDocs(query(habitsRef, orderBy('createdAt', 'asc')));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Save or update a single task doc
const saveTaskDoc = async (uid, taskId, taskData) => {
  const taskDoc = doc(db, 'users', uid, 'habits', taskId);
  await setDoc(taskDoc, taskData, { merge: true });
};

// Add a new task
export const addTask = async (taskName) => {
  const uid = getUid();
  if (!uid) return;

  const tasks = await getTasks();
  if (tasks.find(t => t.name === taskName)) return; // task exists

  // Create new habit doc with initial streak = 0
  const newTaskRef = doc(collection(db, 'users', uid, 'habits')); // auto id
  const newTask = {
    name: taskName,
    lastCompleted: null,
    streak: 0,
    createdAt: new Date(),
  };
  await setDoc(newTaskRef, newTask);
};

// Delete a task
export const deleteTask = async (taskName) => {
  const uid = getUid();
  if (!uid) return;

  const tasks = await getTasks();
  const task = tasks.find(t => t.name === taskName);
  if (!task) return;

  const taskDoc = doc(db, 'users', uid, 'habits', task.id);
  await deleteDoc(taskDoc);
};

// Toggle completion and update streak
export const toggleTaskCompletion = async (taskName) => {
  const uid = getUid();
  if (!uid) return;

  const tasks = await getTasks();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Find the task
  const task = tasks.find(t => t.name === taskName);
  if (!task) return;

  let newLastCompleted = null;
  let newStreak = 0;

  if (task.lastCompleted === today) {
    // Unmark today's completion
    const updatedStreak = Math.max(task.streak - 1, 0);
    if (updatedStreak > 0) {
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - updatedStreak);
      newLastCompleted = format(previousDate, 'yyyy-MM-dd');
    }
    newStreak = updatedStreak;
  } else {
    // Mark as completed today, update streak
    const yesterday = format(
      new Date(new Date().setDate(new Date().getDate() - 1)),
      'yyyy-MM-dd'
    );
    newStreak = task.lastCompleted === yesterday ? task.streak + 1 : 1;
    newLastCompleted = today;
  }

  const taskDocRef = doc(db, 'users', uid, 'habits', task.id);
  await updateDoc(taskDocRef, {
    lastCompleted: newLastCompleted,
    streak: newStreak,
  });
};

// Get streak for a task by name
export const getStreak = async (taskName) => {
  const tasks = await getTasks();
  const task = tasks.find(t => t.name === taskName);
  return task ? task.streak : 0;
};


