import HealthReminders from '../components/HealthReminders';
import BmiCalculator from '../components/BmiCalculator';
import PredictiveHealthRiskAssessment from '../components/PredictiveHealthRiskAssessment';
import WeightChart from '../components/WeightChart';

export default function Dashboard() {
  return (
    <div className="dashboard-page">
    <div className="chart-card"><WeightChart /></div>
      
      <div className="reminder-bmi-row">
        <div className="reminders-card"><HealthReminders /></div>
        <div className="bmi-card"><BmiCalculator /></div>
        <div className="predict-card"><PredictiveHealthRiskAssessment /></div>
      </div>
    </div>
  );
}
