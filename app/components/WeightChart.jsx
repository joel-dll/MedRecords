'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

export default function WeightChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'bmiRecords'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => {
        const { weight, createdAt } = doc.data();

        
        const date = createdAt?.toDate?.();
        return {
          date: date ? date.toLocaleDateString('en-GB') : 'Invalid',
          weight: Number(weight)
        };
      });

     
      entries.sort((a, b) => new Date(a.date) - new Date(b.date));
      setData(entries);
    });

    return () => unsubscribe();
  }, []);
  return (
    <div className="weight-chart-container">
      <h3>Weight Over Time</h3>
      <ResponsiveContainer  height={99} className="chart">

        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#5c9d9b" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


