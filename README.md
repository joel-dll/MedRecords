# MedRecords

A secure medical records web application built with Next.js and Firebase, including AI features for translation, summarisation and health predictions.

---

## Features

- **Secure Authentication** with Firebase (email/password + Google sign-in)  
- **Medical Records Storage** in Firebase (Firestore + Storage)  
- **AI Assistance** using Google Gemini for translation, summarisation, and health insights  
- **Email Notifications** with EmailJS for record sharing  
- **Multilingual Support** (English & Portuguese)  
- **Responsive Design** for mobile and desktop  

---

## Getting Started

### Option 1. Download ZIP file from Solent (With API Credentials)

1- Download the project as a ZIP file and extract it.
2- Ensure you have Node.js (v18.18 or later, 20 LTS recommended) installed.
3- In the project folder, install dependencies: 
  - npm ci
  - npm audit fix --force ( if necessary)

4- Start the development server:
  - npm run dev

5- Open http://localhost:3000 in your browser.

### Option 2. Clone with Git (No API Credentials - Ai features will no work)

- git clone https://github.com/joel-dll/MedRecords.git
- cd MedRecords
- npm ci
- npm run dev


### Option 3 . Vercel
For the fully functional version, use the live deployment:
 - https://med-records-navy.vercel.app


# Maintenance Note — 27 Sep 2025

The packaged project MedRecords-main.zip has been uploaded to the university platform for assessment.
I can’t modify the ZIP already uploaded.

I had to rotate the Google Generative AI API key today due to the following error when calling Gemini:

[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: fetchFn is not a function

 What changed

Updated .env.local with a new key (API_KEY).

In API routes, changed the model from gemini-1.5-flash to gemini-2.0.

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0' });

Vercel Deployment: The app is live, updated and functioning correctly on Vercel at https://med-records-navy.vercel.app
 

