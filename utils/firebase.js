//this file handles auth only, not habit DB management

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBnxh9Y2LgH3ZEYUGBExkostMzMneXGEo",
  authDomain: "elevateyou-5fa71.firebaseapp.com",
  projectId: "elevateyou-5fa71",
  storageBucket: "elevateyou-5fa71.appspot.com",
  messagingSenderId: "593749975804",
  appId: "1:593749975804:web:a9d36731c83768f71ed79",
  measurementId: "G-G18SBXPQ4G"
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}
export { auth };

export const db = initializeFirestore(app, {});
