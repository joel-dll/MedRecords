'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; 

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchFamily = async () => {
      const snapshot = await getDocs(collection(db, 'users', userId, 'family'));
      const members = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFamilyMembers(members);
    };

    fetchFamily();
  }, [userId]);

  return (
    <div className="family-page">
      <h2>Family</h2>
      <button onClick={() => router.push('/family/add')} className="add-button">
        + Add Family Member
      </button>

      <div className="family-list">
        {familyMembers.map((member) => (
          <div key={member.id} className="family-card">
            <Image
              src={member.photoURL || '/default-avatar.png'}
              width={60}
              height={60}
              alt={member.name}
              className="family-avatar"
            />
            <div className="family-info">
              <h4>{member.name}</h4>
              <p>{member.age} years old, {member.role}</p>
              <p className="status">{member.status}</p>
            </div>
            <div className="family-actions">
              <a href={`/family/${member.id}`}>View</a>
              <a href={`/family/${member.id}/upload`}>Upload</a>
              <a href="#" onClick={() => alert('Remove functionality coming soon')}>Remove</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
