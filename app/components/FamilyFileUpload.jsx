'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import PopUpMessage from './PopUpMessage';

export default function FamilyFileUpload({ userId, memberId, onUpload }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });

  const fileInputRef = useRef();

  const handleUpload = async () => {
    if (!file || !name || !category) {
      setPopup({ visible: true, message: 'Please fill in all fields.', type: 'error' });
      return;
    }

    try {
      setUploading(true);

      
      const timestamp = Date.now();
      const filePath = `users/${userId}/family/${memberId}/records/${timestamp}-${file.name}`;
      const fileRef = ref(storage, filePath);

      
      await uploadBytes(fileRef, file);

      
      const fileURL = await getDownloadURL(fileRef);

      
      await addDoc(collection(db, 'users', userId, 'family', memberId, 'records'), {
        name,
        category,
        fileURL,
        filePath, 
        createdAt: Timestamp.now(),
      });

      setFile(null);
      setName('');
      setCategory('');
      setPopup({ visible: true, message: 'File uploaded successfully.', type: 'success' });

      if (onUpload) onUpload();
    } catch (err) {
      console.error('Upload failed:', err);
      setPopup({ visible: true, message: 'Upload failed. Try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-card">
      <h4>Upload Family Record</h4>
      <input
        className="upload-input"
        type="text"
        placeholder="Record Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="upload-input"
        type="text"
        placeholder="Category (e.g., Vaccine, Report)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button className="choose-btn" type="button" onClick={() => fileInputRef.current.click()}>
        {file ? file.name : 'Choose File'}
      </button>
      <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {popup.visible && (
        <PopUpMessage
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ visible: false, message: '', type: 'info' })}
        />
      )}
    </div>
  );
}
