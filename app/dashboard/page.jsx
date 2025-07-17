'use client';
import DashboardHeader from '../components/Header';
import Footer from '../components/Footer';
import GreetingCard from '../components/GreetingCard';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <GreetingCard />
      <main className="dashboard-main">
        <h2>Welcome to your Dashboard</h2>
        <p>Select a section to view or manage your health records.</p>
      </main>
      <Footer />
    </div>
  );
}
