import { auth } from '../app/lib/firebase';

export async function getHealthRiskPrediction(data) {
  const response = await fetch('/api/health-prediction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error('Prediction API error');
  }

  const result = await response.json();
  return result.prediction;
}
