'use client';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="dashboard-header">
      <h1 className="dashboard-logo">MedRecords</h1>
      <nav className="dashboard-nav">
        <a href="/dashboard">Dashboard</a>
        <a href="/my-records">My Records</a>
        <a href="/family">Family</a>
      </nav>
      <button className="logout-button" onClick={handleLogout}>Log Out</button>
    </header>
  );
}
