
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // <--- IMPORT GoogleAuthProvider
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';


const firebaseConfig = {
  apiKey: 'AIzaSyCXguDOvDpMP8enGbkpeKZyNPBtX1FJCBY',
  authDomain: 'medrecords-e9eed.firebaseapp.com',
  projectId: 'medrecords-e9eed',
  storageBucket: 'medrecords-e9eed',
  messagingSenderId: '640832077346',
  appId: '1:640832077346:web:596f90dbc705a655fbd47b',
  measurementId: 'G-1NJTMNT3WW',
};

// Initialize Firebase only if it hasn't been initialized already

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app); // Get functions instance from the initialized app

const googleProvider = new GoogleAuthProvider(); // <--- INITIALIZE GoogleAuthProvider

export { app, auth, db, storage, functions, googleProvider }; // <--- EXPORT googleProvider