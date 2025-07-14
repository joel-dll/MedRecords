'use client';
import './styles/globals.css';
import { useState } from 'react';

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="video-container">
      {/*background__svideo*/}
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/backgroundVideo.mp4" type="video/mp4" />
      </video>

      {/*maskfromfigma*/}
      <img src="/mask2.png" alt="Overlay Mask" className="video-mask" />

      {/*titleandsubtilte*/}
      <div className="left-pane">
        <div className="branding">
          <h1 className="logo-title">MedRecords</h1>
          <p className="subtitle">Your Health, Securely Stored.</p>
        </div>
      </div>

      {/*signin_form_signup*/}
      <div className="right-pane">
        <form className="form-box">
          <h2 className="form-title">{isSignUp ? 'Create account' : 'Sign in'}</h2>

          <input type="email" placeholder="Enter your email" className="input" required />
          {isSignUp && <input type="text" placeholder="Your username" className="input" required />}
          <input type="password" placeholder="Enter your password" className="input" required />

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
              <button className="google-button">
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