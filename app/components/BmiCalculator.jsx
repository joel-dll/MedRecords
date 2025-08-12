'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function BmiCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiList, setBmiList] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        const q = query(collection(db, 'users', user.uid, 'bmiRecords'));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBmiList(data);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const calculateBMI = async () => {
    if (!weight || !height || !userId) return;

    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;

    const bmi = (w / (h * h)).toFixed(1);

    await addDoc(collection(db, 'users', userId, 'bmiRecords'), {
      weight: w,
      height: parseFloat(height),
      bmi,
      createdAt: Timestamp.now()
    });

    setWeight('');
    setHeight('');
  };

  const deleteBMI = async (entryId, userId) => {
    try {
      await deleteDoc(doc(db, `users/${userId}/bmiRecords/${entryId}`));
    } catch (error) {
      console.error('Failed to delete BMI record:', error);
    }
  };

  
  const classifyBMI = (bmi) => {
    const v = typeof bmi === 'number' ? bmi : parseFloat(bmi || '0');
    if (v >= 30) return { color: 'red', label: 'Obese' };          
    if (v >= 25) return { color: 'yellow', label: 'Overweight' };  
    if (v < 18.5) return { color: 'yellow', label: 'Underweight' };
    return { color: 'green', label: 'Healthy' };                   
  };

  return (
    <div className="bmi-card">
  <h3>BMI Tracker</h3>

  
  <div className="bmi-legend">
    <span className="legend-item">
      <span className="bmi-dot red"></span> Overweight
    </span>
    <span className="legend-item">
      <span className="bmi-dot yellow"></span> Underweight
    </span>
    <span className="legend-item">
      <span className="bmi-dot green"></span> Healthy
    </span>
  </div>

  <div className="bmi-inputs">
    <input
      type="number"
      placeholder="Weight (kg)"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
    />
    <input
      type="number"
      placeholder="Height (cm)"
      value={height}
      onChange={(e) => setHeight(e.target.value)}
    />
    <button onClick={calculateBMI}>Calculate</button>
  </div>



      <ul className="bmi-list">
        {bmiList.length === 0 ? (
          <li>No records yet</li>
        ) : (
          bmiList
            .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds) 
            .map((entry) => {
              const { color, label } = classifyBMI(entry.bmi);
              return (
                <li key={entry.id} className="bmi-item">
                  <span
                    className={`bmi-dot ${color}`}
                    title={label}
                    aria-label={label}
                  />
                  <span className="bmi-text">
                    {entry.bmi} BMI ({entry.weight}kg / {entry.height}cm) —{' '}
                    {entry.createdAt?.toDate().toLocaleDateString()}
                  </span>
                  <button
                    className="delete-bmi"
                    onClick={() => deleteBMI(entry.id, userId)}
                    title="Delete entry"
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
