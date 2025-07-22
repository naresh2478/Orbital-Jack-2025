import { collection, query, where, getDocs, getDoc, arrayRemove, arrayUnion, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';

// initialise social fields
export const initializeSocialFields = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      privacy: 'public',
      pendingFollowers: [],
      followers: [],
      following: [],
    });
    console.log('✅ Initialized social fields');
  } catch (error) {
    console.error('❌ Error initializing social fields:', error);
  }
};

// search friends by email
export const searchUserByEmail = async (email) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;  // No user found
    }

    const userDoc = querySnapshot.docs[0];
    return { uid: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('❌ Error searching user by email:', error);
    return null;
  }
};

// follow a user
export const followUser = async (targetUserId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId || !targetUserId) return;

  try {
    const targetUserRef = doc(db, 'users', targetUserId);

    await updateDoc(targetUserRef, {
      pendingFollowers: arrayUnion(currentUserId),
    });

    console.log('✅ Follow request sent');
  } catch (error) {
    console.error('❌ Error sending follow request:', error);
  }
};

// unfollow user
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
      pendingFollowers: arrayRemove(currentUserId), // Clean up pending if exists
    });

    console.log('✅ Unfollowed user');
  } catch (error) {
    console.error('❌ Error unfollowing user:', error);
  }
};

// set privacy
export const setPrivacy = async (isPrivate) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) return;

  try {
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
      privacy: isPrivate ? 'private' : 'public',
    });

    console.log(`✅ Privacy set to ${isPrivate ? 'private' : 'public'}`);
  } catch (error) {
    console.error('❌ Error setting privacy:', error);
  }
};

// approve follower
export const approveFollower = async (followerId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId || !followerId) return;

  try {
    const userRef = doc(db, 'users', currentUserId);
    const followerUserRef = doc(db, 'users', followerId);

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const pendingFollowers = userData.pendingFollowers || [];

    if (!pendingFollowers.includes(followerId)) return;

    await updateDoc(userRef, {
      followers: arrayUnion(followerId),
      pendingFollowers: arrayRemove(followerId),
    });

    await updateDoc(followerUserRef, {
      following: arrayUnion(currentUserId),
    });

    console.log('✅ Approved follower');
  } catch (error) {
    console.error('❌ Error approving follower:', error);
  }
};

// Fetch followers' profile data (emails + uids)
export const getFollowers = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];

    const data = userSnap.data();
    const followerIds = data.followers || [];

    // Map each follower UID to their profile (email & uid)
    const followerProfiles = await Promise.all(
      followerIds.map(async (followerId) => {
        const followerRef = doc(db, 'users', followerId);
        const followerSnap = await getDoc(followerRef);
        if (followerSnap.exists()) {
          const followerData = followerSnap.data();
          return { uid: followerId, email: followerData.email || '' };
        }
        return null;
      })
    );

    // Filter out any nulls (if some followers don't exist)
    return followerProfiles.filter(profile => profile !== null);
  } catch (error) {
    console.error('❌ Error fetching followers:', error);
    return [];
  }
};

// Fetch following users' profile data (emails + uids)
export const getFollowing = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];

    const data = userSnap.data();
    const followingIds = data.following || [];

    const followingProfiles = await Promise.all(
      followingIds.map(async (followingId) => {
        const followingRef = doc(db, 'users', followingId);
        const followingSnap = await getDoc(followingRef);
        if (followingSnap.exists()) {
          const followingData = followingSnap.data();
          return { uid: followingId, email: followingData.email || '' };
        }
        return null;
      })
    );

    return followingProfiles.filter(profile => profile !== null);
  } catch (error) {
    console.error('❌ Error fetching following:', error);
    return [];
  }
};

// output for above 2 functions shd be 
// [
//   { uid: 'userId1', email: 'email1@example.com' },
//   { uid: 'userId2', email: 'email2@example.com' },
//   ...
// ]

export const getPendingFollowers = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];

    const data = userSnap.data();
    const pendingFollowerIds = data.pendingFollowers || [];

    const pendingProfiles = await Promise.all(
      pendingFollowerIds.map(async (followerId) => {
        const followerRef = doc(db, 'users', followerId);
        const followerSnap = await getDoc(followerRef);
        if (followerSnap.exists()) {
          const followerData = followerSnap.data();
          return { uid: followerId, email: followerData.email || '' };
        }
        return null;
      })
    );

    return pendingProfiles.filter(profile => profile !== null);
  } catch (error) {
    console.error('❌ Error fetching pending followers:', error);
    return [];
  }
};

// ✅ NEW FUNCTION: fetch full user profile by UID
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { uid: userSnap.id, ...userSnap.data() };
    } else {
      console.error('❌ User profile not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return null;
  }
};

