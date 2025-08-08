import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(req) {
  try {
    const { fileUrl, prompt, fileType } = await req.json();

    
    if (!fileUrl || !prompt || !fileType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      throw new Error('Failed to fetch file from Firebase');
    }
    const fileBuffer = await fileRes.arrayBuffer();

    
    const base64Data = Buffer.from(fileBuffer).toString('base64');

    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: fileType,
          data: base64Data,
        },
      },
    ]);

    const output = await result.response.text();
    return NextResponse.json({ output });

  } catch (err) {
    console.error('AI API error:', err);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
