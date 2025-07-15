'use client';
import './styles/globals.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from './lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

export default function Home() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Mode:', isSignUp ? 'SIGN UP' : 'SIGN IN');

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up:', userCredential.user);
        alert('Account created successfully!');
        router.push('/dashboard');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', userCredential.user);
        alert('Signed in successfully!');
        router.push('/dashboard'); 
      }
    } catch (error) {
      console.error('Auth error:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already registered. Try logging in instead.');
        setIsSignUp(false);
      } else {
        alert(error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google user:', user);
      alert(`Signed in as ${user.email}`);
      router.push('/dashboard'); 
    } catch (error) {
      console.error('Google sign-in error:', error.code, error.message);
      alert('Google sign-in failed: ' + error.message);
    }
  };

  return (
    <div className="video-container">
      
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/backgroundVideo.mp4" type="video/mp4" />
      </video>

     
      <img src="/mask2.png" alt="Overlay Mask" className="video-mask" />

      
      <div className="left-pane">
        <div className="branding">
          <h1 className="logo-title">MedRecords</h1>
          <p className="subtitle">Your Health, Securely Stored.</p>
        </div>
      </div>

      
      <div className="right-pane">
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
              <label><input type="checkbox" /> Remember me</label>
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
            {isSignUp ? 'Already have an account?' : `Don’t have an account?`}{' '}
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
      </div>
    </div>
  );
}
