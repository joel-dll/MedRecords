'use client';

import { useState, useRef } from 'react';
import { db, storage, auth } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import PopUpMessage from './PopUpMessage';

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [country, setCountry] = useState('');
  const [uploading, setUploading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });

  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  
  onAuthStateChanged(auth, (user) => {
    if (user && !currentUser) {
      setCurrentUser(user);
    }
  });

  const showPopup = (message, type = 'info') => {
    setPopup({ visible: true, message, type });
  };

  const closePopup = () => {
    setPopup({ visible: false, message: '', type: 'info' });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file || !name || (!category && !customCategory) || !country) {
      showPopup('Please fill in all fields and select a file.', 'error');
      return;
    }

    const chosenCategory = category === 'other' ? customCategory : category;

    try {
      setUploading(true);

      const timestamp = Date.now();
      const storagePath = `users/${currentUser.uid}/records/${timestamp}-${file.name}`;
      const fileRef = ref(storage, storagePath);

      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'users', currentUser.uid, 'records'), {
        name,
        fileURL,
        storagePath,
        category: chosenCategory,
        country,
        createdAt: Timestamp.now(),
      });

      showPopup('File uploaded successfully.', 'success');
      setFile(null);
      setName('');
      setCategory('');
      setCustomCategory('');
      setCountry('');
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      showPopup('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} className="upload-form">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: 'none' }}
        />

        <button type="button" className="upload-file-button" onClick={triggerFileInput}>
          Choose File
        </button>

        {file && <p>{file.name}</p>}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="Blood Test">Blood Test</option>
          <option value="Allergy">Allergy</option>
          <option value="Prescription">Prescription</option>
          <option value="Diagnosis">Diagnosis</option>
          <option value="Scan/Imaging">Scan/Imaging</option>
          <option value="Vaccination">Vaccination</option>
          <option value="other">Other</option>
        </select>

        {category === 'other' && (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Custom Category"
          />
        )}

        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
        />

        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {popup.visible && (
        <PopUpMessage message={popup.message} type={popup.type} onClose={closePopup} />
      )}
    </div>
  );
}
