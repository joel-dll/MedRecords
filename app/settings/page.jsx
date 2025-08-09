'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import PopUpMessage from '../components/PopUpMessage';

export default function SettingsPage() {
  const router = useRouter();

  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    healthcareNumber: '',
    healthcareUnit: '',
    sex: '',
    birthdate: '',
    nationality: '',
    placeOfBirth: '',
    address: '',
    email: '',
    mobileNumber: '',
    passportNumber: '',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });
  const showPopup = (message, type = 'info') => setPopup({ visible: true, message, type });
  const closePopup = () => setPopup({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      setUid(user.uid);

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const existing = snap.exists() ? snap.data() : {};

      setForm({
        fullName: existing.fullName || '',
        healthcareNumber: existing.healthcareNumber || '',
        healthcareUnit: existing.healthcareUnit || '',
        sex: existing.sex || '',
        birthdate: existing.birthdate || '',
        nationality: existing.nationality || '',
        placeOfBirth: existing.placeOfBirth || '',
        address: existing.address || '',
        email: user.email || existing.email || '',
        mobileNumber: existing.mobileNumber || '',
        passportNumber: existing.passportNumber || '',
      });

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  
  const reauth = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user.');

    const providerId = user.providerData?.[0]?.providerId;

    if (providerId === 'password') {
      if (!currentPassword) {
        throw new Error('Please enter your current password to change the email.');
      }
      const currentEmail = user.email;
      if (!currentEmail) throw new Error('Current account has no email.');
      const credential = EmailAuthProvider.credential(currentEmail, currentPassword);
      await reauthenticateWithCredential(user, credential);
    } else if (providerId === 'google.com') {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
    } else {
      throw new Error('Re-authentication method not supported for this account.');
    }
  };

  const handleSave = async () => {
    if (!uid) return;

    if (!form.email) {
      showPopup('Email is required.', 'error');
      return;
    }

    try {
      setSaving(true);

      
      if (auth.currentUser && form.email !== auth.currentUser.email) {
        try {
          await reauth();

          const actionCodeSettings = {
            url: `${window.location.origin}/email-updated`,
            handleCodeInApp: true,
          };

          await verifyBeforeUpdateEmail(auth.currentUser, form.email, actionCodeSettings);

          
          await setDoc(
            doc(db, 'users', uid),
            { pendingEmail: form.email, updatedAt: serverTimestamp() },
            { merge: true }
          );

          showPopup(
            'We sent a verification link to your new email. Confirm it to complete the change.(Check spam!)',
            'success'
          );

          setSaving(false);
          return; 
        } catch (err) {
          console.error('Email change flow error:', err);
          showPopup(err?.message || 'Could not start email change. Please try again.', 'error');
          setSaving(false);
          return;
        }
      }

      
      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          fullName: form.fullName,
          healthcareNumber: form.healthcareNumber,
          healthcareUnit: form.healthcareUnit,
          sex: form.sex,
          birthdate: form.birthdate,
          nationality: form.nationality,
          placeOfBirth: form.placeOfBirth,
          address: form.address,
          email: form.email,
          mobileNumber: form.mobileNumber,
          passportNumber: form.passportNumber,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      showPopup('Profile updated successfully.', 'success');
      setCurrentPassword('');
    } catch (err) {
      console.error('Save error:', err);
      if (String(err.code || '').includes('requires-recent-login')) {
        showPopup('Please sign out and sign in again to change the email.', 'error');
      } else {
        showPopup(err.message || 'Failed to save. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <p className="loading-text">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h2>Profile & Settings</h2>
        <p className="settings-subtitle">Update your personal and healthcare information</p>

        <div className="settings-grid">
          <div className="field">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g., Maria Silva" />
          </div>

          <div className="field">
            <label>Healthcare Number</label>
            <input name="healthcareNumber" value={form.healthcareNumber} onChange={handleChange} placeholder="e.g., NHS 123 456 7890" />
          </div>

          <div className="field">
            <label>Healthcare Unit</label>
            <input name="healthcareUnit" value={form.healthcareUnit} onChange={handleChange} placeholder="e.g., East Dulwich GP Centre" />
          </div>

          <div className="field">
            <label>Sex</label>
            <select name="sex" value={form.sex} onChange={handleChange}>
              <option value="">Select…</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="field">
            <label>Birthdate</label>
            <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Nationality</label>
            <input name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g., Portuguese" />
          </div>

          <div className="field">
            <label>Place of Birth</label>
            <input name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} placeholder="e.g., Porto, Portugal" />
          </div>

          <div className="field field-wide">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Street, Number, City, Postcode, Country" />
          </div>

          <div className="field">
            <label>Email (login)</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
          </div>

          <div className="field">
            <label>Mobile Number</label>
            <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="+44 7xxx xxxxxx" />
          </div>

          <div className="field">
            <label>Passport Number</label>
            <input name="passportNumber" value={form.passportNumber} onChange={handleChange} placeholder="e.g., 12345678" />
          </div>
        </div>

        
        {auth.currentUser?.email !== form.email &&
          auth.currentUser?.providerData?.[0]?.providerId === 'password' && (
            <div className="reauth-box">
              <p className="reauth-info">
                You are changing your login email. Please confirm your current password to proceed.
              </p>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </div>
          )
        }

        <div className="settings-actions">
          <button className="btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {popup.visible && (
        <PopUpMessage message={popup.message} type={popup.type} onClose={closePopup} />
      )}
    </div>
  );
}
