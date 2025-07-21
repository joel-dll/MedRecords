import { db } from '../../lib/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { medicalHistory, familyHistory, age, lifestyle, userId } = body;

    if (!userId) throw new Error('Missing userId from client');

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    const bmiQuery = query(
      collection(db, `users/${userId}/bmiRecords`),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const bmiSnapshot = await getDocs(bmiQuery);

    let bmi = 'Not recorded';
    let weight = 'N/A';
    let height = 'N/A';
    let bmiDate = 'N/A';

    if (!bmiSnapshot.empty) {
      const data = bmiSnapshot.docs[0].data();
      bmi = data.bmi;
      weight = data.weight;
      height = data.height;
      bmiDate = data.createdAt.toDate().toLocaleDateString();
    }

    const name = userDoc.exists() ? userDoc.data().name : 'User';

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

const prompt = `
    User: ${name}
    Medical History: ${medicalHistory}
    Family History: ${familyHistory}
    Lifestyle: ${lifestyle}

    Latest BMI Record:
    - BMI: ${bmi}
    - Weight: ${weight} kg
    - Height: ${height} cm
    - Recorded on: ${bmiDate}

    Based on all the above, provide a health risk assessment in 3 sentences or fewer. 
    Begin the response by addressing the user by name, as in: "${name}, your..."
    Use natural, direct language that sounds like a personal message.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return new Response(JSON.stringify({ prediction: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
