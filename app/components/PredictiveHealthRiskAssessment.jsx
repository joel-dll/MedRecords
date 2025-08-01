'use client';

import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { getHealthRiskPrediction } from '@/utils/getHealthRiskPrediction';
import { sendPredictionEmail } from '../../utils/sendPredictionEmail';
import { SiGooglegemini } from "react-icons/si";
import { PiRobotThin } from "react-icons/pi";
import PopUpMessage from '../components/PopUpMessage';

export default function PredictiveHealthRiskAssessment() {
  const [medicalHistory, setMedicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [age, setAge] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const [popupMsg, setPopupMsg] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [showPopup, setShowPopup] = useState(false);

  const predictionRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (prediction && predictionRef.current) {
      predictionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [prediction]);

  const handleSubmit = async () => {
    if (!userId) {
      setPrediction('Please sign in to get predictions.');
      return;
    }

    setLoading(true);
    setPrediction('');
    setEmailSent(false); 

    try {
      const result = await getHealthRiskPrediction({
        medicalHistory,
        familyHistory,
        age,
        lifestyle,
        userId,
      });
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
      setPrediction('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleSendEmail = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.exists() ? userDoc.data() : null;

      const email = data?.email;
      const name = data?.name || 'User';

      const sent = await sendPredictionEmail(email, name, prediction);

      if (sent) {
        setEmailSent(true);
        setPopupMsg('Prediction sent to your email!');
        setPopupType('success');
        setShowPopup(true);
      } else {
        setPopupMsg('Failed to send email.');
        setPopupType('error');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Email send error:', error);
      setPopupMsg('Error sending email.');
      setPopupType('error');
      setShowPopup(true);
    }
  };

  return (
    <div className="predict-card">
      <h3>Predictive Health Risk Assessment</h3>
      <p className="predict-description">
        Fill in your health details and get a predictive analysis using AI.<PiRobotThin className="robot-icon" />
      </p>

      {!userId && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>
          You must be signed in to use this feature.
        </p>
      )}

      <div className="predict-form">
        <textarea
          placeholder="Medical History"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
        />
        <textarea
          placeholder="Family History"
          value={familyHistory}
          onChange={(e) => setFamilyHistory(e.target.value)}
        />
        <textarea
          placeholder="Lifestyle Factors"
          value={lifestyle}
          onChange={(e) => setLifestyle(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={loading} className="prediction-button">
          {loading ? (
            <>
              <SiGooglegemini className="icon" />
              Analyzing...
            </>
          ) : (
            <>
              <SiGooglegemini className="icon" />
              Get Prediction
            </>
          )}
        </button>
      </div>

      {prediction && (
        <div className="predict-result" ref={predictionRef}>
          <strong>AI Prediction:</strong>
          <p>{prediction}</p>

          {!emailSent && (
            <button onClick={handleSendEmail} className="email-button" style={{ marginTop: '1rem' }}>
              Send to My Email
            </button>
          )}
        </div>
      )}

      {showPopup && (
        <PopUpMessage
          message={popupMsg}
          onClose={() => setShowPopup(false)}
          type={popupType}
        />
      )}
    </div>
  );
}
