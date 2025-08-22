'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { auth, db } from '../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export default function BmiCalculator() {
  const { t } = useTranslation();
  const [weight, setWeight] = useState(''); 
  const [height, setHeight] = useState(''); 
  const [bmiList, setBmiList] = useState([]);
  const [userId, setUserId] = useState(null);

  
  useEffect(() => {
    let unsubRecords = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);

      if (unsubRecords) {
        unsubRecords();
        unsubRecords = null;
      }

      if (user) {
        const q = query(
          collection(db, 'users', user.uid, 'bmiRecords'),
          orderBy('createdAt', 'desc')
        );
        unsubRecords = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setBmiList(data);
        });
      } else {
        setBmiList([]);
      }
    });

    return () => {
      unsubAuth();
      if (unsubRecords) unsubRecords();
    };
  }, []);

  const canCalculate = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    return Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0 && !!userId;
  }, [weight, height, userId]);

  const calculateAndSave = useCallback(async () => {
    if (!canCalculate) return;

    const w = parseFloat(weight);
    const hMeters = parseFloat(height) / 100; 

    
    if (!Number.isFinite(w) || !Number.isFinite(hMeters) || hMeters <= 0) return;

    const bmiVal = w / (hMeters * hMeters);
    const bmi = Number(bmiVal.toFixed(1));

    await addDoc(collection(db, 'users', userId, 'bmiRecords'), {
      weight: Number(w.toFixed(1)),
      height: Number(parseFloat(height).toFixed(1)), 
      bmi,
      createdAt: serverTimestamp(),
    });

    setWeight('');
    setHeight('');
  }, [canCalculate, height, userId, weight]);

  const onEnter = (e) => {
    if (e.key === 'Enter' && canCalculate) {
      e.preventDefault();
      calculateAndSave();
    }
  };

  
  const classifyBMI = (bmi) => {
    const v = typeof bmi === 'number' ? bmi : parseFloat(bmi || '0');
    if (v >= 25) return { color: 'red', label: t('bmi.legend.overweight') };
    if (v < 18.5) return { color: 'yellow', label: t('bmi.legend.underweight') };
    return { color: 'green', label: t('bmi.legend.healthy') };
  };

  const deleteBMI = async (entryId) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/bmiRecords/${entryId}`));
    } catch (err) {
      console.error('Failed to delete BMI record:', err);
    }
  };

  return (
    <div className="bmi-card">
      <h3>{t('bmi.title')}</h3>

      
      <div className="bmi-legend">
        <span className="legend-item">
          <span className="bmi-dot red" />
          {t('bmi.legend.overweight')}
        </span>
        <span className="legend-item">
          <span className="bmi-dot yellow" />
          {t('bmi.legend.underweight')}
        </span>
        <span className="legend-item">
          <span className="bmi-dot green" />
          {t('bmi.legend.healthy')}
        </span>
      </div>

      
      <div className="bmi-inputs">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          placeholder={t('bmi.weight_placeholder')}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={onEnter}
          aria-label={t('bmi.weight_placeholder')}
        />
        <input
          type="number"
          inputMode="numeric"
          min="0"
          step="0.1"
          placeholder={t('bmi.height_placeholder')}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onKeyDown={onEnter}
          aria-label={t('bmi.height_placeholder')}
        />
        <button onClick={calculateAndSave} disabled={!canCalculate}>
          {t('actions.calculate')}
        </button>
      </div>

      
      <ul className="bmi-list">
        {bmiList.length === 0 ? (
          <li className="bmi-empty">{t('bmi.empty')}</li>
        ) : (
          bmiList.map((entry) => {
            const { color, label } = classifyBMI(entry.bmi);
            const date =
              entry.createdAt?.toDate?.()?.toLocaleDateString?.() ||
              '';
            return (
              <li key={entry.id} className="bmi-item">
                <span
                  className={`bmi-dot ${color}`}
                  title={label}
                  aria-label={label}
                />
                <span className="bmi-text">
                  {entry.bmi} BMI ({entry.weight}kg / {entry.height}cm){' '}
                  {date && <>— {date}</>}
                </span>
                <button
                  className="delete-bmi"
                  onClick={() => deleteBMI(entry.id)}
                  title={t('bmi.delete_entry')}
                  aria-label={t('bmi.delete_entry')}
                >
                  ×
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
