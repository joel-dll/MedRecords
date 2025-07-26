'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

import FileUpload from './FileUpload';
import RecordsGrid from './RecordsGrid';

export default function RecordsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [records, setRecords] = useState([]);

 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      console.log('Auth ready. User:', user?.email || 'None');
    });
    return () => unsubscribe();
  }, []);

  
  const fetchRecords = async () => {
    if (!currentUser) return;

    try {
      const recordsRef = collection(db, 'users', currentUser.uid, 'records');
      const snapshot = await getDocs(recordsRef);
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecords(docs);
      console.log(`Loaded ${docs.length} records`);
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  
  useEffect(() => {
    if (isAuthReady && currentUser) {
      fetchRecords();
    }
  }, [isAuthReady, currentUser]);

  return (
    <div className="records-page">
      <FileUpload currentUser={currentUser} onUploadSuccess={fetchRecords} />
      <RecordsGrid
        records={records}
        setRecords={setRecords}
        currentUser={currentUser}
        isAuthReady={isAuthReady}
      />
    </div>
  );
}


