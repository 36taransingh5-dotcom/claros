import OpenAI from 'openai';
import fs from 'fs';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  baseURL: process.env.API_BASE_URL || 'https://ai.hackclub.com/proxy/v1',
});

async function run() {
  try {
    // Generate a tiny valid 1x1 jpeg in base64
    const tinyB64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Just say hello." },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${tinyB64}` } },
          ],
        },
      ],
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
