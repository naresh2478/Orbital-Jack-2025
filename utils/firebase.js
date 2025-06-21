//this file handles auth only, not habit DB management
import { initializeApp, } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { persistentLocalCache, initializeFirestore  } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCBnxh9Y2LgH3ZEYUGBExkostMzMneXGEo",
  authDomain: "elevateyou-5fa71.firebaseapp.com",
  projectId: "elevateyou-5fa71",
  storageBucket: "elevateyou-5fa71.firebasestorage.app",
  messagingSenderId: "593749975804",
  appId: "1:593749975804:web:af9d36731c83768f71ed79",
  measurementId: "G-G18SBXPQ4G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

//localCache: persistentLocalCache() is used to persist data across app restarts 
// This is useful for offline capabilities and ensuring data is not lost when the app is closed.