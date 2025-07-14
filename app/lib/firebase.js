
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: 'AIzaSyCXguDOvDpMP8enGbkpeKZyNPBtX1FJCBY',
  authDomain: 'medrecords-e9eed.firebaseapp.com',
  projectId: 'medrecords-e9eed',
  storageBucket: 'medrecords-e9eed.appspot.com',
  messagingSenderId: '640832077346',
  appId: '1:640832077346:web:596f90dbc705a655fbd47b',
  measurementId: 'G-1NJTMNT3WW',
};


const app = initializeApp(firebaseConfig);


if (typeof window !== 'undefined') {
  getAnalytics(app);
}


const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
