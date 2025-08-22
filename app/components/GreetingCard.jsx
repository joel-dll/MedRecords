'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { storage, auth, db } from '../lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export default function GreetingCard() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [userInfo, setUserInfo] = useState({
    name: '',
    birthday: '',
    age: '',
    role: ''
  });
  const [photoURL, setPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState(null);

  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : '';
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUserId(user?.uid || null);

      if (!user) {
        setEditing(false);
        setUserInfo({ name: '', birthday: '', age: '', role: '' });
        setPhotoURL(null);
        return;
      }

      
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data() || {};
        const age = data.birthday ? calculateAge(data.birthday) : '';
        setUserInfo({
          name: data.name || '',
          birthday: data.birthday || '',
          age,
          role: data.role || '' 
        });
        setPhotoURL(data.photoURL || null);
        setEditing(false);
      } else {
        
        setEditing(true);
      }
    });

    return () => unsub();
  }, []);

  const canSave = useMemo(() => {
    const nameOk = userInfo.name.trim().length > 0;
    const ageOk = userInfo.birthday ? Number.isFinite(Number(calculateAge(userInfo.birthday))) : true;
    return !!userId && nameOk && ageOk;
  }, [userId, userInfo.name, userInfo.birthday]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    try {
      const ref = storageRef(storage, `profilePhotos/${userId}`);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      await setDoc(doc(db, 'users', userId), { photoURL: url }, { merge: true });
      setPhotoURL(url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!userId) return;
    const age = calculateAge(userInfo.birthday);
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          name: userInfo.name.trim(),
          birthday: userInfo.birthday || '',
          age: age || '',
          email: auth.currentUser?.email || null
        },
        { merge: true }
      );
      setUserInfo((prev) => ({ ...prev, age }));
      setEditing(false);
    } catch (err) {
      console.error('Failed to save user info:', err);
    }
  };

  return (
    <div className="greeting-card">
      <div
        className="user-image"
        onClick={() => fileInputRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        {uploading ? (
          <div className="upload-placeholder">{t('actions.upload')}...</div>
        ) : photoURL ? (
          <img
            src={photoURL}
            alt="User profile"
            style={{ borderRadius: '50%', width: '64px', height: '64px', objectFit: 'cover' }}
          />
        ) : (
          <div className="upload-placeholder">{t('actions.upload')}</div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        <p
          style={{
            fontSize: '0.7rem',
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
            color: '#666',
            marginTop: '6px'
          }}
        >
          
          {t('actions.upload')} / {t('actions.edit')}
        </p>
      </div>

      <div className="greeting-text">
        {editing ? (
          <div className="user-form">
            <input
              placeholder={t('settings.fields.full_name')}
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              style={{ fontSize: '0.8rem', fontFamily: 'Poppins, sans-serif' }}
            />

            <input
              type="date"
              value={userInfo.birthday}
              onChange={(e) => {
                const birthday = e.target.value;
                const age = calculateAge(birthday);
                setUserInfo({ ...userInfo, birthday, age });
              }}
              aria-label={t('settings.fields.birthdate')}
              style={{ fontSize: '0.8rem', fontFamily: 'Poppins, sans-serif' }}
            />

            <button
              onClick={handleSaveInfo}
              disabled={!canSave}
              style={{ marginTop: '8px', padding: '4px 10px', fontSize: '0.8rem' }}
            >
              {t('actions.save')}
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t('greetings.welcome', { name: userInfo.name || 'User' })}
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem' }}>
              {userInfo.age
                ? t('greetings.age_years', { count: userInfo.age })
                : null}
              {userInfo.age && userInfo.role ? ', ' : ''}
              {userInfo.role || ''}
            </p>
            <button
              onClick={() => setEditing(true)}
              style={{ marginTop: '8px', padding: '4px 10px', fontSize: '0.8rem' }}
            >
              {t('actions.edit')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
