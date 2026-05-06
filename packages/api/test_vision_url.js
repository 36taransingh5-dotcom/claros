import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  baseURL: process.env.API_BASE_URL || 'https://ai.hackclub.com/proxy/v1',
});

async function run() {
  const response = await openai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: "What is this image?" },
          {
            type: 'image_url',
            image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Truck_brake_shoe.jpg/800px-Truck_brake_shoe.jpg" },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0].message.content);
}
run().catch(console.error);
