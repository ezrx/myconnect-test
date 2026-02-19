import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in .env.local');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There is no direct listModels in the high-level SDK, but we can try to fetch a common model to verify
    console.log('Testing connection with gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('ping');
    console.log('gemini-1.5-flash works!');
  } catch (error: any) {
    console.error('gemini-1.5-flash failed:', error.message);
  }

  try {
    console.log('Testing connection with gemini-2.0-flash-exp...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('ping');
    console.log('gemini-2.0-flash-exp works!');
  } catch (error: any) {
    console.error('gemini-2.0-flash-exp failed:', error.message);
  }
}

listModels();
