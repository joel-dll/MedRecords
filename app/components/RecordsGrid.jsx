
'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { AiFillDelete } from 'react-icons/ai';
import { IoShareOutline, IoEyeOutline } from 'react-icons/io5';
import { AiOutlineRobot } from 'react-icons/ai';
import { createSecureShareToken } from '../../utils/shareSecureFile';
import emailjs from '@emailjs/browser';
import FamilyPage from '../family/page';
import PopUpMessage from './PopUpMessage';

export default function RecordGrid() {
  const [records, setRecords] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const [popup, setPopup] = useState({
  visible: false,
  message: '',
  type: 'info',
  onConfirm: null,
  input: false,
  onInputSubmit: null,
});
  const showPopup = (
  message,
  type = 'info',
  onConfirm = null,
  input = false,
  onInputSubmit = null
) => {
  setPopup({ visible: true, message, type, onConfirm, input, onInputSubmit });
};
  const closePopup = () => {
  setPopup({
    visible: false,
    message: '',
    type: 'info',
    onConfirm: null,
    input: false,
    onInputSubmit: null,
  });
};
  
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setRecords([]);
        setLoadingRecords(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!isAuthReady || !currentUser) {
        setLoadingRecords(false);
        return;
      }

      setLoadingRecords(true);
      try {
        const recordsRef = collection(db, 'users', currentUser.uid, 'records');
        const snapshot = await getDocs(recordsRef);
        const fetchedDocs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(record => record.fileURL);
        setRecords(fetchedDocs);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchRecords();
  }, [currentUser, isAuthReady]);

  const getPathFromURL = (url) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const match = decodedUrl.match(/\/o\/(.*?)(?:\?alt|$)/);
      return match ? match[1] : '';
    } catch (e) {
      console.error("Error parsing file path from URL:", url, e);
      return '';
    }
  };

  const handleDelete = async (record) => {
    if (!currentUser) {
      showPopup('Please log in to delete files.');
      return;
    }
    showPopup(
    `Are you sure you want to delete "${record.name}"?`,
    'warning',
    async () => {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'records', record.id));
        setRecords((prev) => prev.filter((r) => r.id !== record.id));
        showPopup('File deleted successfully.', 'success');
      } catch (err) {
        console.error('Error deleting record:', err);
        showPopup('Failed to delete file.', 'error');
      }
    }
  );
};

  const handleShare = async (record) => {
  if (!isAuthReady) {
    showPopup('Authentication is still loading.', 'info');
    return;
  }

  if (!currentUser) {
    showPopup('Please log in first to share files.', 'error');
    return;
  }

  
  showPopup(
    "Enter the recipient's email (e.g., your GP, specialist, or family member):",
    'info',
    null, 
    true, 
    async (email) => {
      if (!email) return;

      const filePath = getPathFromURL(record.fileURL);
      if (!filePath) {
        showPopup('Could not determine file path.', 'error');
        return;
      }

      try {
        const secureLink = await createSecureShareToken(filePath, email);
        await emailjs.send(
          'service_vrlm1p4',
          'template_lrceerx',
          {
            to_email: email,
            file_link: secureLink,
            from_name: currentUser.displayName || currentUser.email,
          },
          'OhcGaiZTHJFqEZ5xw'
        );
        showPopup(`Secure link sent to ${email}`, 'success');
      } catch (err) {
        console.error('Email share failed:', err);
        showPopup('Failed to send email.', 'error');
      }
    }
  );
};


  
  const safeRecords = Array.isArray(records) ? records : [];
  const filteredRecords = filterCategory === 'All'
    ? safeRecords
    : safeRecords.filter((record) => record.category === filterCategory);

  if (!isAuthReady) {
    return <div><p>Loading user authentication...</p></div>;
  }

  return (
    <div>
      <div className="filter-bar">
        <label htmlFor="category-filter">Filter by Category:</label>
        <select
          id="category-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Blood Test">Blood Test</option>
          <option value="Allergy">Allergy</option>
          <option value="Prescription">Prescription</option>
          <option value="Diagnosis">Diagnosis</option>
          <option value="Scan/Imaging">Scan/Imaging</option>
          <option value="Vaccination">Vaccination</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {loadingRecords && <p>Loading medical records...</p>}
      {!loadingRecords && filteredRecords.length === 0 && (
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 200 }}>
            No medical records found.
        </p>
      )}
    
      <div className="record-grid">
        {filteredRecords.map((record) => (
          <div className="record-card" key={record.id}>
            <h4>{record.name}</h4>
            <p className="record-detail">{record.category || record.fileType}</p>
            <p className="record-detail">{record.country}</p>
            <div className="record-actions">
              <a href={record.fileURL} target="_blank" rel="noopener noreferrer" title="View">
                <IoEyeOutline className="records-icon" />
              </a>
              <button title="Share" onClick={() => handleShare(record)}>
                <IoShareOutline className="records-icon" />
              </button>
              <button title="AI Translate">
                <AiOutlineRobot className="records-icon" />
              </button>
              <button title="Delete" onClick={() => handleDelete(record)}>
                <AiFillDelete className="records-icon" />
              </button>
            </div>
          </div>
        ))}
       </div>

      {popup.visible && (
  <PopUpMessage
        message={popup.message}
        type={popup.type}
        input={popup.input}
        onClose={() => {
        if (!popup.input) {
            if (popup.onConfirm) popup.onConfirm();
            closePopup();
        }
        }}
        onInputSubmit={(value) => {
        if (popup.onInputSubmit) popup.onInputSubmit(value);
        closePopup();
        }}
    />
    )}

    </div>
  );
}