'use client';
import { useEffect, useState, useRef } from 'react';
import { storage, auth, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function GreetingCard() {
  const [userInfo, setUserInfo] = useState({ name: '', age: '', role: '' });
  const [photoURL, setPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo({
            name: data.name || '',
            age: data.age || '',
            role: data.role || '',
          });
          setPhotoURL(data.photoURL || null);
        } else {
          setEditing(true); 
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = auth.currentUser;
    if (!user) return alert('You must be signed in.');

    const storageRef = ref(storage, `profilePhotos/${user.uid}`);
    setUploading(true);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await setDoc(
        doc(db, 'users', user.uid),
        { photoURL: downloadURL },
        { merge: true }
      );
      setPhotoURL(downloadURL);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInfo = async () => {
    const user = auth.currentUser;
    if (!user) return alert('Not signed in');

    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userInfo,
        email: user.email,
      }, { merge: true });

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
          <div className="upload-placeholder">Uploading...</div>
        ) : photoURL ? (
          <img
            src={photoURL}
            alt="User profile"
            style={{ borderRadius: '50%', width: '64px', height: '64px' }}
          />
        ) : (
          <div className="upload-placeholder">Upload Photo</div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>Tap to upload/update</p>
      </div>

      <div className="greeting-text">
        {editing ? (
          <div className="user-form">
            <input
              placeholder="Full name"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              style={{ fontSize: '0.8rem'}}
            />
            <input
              placeholder="Age"
              type="number"
              value={userInfo.age}
              onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
               style={{ fontSize: '0.8rem'}}
            />
            <input
              placeholder="Role (e.g., Wife, Son)"
              value={userInfo.role}
              onChange={(e) => setUserInfo({ ...userInfo, role: e.target.value })}
               style={{ fontSize: '0.8rem'}}
            />
            <button onClick={handleSaveInfo} style={{ marginTop: '8px', padding: '4px 10px'}}>Save Info</button>
          </div>
        ) : (
          <>
            <h2>Welcome, {userInfo.name || 'User'}</h2>
            <p>
              {userInfo.age && `${userInfo.age} years old`}
              {userInfo.age && userInfo.role ? ', ' : ''}
              {userInfo.role}
            </p>
            <button onClick={() => setEditing(true)} style={{ marginTop: '8px', padding: '4px 10px'}} >
              Edit Info
            </button>
          </>
        )}
      </div>
    </div>
  );
}
