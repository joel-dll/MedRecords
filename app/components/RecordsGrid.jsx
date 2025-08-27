
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { AiFillDelete } from 'react-icons/ai';
import { AiOutlineRobot } from 'react-icons/ai';
import { IoShareOutline, IoEyeOutline, IoDownloadOutline } from 'react-icons/io5';

import emailjs from '@emailjs/browser';
import { createSecureShareToken } from '../../utils/shareSecureFile';
import PopUpMessage from './PopUpMessage';

export default function RecordGrid() {
  const router = useRouter();
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
    showCancel: false,
  });

  const showPopup = (
    message,
    type = 'info',
    onConfirm = null,
    input = false,
    onInputSubmit = null,
    showCancel = false
  ) => {
    setPopup({ visible: true, message, type, onConfirm, input, onInputSubmit, showCancel });
  };

  const closePopup = () => {
    setPopup({
      visible: false,
      message: '',
      type: 'info',
      onConfirm: null,
      input: false,
      onInputSubmit: null,
      showCancel: false,
    });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setRecords([]);
        setLoadingRecords(false);
      }
      setIsAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !currentUser) {
      setLoadingRecords(false);
      return;
    }

    const recordsRef = collection(db, 'users', currentUser.uid, 'records');
    const unsub = onSnapshot(
      recordsRef,
      (snapshot) => {
        const fetched = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => typeof r.fileURL === 'string' && r.fileURL.length > 0);
        setRecords(fetched);
        setLoadingRecords(false);
      },
      (err) => {
        console.error('Error fetching records:', err);
        setLoadingRecords(false);
      }
    );
    return () => unsub();
  }, [currentUser, isAuthReady]);

  

  const getPathFromURL = (url) => {
    try {
      const decoded = decodeURIComponent(url);
      const match = decoded.match(/\/o\/(.*?)(?:\?alt|$)/);
      return match ? match[1] : '';
    } catch (e) {
      console.error('Error parsing file path from URL:', url, e);
      return '';
    }
  };

  const filenameFromURL = (url, fallback = 'record') => {
    try {
      const clean = url.split('?')[0];
      const last = clean.split('/').pop() || fallback;
      return decodeURIComponent(last);
    } catch {
      return fallback;
    }
  };

 
  const aiHrefFor = (record) => {
    const filePath = record?.storagePath || getPathFromURL(record?.fileURL || '');
    return filePath ? { pathname: '/ai_page', query: { filePath } } : null;
  };

  

  const handleDelete = (record) => {
    if (!currentUser) {
      showPopup('Please log in to delete files.', 'error');
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
      },
      false,
      null,
      true
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
  const filteredRecords =
    filterCategory === 'All'
      ? safeRecords
      : safeRecords.filter((r) => r.category === filterCategory);

  if (!isAuthReady) {
    return (
      <div>
        <p>Loading user authentication...</p>
      </div>
    );
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

      <div className="record-grid" role="list">
        {filteredRecords.map((record) => {
          const fileURL = record.fileURL || '';
          const fileName = filenameFromURL(fileURL, record.name || 'record');
          const aiHref = aiHrefFor(record);

          return (
            <div className="record-card" key={record.id} role="listitem">
              <h4 id={`rec-${record.id}-title`}>{record.name}</h4>
              <p className="record-detail">{record.category || record.fileType}</p>
              <p className="record-detail">{record.country}</p>

              <div className="record-actions">
                
                <a
                  className="records-icon"
                  href={fileURL || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View"
                  aria-label={`View ${record.name || 'record'}`}
                  aria-disabled={!fileURL}
                  tabIndex={fileURL ? 0 : -1}
                >
                  <IoEyeOutline aria-hidden="true" focusable="false" />
                </a>

                
                <a
                  className="records-icon"
                  href={fileURL || undefined}
                  download={fileName}
                  title="Download"
                  aria-label={`Download ${record.name || 'record'}`}
                  aria-disabled={!fileURL}
                  tabIndex={fileURL ? 0 : -1}
                >
                  <IoDownloadOutline aria-hidden="true" focusable="false" />
                </a>

                
                <button
                  type="button"
                  className="records-icon"
                  title="Share"
                  aria-label={`Share ${record.name || 'record'}`}
                  onClick={() => handleShare(record)}
                >
                  <IoShareOutline aria-hidden="true" focusable="false" />
                </button>

                
                {aiHref ? (
                  <Link
                    href={aiHref}
                    prefetch
                    className="records-icon"
                    title="Analyze with AI"
                    aria-label={`Analyze ${record.name || 'record'} with AI`}
                  >
                    <AiOutlineRobot aria-hidden="true" focusable="false" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="records-icon"
                    title="Analyze with AI"
                    aria-label={`Analyze ${record.name || 'record'} with AI`}
                    onClick={() =>
                      showPopup('Cannot open AI: missing file path for this record.', 'error')
                    }
                  >
                    <AiOutlineRobot aria-hidden="true" focusable="false" />
                  </button>
                )}

                
                <button
                  type="button"
                  className="delete-button"
                  title="Delete"
                  aria-label={`Delete ${record.name || 'record'}`}
                  onClick={() => handleDelete(record)}
                >
                  <AiFillDelete aria-hidden="true" focusable="false" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {popup.visible && (
        <PopUpMessage
          message={popup.message}
          type={popup.type}
          input={popup.input}
          showCancel={popup.showCancel}
          onClose={(confirmed) => {
            if (confirmed && popup.onConfirm) popup.onConfirm();
            closePopup();
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
