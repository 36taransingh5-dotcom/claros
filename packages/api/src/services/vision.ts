import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  baseURL: process.env.API_BASE_URL || 'https://ai.hackclub.com/proxy/v1',
});

const MODEL = process.env.MODEL_NAME || 'qwen/qwen3-32b';

export interface VisionResult {
  part_name: string;
  part_category: string;
  application_domain: string;
  specifications: Record<string, string>;
  confidence: number;
  visible_markings: string[];
  suggested_search_terms: string[];
  description: string;
  condition: string;
}

const VISION_PROMPT = `You are an expert automotive and industrial parts identification system specialising in truck, trailer, and heavy commercial vehicle components.

Analyse this image and identify the part. Return ONLY valid JSON with this exact structure:
{
  "part_name": "specific technical name of the part (e.g. S-Cam Brake Shoe, K27 Turbocharger, 24V Alternator)",
  "part_category": "broad system category (e.g. Brakes, Engine, Electrical, Suspension, Drivetrain, Air System, Cooling)",
  "application_domain": "truck or trailer or truck/trailer",
  "specifications": {
    "key1": "value1"
  },
  "confidence": 0.0 to 1.0,
  "visible_markings": ["any part numbers, brand names, or codes visible on the part"],
  "suggested_search_terms": ["3 to 5 specific search terms to find this part"],
  "description": "one sentence technical description of the part and its function",
  "condition": "new or used or worn or unknown"
}

Be highly specific with the part_name. Don't just say 'Brakes' if you see a brake shoe. Focus on truck/trailer/heavy commercial vehicle parts.`;

export async function identifyPartFromImage(imagePath: string): Promise<VisionResult> {
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  const ext = imagePath.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const mimeType = mimeMap[ext || 'jpg'] || 'image/jpeg';

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: VISION_PROMPT },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0].message.content || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Model returned no valid JSON');
  return JSON.parse(jsonMatch[0]) as VisionResult;
}

export async function identifyPartFromText(description: string): Promise<VisionResult> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `You are an expert truck/trailer parts identification system. Given this text description of a part, return structured JSON identification.

Description: "${description}"

Return ONLY valid JSON:
{
  "part_name": "specific name",
  "part_category": "category",
  "application_domain": "truck or trailer or truck/trailer",
  "specifications": {},
  "confidence": 0.0 to 1.0,
  "visible_markings": [],
  "suggested_search_terms": ["term1", "term2", "term3"],
  "description": "technical description",
  "condition": "unknown"
}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0].message.content || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Model returned no valid JSON');
  return JSON.parse(jsonMatch[0]) as VisionResult;
}
