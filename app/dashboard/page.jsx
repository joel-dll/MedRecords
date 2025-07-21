import HealthReminders from '../components/HealthReminders';
import BmiCalculator from '../components/BmiCalculator';
import PredictiveHealthRiskAssessment from '../components/PredictiveHealthRiskAssessment';

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="reminder-bmi-row">
        <div className="card-section"><HealthReminders /></div>
        <div className="card-section"><BmiCalculator /></div>
        <div className="card-section"><PredictiveHealthRiskAssessment /></div>
      </div>
    </div>
  );
}
