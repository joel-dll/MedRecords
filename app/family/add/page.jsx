'use client';

import { useState, useEffect, useRef } from 'react';
import { db, storage, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PopUpMessage from '../../components/PopUpMessage';

export default function AddFamilyMemberPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [relationship, setRelationship] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState(null);
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });

  const fileInputRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const showPopup = (message, type = 'info') => {
    setPopup({ visible: true, message, type });
  };

  const closePopup = () => {
    setPopup({ visible: false, message: '', type: 'info' });
  };

  const handleAddFamilyMember = async () => {
    if (!name || !age || !relationship || !role || !photo || !userId) {
      showPopup('Please fill in all fields and select a photo.', 'error');
      return;
    }

    try {
      setUploading(true);
      const timestamp = Date.now();
      const storagePath = `users/${userId}/family_photos/${timestamp}-${photo.name}`;
      const photoRef = ref(storage, storagePath);

      await uploadBytes(photoRef, photo);
      const photoURL = await getDownloadURL(photoRef);

      
      await addDoc(collection(db, 'users', userId, 'family'), {
        name,
        age,
        relationship,
        role,
        photoURL,
        createdAt: Timestamp.now(),
      });

      setName('');
      setAge('');
      setRelationship('');
      setRole('');
      setPhoto(null);

      showPopup('Family member added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add family member:', error);
      showPopup('Something went wrong. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-family-container">
      <h2>Add Family Member</h2>
      <form onSubmit={(e) => e.preventDefault()} className="add-family-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <input
          type="text"
          placeholder="Relationship (e.g. Daughter)"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
        />
        <input
          type="text"
          placeholder="Role (e.g. child, parent)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => setPhoto(e.target.files[0])}
        />
        <button type="button" onClick={() => fileInputRef.current.click()}>
          {photo ? photo.name : 'Choose Photo'}
        </button>

        <button onClick={handleAddFamilyMember} disabled={uploading}>
          {uploading ? 'Adding...' : 'Add Family Member'}
        </button>
      </form>

      {popup.visible && (
        <PopUpMessage
          message={popup.message}
          type={popup.type}
          onClose={closePopup}
        />
      )}
    </div>
  );
}
