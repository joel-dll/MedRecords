// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXguDOvDpMP8enGbkpeKZyNPBtX1FJCBY",
  authDomain: "medrecords-e9eed.firebaseapp.com",
  projectId: "medrecords-e9eed",
  storageBucket: "medrecords-e9eed.firebasestorage.app",
  messagingSenderId: "640832077346",
  appId: "1:640832077346:web:596f90dbc705a655fbd47b",
  measurementId: "G-1NJTMNT3WW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);