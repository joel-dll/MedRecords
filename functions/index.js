// functions/index.js
// Force deploy attempt: July 19, 2025 15:08 PM BST

const functions = require("firebase-functions");
const { // Forced line break for strict max-len rule
  GoogleGenerativeAI,
} = require("@google/generative-ai");

// Best practice: Store API keys securely in Firebase Environment
// Configuration. For example, if you set it with:
// firebase functions:config:set gemini.api_key="YOUR_API_KEY"
// const GEMINI_API_KEY_CONFIG = functions.config().gemini.api_key;
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY_CONFIG);

// For now, keep your hardcoded key if you haven't set config yet.
// REMINDER: Hardcoding API keys is not recommended for production.
const GEMINI_API_KEY = "AIzaSyCL_BPA1DvY1PwAmvXGKnHys7TFLxafshQ";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);


exports.predictHealthRisk = functions.https.onCall(async (data, context) => {
  // Input validation (optional but good practice)
  if (!data.medicalHistory || !data.familyHistory ||
      !data.age || !data.lifestyle) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required health data fields.",
    );
  }

  const {medicalHistory, familyHistory, age, lifestyle} = data;

  const prompt = `
    Given the following user health details:
    - Medical History: ${medicalHistory}
    - Family History: ${familyHistory}
    - Age: ${age}
    - Lifestyle: ${lifestyle}

    Provide a brief health risk assessment.
  `;

  try {
    const model = genAI.getGenerativeModel({model: "gemini-pro"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {prediction: text};
  } catch (error) {
    // Log the actual error for debugging in Firebase Functions logs
    console.error("Error calling Gemini API or processing response:", error);

    // Re-throw as an HttpsError to provide more specific feedback to the client
    if (error.response && error.response.status) {
      // If it's an error from the Gemini API call itself
      throw new functions.https.HttpsError(
          "unavailable", // Or 'failed-precondition' or 'internal'
          `Gemini API error: ${error.message || "Unknown Gemini API error"}`,
          error, // Pass the original error object for more details
      );
    } else {
      // A more general internal server error
      throw new functions.https.HttpsError(
          "internal",
          "An unexpected error occurred during health risk prediction.",
          error.message, // Pass the error message for client-side debugging
      );
    }
  }
});
