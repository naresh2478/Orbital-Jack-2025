import { collection, query, where, getDocs, getDoc, arrayRemove, arrayUnion, updateDoc, doc, documentId } from 'firebase/firestore';
import { auth, db } from './firebase';

export const initializeSocialFields = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      privacy: 'public',
      pendingFollowers: [],
      followers: [],
      following: [],
    });
  } catch (error) {
    console.error('Error initializing social fields:', error);
  }
};

export const searchUserByEmail = async (email) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const userDoc = querySnapshot.docs[0];
    return { uid: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error searching user by email:', error);
    return null;
  }
};

export const followUser = async (targetUserId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

  try {
    const targetUserRef = doc(db, 'users', targetUserId);
    const currentUserRef = doc(db, 'users', currentUserId);

    const targetUserSnap = await getDoc(targetUserRef);
    if (!targetUserSnap.exists()) return;

    const targetUserData = targetUserSnap.data();

    if (targetUserData.privacy === 'private') {
      await updateDoc(targetUserRef, {
        pendingFollowers: arrayUnion(currentUserId),
      });
    } else {
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUserId),
      });
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId),
      });
    }
  } catch (error) {
    console.error('Error processing followUser:', error);
  }
};

export const unfollowUser = async (targetUserId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId || !targetUserId) return;

  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId),
    });

    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId),
      pendingFollowers: arrayRemove(currentUserId),
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
  }
};

export const setPrivacy = async (isPrivate) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) return;

  try {
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
      privacy: isPrivate ? 'private' : 'public',
    });
  } catch (error) {
    console.error('Error setting privacy:', error);
  }
};

export const approveFollower = async (followerId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId || !followerId) return;

  try {
    const userRef = doc(db, 'users', currentUserId);
    const followerUserRef = doc(db, 'users', followerId);

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    if (!(userData.pendingFollowers || []).includes(followerId)) return;

    await updateDoc(userRef, {
      followers: arrayUnion(followerId),
      pendingFollowers: arrayRemove(followerId),
    });

    await updateDoc(followerUserRef, {
      following: arrayUnion(currentUserId),
    });
  } catch (error) {
    console.error('Error approving follower:', error);
  }
};

async function batchFetchProfiles(userIds) {
  if (userIds.length === 0) return [];

  const profiles = [];
  // Firestore `in` queries max 10 items per batch
  for (let i = 0; i < userIds.length; i += 10) {
    const batch = userIds.slice(i, i + 10);
    const q = query(collection(db, 'users'), where(documentId(), 'in', batch));
    const snap = await getDocs(q);
    snap.forEach(d => {
      profiles.push({ uid: d.id, email: d.data().email || '' });
    });
  }
  return profiles;
}

export const getFollowers = async (uid) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return [];
    return batchFetchProfiles(userSnap.data().followers || []);
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
};

export const getFollowing = async (uid) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return [];
    return batchFetchProfiles(userSnap.data().following || []);
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
};

export const getPendingFollowers = async (uid) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return [];
    return batchFetchProfiles(userSnap.data().pendingFollowers || []);
  } catch (error) {
    console.error('Error fetching pending followers:', error);
    return [];
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return { uid: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const removeFollower = async (followerId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId || !followerId) return;

  try {
    const userRef = doc(db, 'users', currentUserId);
    const followerRef = doc(db, 'users', followerId);

    await updateDoc(userRef, {
      followers: arrayRemove(followerId),
    });

    await updateDoc(followerRef, {
      following: arrayRemove(currentUserId),
    });
  } catch (error) {
    console.error('Error removing follower:', error);
  }
};
