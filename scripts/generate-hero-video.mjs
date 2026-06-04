/**
 * Think! Ventures — Veo 3.1 Hero Video Generator
 * 
 * Generates a cinematic 8-second hero video for the Think! Ventures landing page
 * using Google's Veo 3.1 model via the Gemini API.
 * 
 * Usage:
 *   1. Set your Gemini API key: set GEMINI_API_KEY=your-key-here
 *   2. Run: node scripts/generate-hero-video.mjs
 * 
 * The video will be saved to assets/videos/hero-bg.mp4
 */

import { GoogleGenAI } from '@google/genai';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ─── Config ───
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('ERROR: Set GEMINI_API_KEY environment variable first.');
  console.error('  PowerShell: $env:GEMINI_API_KEY = "your-key-here"');
  process.exit(1);
}

const OUTPUT_DIR = join(PROJECT_ROOT, 'assets', 'videos');
const OUTPUT_FILE = join(OUTPUT_DIR, 'hero-bg.mp4');

// ─── Cinematic Prompt ───
const PROMPT = `Fast-paced cinematic montage of diverse minority entrepreneurs building their dreams. 
Opens on a young Black woman unlocking the front door of her brand-new hair salon, flipping the OPEN sign with a proud smile, camera tracking alongside her. 
Quick cut to a Latino man in a food truck window, handing a steaming plate to a smiling customer at a bustling street market.
Cut to two young Black men in a modern coworking space, excitedly high-fiving over a laptop screen showing a successful launch.
Cut to a hijabi woman carefully arranging handmade products on shelves in her boutique shop.
Cut to a Black man in a hard hat on a construction site, reviewing blueprints with his diverse crew behind him.
Final shot: wide angle of a vibrant, diverse community gathering at a grand opening celebration with string lights, families, and children running. Everyone is celebrating together.
The energy builds throughout — camera moves are dynamic with dolly shots, tracking shots, and smooth handheld. 
Warm golden hour lighting throughout, cinematic color grading with deep teal shadows and amber highlights.
Uplifting orchestral music that builds to an inspiring crescendo.
Shot on anamorphic lens, cinematic shallow depth of field, professional color grading.
No text, no graphics, no watermarks on screen.`;

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Think! Ventures — Veo 3.1 Hero Video');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log(`Model: veo-3.1-generate-preview`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log('');
  
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  console.log('Submitting video generation request...');
  console.log('');
  console.log('Prompt:');
  console.log(`  "${PROMPT.substring(0, 100)}..."`);
  console.log('');

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: PROMPT,
    config: {
      aspectRatio: '16:9',     // Landscape for hero background
      // resolution: '1080p',  // Uncomment for higher quality if available
    },
  });

  console.log('Video generation started. This typically takes 2-5 minutes...');
  console.log('');

  // Poll for completion
  let pollCount = 0;
  const startTime = Date.now();
  
  while (!operation.done) {
    pollCount++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    process.stdout.write(`\r  Generating... (${elapsed}s elapsed, poll #${pollCount})`);
    
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10s interval
    
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n\nVideo generation complete! (${totalTime}s total)`);

  // Check for errors
  if (!operation.response || !operation.response.generatedVideos || operation.response.generatedVideos.length === 0) {
    console.error('ERROR: No video was generated. Response:', JSON.stringify(operation, null, 2));
    process.exit(1);
  }

  // Download the video
  console.log('Downloading video...');
  
  const generatedVideo = operation.response.generatedVideos[0];
  
  await ai.files.download({
    file: generatedVideo.video,
    downloadPath: OUTPUT_FILE,
  });

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`  Video saved to: ${OUTPUT_FILE}`);
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Preview the video to make sure it looks good');
  console.log('  2. The homepage will automatically use it as the hero background');
  console.log('  3. Deploy to Netlify');
}

main().catch(err => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});
