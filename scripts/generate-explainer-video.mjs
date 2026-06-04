/**
 * Think! Ventures — Explainer Video Generator
 * Generates a process walkthrough explainer video via Veo 3.1
 */

import { GoogleGenAI } from '@google/genai';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('ERROR: Set GEMINI_API_KEY'); process.exit(1); }

const OUTPUT_DIR = join(PROJECT_ROOT, 'assets', 'videos');
const OUTPUT_FILE = join(OUTPUT_DIR, 'explainer.mp4');

const PROMPT = `A warm, professional explainer-style video showing the step-by-step journey of starting a business through a nonprofit incubator program.

Scene: A clean, modern coworking space with warm lighting. A diverse group of entrepreneurs at different stages:

First, a young Black woman sits at a laptop, scrolling through an interactive wizard on screen. She selects "Hair Salon" from a grid of business types. The screen glows with teal and gold colors. She smiles and clicks "Next."

Then she's seen reviewing a checklist document with a mentor beside her, pointing at items and nodding encouragingly. Official-looking documents with state seals are spread on the desk.

Next, a time-lapse of a laptop screen showing a beautiful website being built — pages appearing, a logo animating in, a merch store going live with products.

Finally, the woman stands proudly in front of her newly opened salon, cutting a gold ribbon with scissors. Confetti falls. Friends and family cheer behind her. A "NOW OPEN" sign glows in the window.

The mood transitions from curious and hopeful to confident and celebratory.
Professional cinematic lighting with teal shadows and warm golden accents throughout.
Smooth, uplifting orchestral background music that builds to a triumphant finish.
Shot in 4K cinematic quality with shallow depth of field. 
No text, graphics, or watermarks on screen.`;

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Think! Ventures — Explainer Video');
  console.log('═══════════════════════════════════════════\n');

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  console.log('Submitting explainer video generation...\n');
  console.log(`Prompt: "${PROMPT.substring(0, 80)}..."\n`);

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: PROMPT,
    config: { aspectRatio: '16:9' },
  });

  console.log('Generating (typically 1-3 minutes)...\n');

  let pollCount = 0;
  const startTime = Date.now();

  while (!operation.done) {
    pollCount++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    process.stdout.write(`\r  Generating... (${elapsed}s elapsed, poll #${pollCount})`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n\nComplete! (${totalTime}s)\n`);

  if (!operation.response?.generatedVideos?.length) {
    console.error('ERROR: No video generated.', JSON.stringify(operation, null, 2));
    process.exit(1);
  }

  console.log('Downloading...');
  await ai.files.download({
    file: operation.response.generatedVideos[0].video,
    downloadPath: OUTPUT_FILE,
  });

  console.log(`\n  Saved to: ${OUTPUT_FILE}\n`);
}

main().catch(err => { console.error('Fatal:', err.message || err); process.exit(1); });
