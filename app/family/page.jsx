'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import PopUpMessage from '../components/PopUpMessage';

export default function FamilyPage() {
  const [userId, setUserId] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    
    const q = collection(db, 'users', userId, 'family');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFamilyMembers(members);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (id) => {
    try {
      
      await deleteDoc(doc(db, 'users', userId, 'family', id));
      setPopup({ visible: true, message: 'Family member removed.', type: 'success' });
    } catch (error) {
      setPopup({ visible: true, message: 'Failed to delete. Try again.', type: 'error' });
    }
  };

  return (
    <div className="family-page">
      <h2>My Family</h2>
      <button className="add-family-btn" onClick={() => router.push('/family/add')}>
        + Add Family Member
      </button>

      {familyMembers.map((member) => (
        <div className="family-card" key={member.id}>
          <div className="family-left">
            <img
              key={member.photoURL} 
              src={member.photoURL || '/default-profile.png'}
              alt="Profile"
              className="family-photo"
            />
            <div>
              <h3>{member.name}</h3>
              <p>{member.age} years old, {member.relationship}</p>
            </div>
          </div>
          <div className="family-right">
            <span className="status">Active</span>
            <div className="actions">
              <button onClick={() => router.push(`/family/${member.id}`)}>View</button>
              <button onClick={() => router.push(`/family/edit/${member.id}`)}>Edit</button>
              <button onClick={() => handleDelete(member.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}

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
