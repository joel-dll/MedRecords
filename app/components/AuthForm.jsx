'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          email,
          username,
        });

        alert('Account created!');
        router.push('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Signed in!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already registered. Try logging in.');
        setIsSignUp(false); // auto switch to login
      } else if (error.code === 'auth/invalid-login-credentials') {
        alert('Incorrect email or password.');
      } else {
        alert(error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          username: user.displayName || '',
        },
        { merge: true }
      );

      alert(`Signed in as ${user.email}`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error.code, error.message);
      alert('Google sign-in failed: ' + error.message);
    }
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <h2 className="form-title">{isSignUp ? 'Create account' : 'Sign in'}</h2>

      <input
        type="email"
        placeholder="Enter your email"
        className="input"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {isSignUp && (
        <input
          type="text"
          placeholder="Your username"
          className="input"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}

      <input
        type="password"
        placeholder="Enter your password"
        className="input"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {!isSignUp && (
        <div className="form-options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" className="forgot-link">Forgot Password</a>
        </div>
      )}

      <button type="submit" className="sign-in-button">
        {isSignUp ? 'Create account' : 'Sign in'}
      </button>

      {!isSignUp && (
        <>
          <div className="divider">Or</div>
          <button
            type="button"
            className="google-button"
            onClick={handleGoogleSignIn}
          >
            <img src="/google.png" alt="Google" className="google-icon" />
            Sign in with Google
          </button>
        </>
      )}

      <p className="toggle-link">
        {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
        <span onClick={() => setIsSignUp(!isSignUp)} className="link">
          {isSignUp ? 'Log in' : 'Sign up'}
        </span>
      </p>

      <div className="footer-bottom">
        <p className="terms-text">
          By creating an account or signing in you agree to our{' '}
          <a href="#" className="link">Terms and Conditions</a>
        </p>
      </div>

      <div className="social-icons">
        <a href="#"><img src="/facebook.png" alt="Facebook" /> <span>Facebook</span></a>
        <a href="#"><img src="/insta.png" alt="Instagram" /> <span>Instagram</span></a>
      </div>
    </form>
  );
}
