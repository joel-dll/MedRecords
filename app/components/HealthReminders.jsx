'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { auth, db } from '../lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export default function HealthReminders() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState(''); 
  const [userId, setUserId] = useState(null);

  
  useEffect(() => {
    let unsubReminders = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);

      if (unsubReminders) {
        unsubReminders();
        unsubReminders = null;
      }

      if (user) {
        const q = query(
          collection(db, 'users', user.uid, 'reminders'),
          orderBy('createdAt', 'desc')
        );
        unsubReminders = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setReminders(data);
        });
      } else {
        setReminders([]);
      }
    });

    return () => {
      unsubAuth();
      if (unsubReminders) unsubReminders();
    };
  }, []);

  const canAdd = useMemo(() => {
    return !!userId && newReminder.trim().length > 0;
  }, [userId, newReminder]);

  const handleAddReminder = useCallback(async () => {
    if (!canAdd) return;
    try {
      await addDoc(collection(db, 'users', userId, 'reminders'), {
        text: newReminder.trim(),
        
        date: reminderDate || null,
        createdAt: serverTimestamp()
      });
      setNewReminder('');
      setReminderDate('');
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  }, [canAdd, newReminder, reminderDate, userId]);

  const onEnter = (e) => {
    if (e.key === 'Enter' && canAdd) {
      e.preventDefault();
      handleAddReminder();
    }
  };

  const handleDelete = async (id) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'reminders', id));
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  return (
    <div className="reminders-card">
      <h3>{t('reminders.title')}</h3>

      <div className="reminders-input">
        <input
          type="text"
          placeholder={t('reminders.placeholder')}
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          onKeyDown={onEnter}
          aria-label={t('reminders.placeholder')}
        />
        <input
          type="date"
          value={reminderDate}
          onChange={(e) => setReminderDate(e.target.value)}
          aria-label={t('reminders.date_placeholder')}
        />
        <button onClick={handleAddReminder} disabled={!canAdd}>
          {t('actions.add')}
        </button>
      </div>

      {reminders.length === 0 ? (
        <p className="reminders-empty">{t('reminders.empty')}</p>
      ) : (
        <ul className="reminder-list">
          {reminders.map((r) => (
            <li key={r.id} className="reminder-item">
              <span>{r.text}</span>
              {r.date && <small> — {r.date}</small>}
              <button
                className="delete-reminder"
                onClick={() => handleDelete(r.id)}
                title={t('actions.delete')}
                aria-label={t('actions.delete')}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
