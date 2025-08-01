import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(req) {
  const { fileUrl, prompt, fileType } = await req.json();

  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  const fileRes = await fetch(fileUrl);
  const fileBuffer = await fileRes.arrayBuffer();

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: fileType,
        data: Buffer.from(fileBuffer).toString('base64'),
      },
    },
  ]);

  const output = await result.response.text();
  return NextResponse.json({ output });
}