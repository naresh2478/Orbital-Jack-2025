//this file handles auth only, not habit DB management

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore } from 'firebase/firestore';

// Your Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyCBnxh9Y2LgH3ZEYUGBExkostMzMneXGEo",
  authDomain: "elevateyou-5fa71.firebaseapp.com",
  projectId: "elevateyou-5fa71",
  storageBucket: "elevateyou-5fa71.appspot.com",
  messagingSenderId: "593749975804",
  appId: "1:593749975804:web:a9d36731c83768f71ed79",
  measurementId: "G-G18SBXPQ4G"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// ✅ Firestore (basic memory caching – Expo-safe)
export const db = initializeFirestore(app, {});
