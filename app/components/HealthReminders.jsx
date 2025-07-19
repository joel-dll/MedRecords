'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function HealthReminders() {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        const q = query(collection(db, 'users', user.uid, 'reminders'));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReminders(data);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleAddReminder = async () => {
    if (!userId || newReminder.trim() === '') return;

    await addDoc(collection(db, 'users', userId, 'reminders'), {
      text: newReminder,
      date: reminderDate || null,
      createdAt: Timestamp.now(),
    });

    setNewReminder('');
    setReminderDate('');
  };

  const handleDelete = async (id) => {
    if (!userId) return;

    await deleteDoc(doc(db, 'users', userId, 'reminders', id));
  };

  return (
    <div className="reminders-card">
      <h3>Upcoming Health Reminders</h3>

      <div className="reminders-input">
        <input
          type="text"
          placeholder="Enter a reminder..."
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
        />
        <input
          type="date"
          value={reminderDate}
          onChange={(e) => setReminderDate(e.target.value)}
        />
        <button onClick={handleAddReminder}>Add</button>
      </div>

      {reminders.length === 0 ? (
        <p>No reminders yet</p>
      ) : (
        <ul className="reminder-list">
          {reminders.map((r) => (
            <li key={r.id} className="reminder-item">
              <span>{r.text}</span>
              {r.date && <small> {r.date}</small>}
              <button onClick={() => handleDelete(r.id)}>X</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
