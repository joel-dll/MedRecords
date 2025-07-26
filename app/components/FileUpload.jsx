'use client';

import { useState, useRef } from 'react';
import { db, storage, auth } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import PopUpMessage from './PopUpMessage';

export default function FileUpload({ currentUser, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [country, setCountry] = useState('');
  const [uploading, setUploading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });
  
  const fileInputRef = useRef(null);

  const showPopup = (message, type = 'info') => {
    setPopup({ visible: true, message, type });
  };

  const closePopup = () => {
    setPopup({ ...popup, visible: false });
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    console.log("🔍 currentUser in FileUpload:", currentUser);

    if (!file || !name || !country || (!category && !customCategory)) {
      showPopup('Please fill all fields and select a file.', 'error');
      return;
    }

    const user = currentUser || auth.currentUser;
    if (!user) {
      showPopup('User not logged in.', 'error');
      return;
    }

    const selectedCategory = category === 'other' ? customCategory : category;
    const fileId = `${Date.now()}-${file.name}`;
    const fileRef = ref(storage, `users/${user.uid}/records/${fileId}`);

    try {
      setUploading(true);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'users', user.uid, 'records'), {
        name,
        category: selectedCategory,
        country,
        fileURL: url,
        fileType: file.type,
        createdAt: Timestamp.now(),
      });

      showPopup('File uploaded successfully!', 'success');
      setFile(null);
      setName('');
      setCategory('');
      setCustomCategory('');
      setCountry('');
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
    } catch (err) {
      console.error(err);
      showPopup('Upload failed.', 'error');
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

