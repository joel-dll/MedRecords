'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getHealthRiskPrediction } from '@/utils/getHealthRiskPrediction';
import { sendPredictionEmail } from '../../utils/sendPredictionEmail';
import { SiGooglegemini } from 'react-icons/si';
import { PiRobotThin } from 'react-icons/pi';
import PopUpMessage from '../components/PopUpMessage';
import { useTranslation } from 'react-i18next';

export default function PredictiveHealthRiskAssessment() {
  const { t } = useTranslation();
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
      setUserId(user?.uid || null);
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
      setPrediction(
        t('auth.sign_in_required', { defaultValue: 'Please sign in to get predictions.' })
      );
      return;
    }

    
    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum <= 0) {
      setPrediction(t('assessment.invalid_age', { defaultValue: 'Please enter a valid age.' }));
      return;
    }

    setLoading(true);
    setPrediction('');
    setEmailSent(false);

    try {
      const result = await getHealthRiskPrediction({
        medicalHistory,
        familyHistory,
        age: ageNum,
        lifestyle,
        userId
      });
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
      setPrediction(t('common.error_try_again', { defaultValue: 'Something went wrong. Please try again.' }));
    } finally {
      setLoading(false);
    }
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
        setPopupMsg(t('email.prediction_sent', { defaultValue: 'Prediction sent to your email!' }));
        setPopupType('success');
        setShowPopup(true);
      } else {
        setPopupMsg(t('email.prediction_send_failed', { defaultValue: 'Failed to send email.' }));
        setPopupType('error');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Email send error:', error);
      setPopupMsg(t('email.prediction_send_error', { defaultValue: 'Error sending email.' }));
      setPopupType('error');
      setShowPopup(true);
    }
  };

  const canSubmit =
    !!userId &&
    !loading &&
    (medicalHistory.trim().length > 0 ||
      familyHistory.trim().length > 0 ||
      lifestyle.trim().length > 0) &&
    Number.isFinite(Number(age)) &&
    Number(age) > 0;

  return (
    <div className="predict-card">
      <h3>{t('assessment.title')}</h3>

      <p className="predict-description">
        {t('assessment.intro')} <PiRobotThin className="robot-icon" />
      </p>

      {!userId && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>
          {t('auth.sign_in_required', { defaultValue: 'You must be signed in to use this feature.' })}
        </p>
      )}

      <div className="predict-form">
        <textarea
          placeholder={t('assessment.history')}
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          aria-label={t('assessment.history')}
        />
        <textarea
          placeholder={t('assessment.family_history')}
          value={familyHistory}
          onChange={(e) => setFamilyHistory(e.target.value)}
          aria-label={t('assessment.family_history')}
        />
        <textarea
          placeholder={t('assessment.lifestyle')}
          value={lifestyle}
          onChange={(e) => setLifestyle(e.target.value)}
          aria-label={t('assessment.lifestyle')}
        />
        <input
          type="number"
          inputMode="numeric"
          min="1"
          placeholder={t('settings.fields.age')}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          aria-label={t('settings.fields.age')}
        />

        <button onClick={handleSubmit} disabled={!canSubmit} className="prediction-button">
          <SiGooglegemini className="icon" />
          {loading
            ? t('assessment.analyzing', { defaultValue: 'Analyzing...' })
            : t('assessment.btn')}
        </button>
      </div>

      {prediction && (
        <div className="predict-result" ref={predictionRef}>
          <strong>{t('assessment.result_title', { defaultValue: 'AI Prediction:' })}</strong>
          <p>{prediction}</p>

          {!emailSent && (
            <button
              onClick={handleSendEmail}
              className="email-button"
              style={{ marginTop: '1rem' }}
            >
              {t('email.send_to_me', { defaultValue: 'Send to My Email' })}
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
