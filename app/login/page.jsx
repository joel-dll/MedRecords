'use client';
import '../styles/globals.css';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
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
        <AuthForm />
      </div>
    </div>
  );
}
