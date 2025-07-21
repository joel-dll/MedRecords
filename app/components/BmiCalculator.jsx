'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';

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
  return (
    <div className="bmi-card">
      <h3>BMI Tracker</h3>
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
            .map((entry) => (
              <li key={entry.id} className="bmi-item">
                {entry.bmi} BMI ({entry.weight}kg / {entry.height}cm) —{' '}
                {entry.createdAt?.toDate().toLocaleDateString()}
                <button
                  className="delete-bmi"
                  onClick={() => deleteBMI(entry.id, userId)}
                  title="Delete entry"
                >
                  ×
                </button>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}
