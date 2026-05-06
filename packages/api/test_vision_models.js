import OpenAI from 'openai';
import fs from 'fs';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  baseURL: process.env.API_BASE_URL || 'https://ai.hackclub.com/proxy/v1',
});

const models = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-flash-image',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3.7-sonnet',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.2-11b-vision-instruct'
];

async function run() {
  const imageData = fs.readFileSync('test.jpg');
  const base64 = imageData.toString('base64');
  
  for (const model of models) {
    console.log(`Testing ${model}...`);
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: "What is this image?" },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
            ],
          },
        ],
      });
      console.log(`SUCCESS [${model}]:`, response.choices[0].message.content.substring(0, 50));
      return; // Stop at first successful model
    } catch (err) {
      console.log(`FAILED [${model}]:`, err.message);
    }
  }
}
run().catch(console.error);
