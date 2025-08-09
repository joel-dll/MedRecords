'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import PopUpMessage from '../components/PopUpMessage';

export default function AuthForm() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const showPopup = (message, type = 'success', redirectPath = null) => {
    setPopup({ show: true, message, type });
    setPendingRedirect(redirectPath);
  };

  const hidePopup = () => {
    setPopup({ show: false, message: '', type: '' });
    if (pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !username)) return;

    try {
      setSubmitting(true);

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        
        await setDoc(doc(db, 'users', user.uid), {
          email,
          name: username,
          createdAt: new Date(),
        }, { merge: true });

        showPopup('Account created! Redirecting…', 'success', '/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showPopup('You’ve successfully signed in.', 'success', '/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        showPopup('Email already registered. Try logging in.', 'error');
        setIsSignUp(false);
      } else if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/wrong-password') {
        showPopup('Incorrect email or password.', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        showPopup('Too many attempts. Please try again later.', 'error');
      } else {
        showPopup(error.message || 'Authentication failed', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          name: user.displayName || '',
          lastLoginAt: new Date(),
        },
        { merge: true }
      );

      showPopup(`Signed in as ${user.email}`, 'success', '/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error.code, error.message);
      showPopup('Google sign-in failed: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      showPopup('Enter your email first, then tap “Forgot Password”.', 'error');
      return;
    }
    try {
      setSendingReset(true);

      
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-complete`,
        handleCodeInApp: false, 
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      
      showPopup(
        'If an account exists for that email, a password reset link has been sent.',
        'success'
      );
    } catch (err) {
      console.error('Reset error:', err.code, err.message);
      
      showPopup(
        'If an account exists for that email, a password reset link has been sent.',
        'success'
      );
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <>
      {popup.show && (
        <PopUpMessage
          message={popup.message}
          type={popup.type}
          onClose={hidePopup}
        />
      )}

      <form className="form-box" onSubmit={handleSubmit}>
        <h2 className="form-title">{isSignUp ? 'Create account' : 'Sign in'}</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="input"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        {isSignUp && (
          <input
            type="text"
            placeholder="Your username"
            className="input"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="name"
          />
        )}

        <input
          type="password"
          placeholder="Enter your password"
          className="input"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />

        {!isSignUp && (
          <div className="form-options">
            <label>
              <input type="checkbox" /> Remember me
            </label>

            
            <button
              type="button"
              className="forgot-link"
              onClick={handleForgotPassword}
              disabled={sendingReset || submitting}
              title="Reset your password"
            >
              {sendingReset ? 'Sending…' : 'Forgot Password'}
            </button>
          </div>
        )}

        <button
          type="submit"
          className="sign-in-button"
          disabled={submitting}
        >
          {submitting ? (isSignUp ? 'Creating…' : 'Signing in…') : (isSignUp ? 'Create account' : 'Sign in')}
        </button>

        {!isSignUp && (
          <>
            <div className="divider">Or</div>
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
            >
              <img src="/google.png" alt="Google" className="google-icon" />
              Sign in with Google
            </button>
          </>
        )}

        <p className="toggle-link">
          {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp((v) => !v)}
            className="link"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
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
    </>
  );
}
