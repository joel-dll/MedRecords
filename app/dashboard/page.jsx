'use client';
import DashboardHeader from '../components/Header';
import Footer from '../components/Footer';
import GreetingCard from '../components/GreetingCard';
import HealthReminders from '../components/HealthReminders';
import BmiCalculator from '../components/BmiCalculator';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <GreetingCard />

     
      <div className="reminder-bmi-row">
        <HealthReminders />
        <BmiCalculator />
      </div>

      <Footer />
    </div>
  );
}
