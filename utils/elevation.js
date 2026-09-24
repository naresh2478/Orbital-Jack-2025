import { collection, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from './firebase';
import { MOUNTAINS } from './constants';

export const setElevation = async (uid) => {
  if (!uid) return;

  const today = format(new Date(), 'yyyy-MM-dd');
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const previousElevation = userData.elevation || 0;
  let conquered = userData.conquered || 0;
  let conqueredMountains = userData.conqueredMountains || [];
  const lastCompletedCount = userData.lastCompletedCount || 0;
  const lastUpdate = userData.lastElevationUpdate || '';
  let totalElevation = userData.totalElevation || 0;

  if (conquered >= MOUNTAINS.length) return;

  const habitsRef = collection(db, 'users', uid, 'habits');
  const snapshot = await getDocs(habitsRef);

  let currentCompletedCount = 0;
  let bonusElevation = 0;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.lastCompleted === today) {
      currentCompletedCount++;

      if (data.streak === 21) {
        bonusElevation += 50;
        const habitDocRef = doc(db, 'users', uid, 'habits', docSnap.id);
        updateDoc(habitDocRef, { streak: 0 });
      }
    }
  });

  const delta = lastUpdate === today
    ? currentCompletedCount - lastCompletedCount
    : currentCompletedCount;

  let newElevation = previousElevation + delta * 10 + bonusElevation;
  totalElevation += delta * 10 + bonusElevation;

  while (newElevation < 0 && conquered > 0) {
    conquered -= 1;
    const prevMountain = MOUNTAINS[conquered];
    conqueredMountains.pop();
    newElevation += prevMountain.peak;
  }

  const currentMountain = MOUNTAINS[conquered];
  if (currentMountain && newElevation >= currentMountain.peak) {
    conquered += 1;
    conqueredMountains.push(currentMountain.name);
    newElevation = 0;
  }

  const currentMountainName = conquered < MOUNTAINS.length
    ? MOUNTAINS[conquered].name
    : 'All Mountains Conquered!';

  try {
    await updateDoc(userRef, {
      elevation: newElevation,
      totalElevation,
      conquered,
      conqueredMountains,
      lastCompletedCount: currentCompletedCount,
      lastElevationUpdate: today,
      currentMountain: currentMountainName,
    });
  } catch (error) {
    console.error('Error updating elevation:', error);
  }
};
