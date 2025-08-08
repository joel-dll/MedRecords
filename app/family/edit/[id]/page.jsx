'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import PopUpMessage from '../../../components/PopUpMessage';

export default function EditFamilyMemberPage() {
  const { id } = useParams();
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    role: '',
    relationship: '',
    photoUrl: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'users', userId, 'family', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          setFormData(null);
          console.warn('No such document');
        }
      } catch (err) {
        console.error('Error fetching family member:', err);
      }
    };

    if (userId) fetchData();
  }, [userId, id]);

  const showPopup = (message, type = 'info') => {
    setPopup({ visible: true, message, type });
  };

  const closePopup = () => {
    setPopup({ visible: false, message: '', type: 'info' });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      let updatedData = { ...formData };

      if (photoFile) {
        const fileRef = ref(storage, `users/${userId}/family/${Date.now()}-${photoFile.name}`);
        await uploadBytes(fileRef, photoFile);
        const photoURL = await getDownloadURL(fileRef);
        updatedData.photoURL = photoURL;
        setPhotoFile(null); 
      }

      await updateDoc(doc(db, 'users', userId, 'family', id), updatedData);

      showPopup('Family member updated successfully.', 'success');
      setTimeout(() => router.push('/family'), 2000);
    } catch (error) {
      console.error('Update failed:', error);
      showPopup('Failed to update. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (formData === null) {
    return <p style={{ color: 'red', padding: '2rem' }}>Family member not found or may have been deleted.</p>;
  }

  return (
    <div className="edit-family-form">
      <h3>Edit Family Member</h3>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
      />

      <input
        type="number"
        name="age"
        placeholder="Age"
        value={formData.age}
        onChange={handleChange}
      />

      <input
        type="text"
        name="role"
        placeholder="Role (e.g., Daughter)"
        value={formData.role}
        onChange={handleChange}
      />

      <input
        type="text"
        name="relationship"
        placeholder="Relationship (e.g., Child)"
        value={formData.relationship}
        onChange={handleChange}
      />

      <input type="file" onChange={handlePhotoChange} />
      {formData.photoUrl && (
        <img
          src={formData.photoUrl}
          alt="Profile"
          style={{ width: '120px', borderRadius: '10px', marginTop: '1rem' }}
        />
      )}

      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update'}
      </button>

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
