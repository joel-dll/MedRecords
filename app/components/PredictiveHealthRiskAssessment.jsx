'use client';

import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase'; 
import { getHealthRiskPrediction } from '@/utils/getHealthRiskPrediction';
import { SiGooglegemini } from "react-icons/si";
import { PiRobotThin } from "react-icons/pi";

export default function PredictiveHealthRiskAssessment() {
  const [medicalHistory, setMedicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [age, setAge] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

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
      setPrediction('⚠️ Please sign in to get predictions.');
      return;
    }

    setLoading(true);
    setPrediction('');

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
        </div>
      )}
    </div>
  );
}
