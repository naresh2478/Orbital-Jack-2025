import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db, auth } from './firebase'; // your firebase config

// Helper: Get current user ID
const getUid = () => auth.currentUser?.uid;

// ✅ Fetch all tasks for current user
export const getTasks = async () => {
  const uid = getUid();
  if (!uid) {
    console.log("❌ No UID found in getTasks()");
    return [];
  }

  const habitsRef = collection(db, 'users', uid, 'habits');
  const snapshot = await getDocs(query(habitsRef, orderBy('createdAt', 'asc')));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// ✅ Save or update a single task doc
const saveTaskDoc = async (uid, taskId, taskData) => {
  const taskDoc = doc(db, 'users', uid, 'habits', taskId);
  await setDoc(taskDoc, taskData, { merge: true });
};

// ✅ Add a new task
export const addTask = async (taskName) => {
  const uid = getUid();
  if (!uid) {
    console.log("❌ No UID in addTask()");
    return;
  }

  const tasks = await getTasks();
  if (tasks.find(t => t.name === taskName)) {
    console.log("⚠️ Task already exists:", taskName);
    return;
  }

  const newTaskRef = doc(collection(db, 'users', uid, 'habits')); // auto id
  const newTask = {
    name: taskName,
    lastCompleted: null,
    streak: 0,
    createdAt: new Date(),
  };
  await setDoc(newTaskRef, newTask);
  console.log("✅ Task added:", taskName);
};

// ✅ Delete a task
export const deleteTask = async (taskName) => {
  const uid = getUid();
  if (!uid) {
    console.log("❌ No UID in deleteTask()");
    return;
  }

  const tasks = await getTasks();
  const task = tasks.find(t => t.name === taskName);
  if (!task) {
    console.log("⚠️ Task not found:", taskName);
    return;
  }

  const taskDoc = doc(db, 'users', uid, 'habits', task.id);
  await deleteDoc(taskDoc);
  console.log("🗑️ Deleted task:", taskName);
};

// ✅ Toggle completion and update streak
export const toggleTaskCompletion = async (taskName) => {
  const uid = getUid();
  if (!uid) {
    console.log("❌ No UID in toggleTaskCompletion()");
    return;
  }

  const tasks = await getTasks();
  const today = format(new Date(), 'yyyy-MM-dd');
  const task = tasks.find(t => t.name === taskName);

  if (!task) {
    console.log("❌ Task not found in toggleTaskCompletion:", taskName);
    return;
  }

  console.log("📌 Before toggle:", task);

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

  console.log(`✅ Task "${taskName}" updated in Firestore`);
  console.log("➡️ New streak:", newStreak, "➡️ New lastCompleted:", newLastCompleted);
};

// ✅ Get streak for a task by name
export const getStreak = async (taskName) => {
  const tasks = await getTasks();
  const task = tasks.find(t => t.name === taskName);
  return task ? task.streak : 0;
};

export const setElevation = async (uid) => {
  if (!uid) {
    console.log("❌ No UID passed to setElevation()");
    return;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error('❌ User doc not found');
    return;
  }

  const userData = userSnap.data();
  const previousElevation = userData.elevation || 0;
  const lastCompletedCount = userData.lastCompletedCount || 0;
  const lastUpdate = userData.lastElevationUpdate || '';

  // Count how many habits completed today currently
  const habitsRef = collection(db, 'users', uid, 'habits');
  const snapshot = await getDocs(habitsRef);

  let currentCompletedCount = 0;
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.lastCompleted === today) {
      currentCompletedCount++;
    }
  });

  let delta = 0;

  if (lastUpdate === today) {
    // Already updated today, calculate difference in completion count
    delta = currentCompletedCount - lastCompletedCount;
  } else {
    // First update today, assume lastCompletedCount = 0 for today
    delta = currentCompletedCount; 
  }

  const newElevation = previousElevation + delta * 10;

  try {
    await updateDoc(userRef, {
      elevation: newElevation,
      lastCompletedCount: currentCompletedCount, 
      //lastCompletedCount tracks how many completed today the last time you called (today)
      lastElevationUpdate: today,
    });
    console.log(`🪜 Elevation updated by ${delta * 10} to ${newElevation} for user ${uid}`);
  } catch (error) {
    console.error('❌ Error updating elevation:', error);
  }
};
