
'use client';

import { AiOutlineRobot } from "react-icons/ai";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { auth, db, storage } from '../../lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

import PopUpMessage from '../../components/PopUpMessage';
import FamilyFileUpload from '../../components/FamilyFileUpload';

export default function FamilyMemberView() {
  const { id } = useParams();
  const [userId, setUserId] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [records, setRecords] = useState([]);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userId || !id) return;

    const fetchData = async () => {
      try {
        const memberRef = doc(db, 'users', userId, 'family', id);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
          setMemberData(memberSnap.data());
        } else {
          setPopup({ visible: true, message: 'Family member not found.', type: 'error' });
        }
      } catch (err) {
        console.error('Fetch member failed:', err);
      }
    };

    fetchData();
  }, [userId, id]);

  useEffect(() => {
    if (!userId || !id) return;

    const recordsRef = query(
      collection(db, 'users', userId, 'family', id, 'records'),
      orderBy('createdAt', 'desc')
    );

    const unsubRecords = onSnapshot(recordsRef, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecords(list);
    });

    return () => {
      unsubRecords();
    };
  }, [userId, id]);

  return (
    <div className="family-member-page">
      <h2>Family Member Profile</h2>
      {memberData ? (
        <div className="profile-card">
          <img src={memberData.photoURL || '/default-profile.png'} className="family-photo" />
          <div>
            <h3>{memberData.name}</h3>
            <p>Age: {memberData.age}</p>
            <p>Relationship: {memberData.relationship}</p>
            <p>Role: {memberData.role}</p>
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}

      {userId && id && (
        <FamilyFileUpload
          userId={userId}
          memberId={id}
          onUpload={() => {
            const recordsRef = collection(db, 'users', userId, 'family', id, 'records');
            onSnapshot(recordsRef, (snapshot) => {
              const updated = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              setRecords(updated);
            });
          }}
        />
      )}

      <div className="records-section">
        <h3>Medical Records</h3>
        {records.length > 0 ? (
            <ul>
            {records.map((rec) => (
                <li
                key={rec.id}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                <a href={rec.fileURL} target="_blank" rel="noreferrer">
                    {rec.name} ({rec.category || rec.fileType})
                </a>

                <button
                    onClick={() => setRecordToDelete(rec)}
                    style={{
                    background: '#e74c3c',
                    fontSize: '10px',
                    color: 'white',
                    border: 'none',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '5px',
                    cursor: 'pointer'
                    }}
                >
                    Delete
                </button>

                <button
                  title="AI Translate or Summarize"
                  onClick={() => {
                    window.location.href = `/ai_family?filePath=${encodeURIComponent(rec.filePath)}`;
                  }}
                  style={{
                    background: '#497f77ff',
                    fontSize: '12px',
                    color: 'white',
                    border: 'none',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <AiOutlineRobot />
                  AI
                </button>

                </li>
            ))}
            </ul>
        ) : (
            <p>No records available.</p>
        )}
        </div>


      {popup.visible && (
        <PopUpMessage
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ visible: false, message: '', type: 'info' })}
        />
      )}

      {recordToDelete && (
  <PopUpMessage
    message={`Are you sure you want to delete "${recordToDelete.name}"?`}
    type="warning"
    onClose={() => setRecordToDelete(null)}
    onConfirm={async () => {
      try {
        if (!recordToDelete.fileURL) {
          throw new Error('Missing fileURL');
        }

       
        const filePath = decodeURIComponent(
          new URL(recordToDelete.fileURL).pathname.split('/o/')[1].split('?')[0]
        );

        
        
        const fileRef = storageRef(storage, filePath);

        
        await deleteObject(fileRef);
        

        
        await deleteDoc(doc(db, 'users', userId, 'family', id, 'records', recordToDelete.id));
        

        
        setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));

        setPopup({ visible: true, message: 'Record file deleted.', type: 'success' });
      } catch (err) {
        console.error('Delete error:', err);
        setPopup({ visible: true, message: 'Failed to delete record.', type: 'error' });
      } finally {
        setRecordToDelete(null);
      }
    }}
    showConfirm={true}
  />
)}
    </div>
  );
}
