'use client';

import { useEffect, useMemo, useState } from 'react';
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
    birthdate: '',
    address: '',
    nationality: '',
    placeOfBirth: '',
    mobileNumber: '',
    passportNumber: '',
    healthcareNumber: '',
    healthcareUnit: '',
    sex: '',
    
    bloodGroup: '',
    medicationsDaily: '',
    healthConditions: '',
   
    email: '',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'info' });
  const showPopup = (message, type = 'info') => setPopup({ visible: true, message, type });
  const closePopup = () => setPopup({ visible: false, message: '', type: 'info' });

  
  const age = useMemo(() => {
    if (!form.birthdate) return '';
    try {
      const dob = new Date(form.birthdate);
      if (Number.isNaN(dob.getTime())) return '';
      const now = new Date();
      let years = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
      return years >= 0 ? String(years) : '';
    } catch {
      return '';
    }
  }, [form.birthdate]);

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
        birthdate: existing.birthdate || '',
        address: existing.address || '',
        nationality: existing.nationality || '',
        placeOfBirth: existing.placeOfBirth || '',
        mobileNumber: existing.mobileNumber || '',
        passportNumber: existing.passportNumber || '',
        healthcareNumber: existing.healthcareNumber || '',
        healthcareUnit: existing.healthcareUnit || '',
        sex: existing.sex || '',
        
        bloodGroup: existing.bloodGroup || '',
        medicationsDaily: existing.medicationsDaily || '',
        healthConditions: existing.healthConditions || '',
        
        email: user.email || existing.email || '',
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
            'We sent a verification link to your new email. Confirm it to complete the change. (Check spam!)',
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
          birthdate: form.birthdate,
          address: form.address,
          nationality: form.nationality,
          placeOfBirth: form.placeOfBirth,
          mobileNumber: form.mobileNumber,
          passportNumber: form.passportNumber,
          healthcareNumber: form.healthcareNumber,
          healthcareUnit: form.healthcareUnit,
          sex: form.sex,
          
          bloodGroup: form.bloodGroup,
          medicationsDaily: form.medicationsDaily,
          healthConditions: form.healthConditions,
          
          email: form.email,
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
      <p className="settings-subtitle">Keep your personal, health, and account details up to date</p>

      
      <h3 className="section-title">Personal Info</h3>
      <div className="settings-grid">
        <div className="field">
          <label>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="e.g., Maria Silva"
          />
        </div>

        <div className="field">
          <label>Birthdate</label>
          <input
            type="date"
            name="birthdate"
            value={form.birthdate}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Age</label>
          <input value={age} readOnly placeholder="Auto" />
        </div>

        <div className="field field-wide">
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, Number, City, Postcode, Country"
          />
        </div>

        <div className="field">
          <label>Nationality</label>
          <input
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            placeholder="e.g., Portuguese"
          />
        </div>

        <div className="field">
          <label>Place of Birth</label>
          <input
            name="placeOfBirth"
            value={form.placeOfBirth}
            onChange={handleChange}
            placeholder="e.g., Porto, Portugal"
          />
        </div>

        <div className="field">
          <label>Mobile Number</label>
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="+44 7xxx xxxxxx"
          />
        </div>

        <div className="field">
          <label>Passport Number</label>
          <input
            name="passportNumber"
            value={form.passportNumber}
            onChange={handleChange}
            placeholder="e.g., 12345678"
          />
        </div>

        <div className="field">
          <label>Healthcare Number</label>
          <input
            name="healthcareNumber"
            value={form.healthcareNumber}
            onChange={handleChange}
            placeholder="e.g., NHS 123 456 7890"
          />
        </div>

        <div className="field">
          <label>Healthcare Unit (GP)</label>
          <input
            name="healthcareUnit"
            value={form.healthcareUnit}
            onChange={handleChange}
            placeholder="e.g., East Dulwich GP Centre"
          />
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
      </div>

      
      <h3 className="section-title">Health Info</h3>
      <div className="settings-grid">
        <div className="field">
          <label>Blood Group</label>
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
            <option value="">Select…</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        <div className="field field-wide">
          <label>Medications (daily)</label>
          <textarea
            name="medicationsDaily"
            value={form.medicationsDaily}
            onChange={handleChange}
            placeholder="e.g., Metformin 500mg — 1 tab daily; Ramipril 5mg — morning"
            rows={3}
          />
        </div>

        <div className="field field-wide">
          <label>Health Conditions</label>
          <textarea
            name="healthConditions"
            value={form.healthConditions}
            onChange={handleChange}
            placeholder="e.g., Asthma since 2010; Type 2 Diabetes diagnosed 2022"
            rows={3}
          />
        </div>
      </div>

      
      <h3 className="section-title">Account</h3>
      <div className="settings-grid account-grid">   
        <div className="field">
          <label>Email (login)</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </div>

        {auth.currentUser?.email !== form.email &&
          auth.currentUser?.providerData?.[0]?.providerId === 'password' && (
            <div className="field">
              <label>Confirm Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </div>
          )
        }
      </div>

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
