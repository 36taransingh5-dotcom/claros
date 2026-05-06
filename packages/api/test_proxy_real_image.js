import OpenAI from 'openai';
import fs from 'fs';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  baseURL: process.env.API_BASE_URL || 'https://ai.hackclub.com/proxy/v1',
});

async function run() {
  try {
    // Generate a simple valid red 10x10 png base64
    const validB64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAXSURBVChTY3jP4PgfHQMDKB4VMGoYGgAAMJgE9b2RjL4AAAAASUVORK5CYII=";
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Just say hello." },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${validB64}` } },
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
