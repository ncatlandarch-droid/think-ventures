/**
 * Generate Pre-Recorded WAVs for Bella using Gemini Neural TTS
 * 
 * Usage: node scripts/generate-bella-audio.mjs
 * Requires: GEMINI_API_KEY environment variable
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY;
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const VOICE_NAME = 'Kore'; // Warm female, natural
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'audio');

// ─── Bella's Pre-Recorded Phrases ──────────────────────────────────
const PHRASES = {
  // LaunchPad wizard steps
  'step-0': "Let's start with the basics. What kind of business are you building?",
  'step-1': "Great choice! Now, where will your business call home?",
  'step-2': "Now let's figure out the right structure. Most small businesses start as an LLC.",
  'step-3': "Almost there! What will you call your business?",
  'step-4': "Here's your complete roadmap. Every step, every form, every fee mapped out.",

  // Homepage section triggers
  'welcome': "Hey there! I'm Bella, your guide to Think Ventures. Scroll down to see how we build businesses for free!",
  'explainer': "This is our full explainer video. Watch it to see how we turn dreams into real businesses.",
  'mission': "We serve first-generation founders, HBCU communities, and rural entrepreneurs who can't afford to wait.",
  'programs': "Four powerful programs. LaunchPad builds your business. Merch Engine creates your store.",
  'proof': "Arlan LLC is real proof. Built from zero to a fully operational business in one day.",
  'partners': "Meet our partner ecosystem. Every partner strengthens the network for everyone.",

  // Chat quick answers
  'about-llc': "An LLC protects your personal assets from business debts. It's the most popular choice for small businesses, and I highly recommend it!",
  'about-cost': "Everything through Think Ventures is completely free. Zero cost to you. We cover the website, branding, merch store, and business plan.",
  'about-time': "Most businesses go from idea to fully launched in two to five days. That includes your website, branding, merch, and business plan.",
  'about-help': "I can help you choose your industry, pick the right business structure, and walk you through every step of launching!",
  'about-nonprofit': "A 501 c 3 nonprofit is tax-exempt and eligible for grants and donations. Great for mission-focused ventures!",
  'fallback': "Great question! Keep going through the wizard and I'll guide you at every step.",

  // Celebration / reward sounds
  'bark-goodjob': "*excited bark* Woof! Good job! You're doing amazing!",
  'bark-welcome': "*happy bark* Woof woof! Welcome! I'm so excited to help you today!",
  'bark-complete': "*celebratory bark* Woof woof woof! You did it! Your business roadmap is ready!",
  'bark-select': "*quick bark* Woof! Great choice!",
  'step-done': "Awesome! One more step closer to launching your business!",
  'congrats': "Congratulations! You just took a huge step toward your dream. I'm so proud of you!",
};

// ─── PCM to WAV ──────────────────────────────────────────────────────
function pcmToWav(pcmBytes, sampleRate = 24000) {
  const dataSize = pcmBytes.length;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM format
  buffer.writeUInt16LE(1, 22);        // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);        // block align
  buffer.writeUInt16LE(16, 34);       // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmBytes.copy(buffer, 44);

  return buffer;
}

// ─── Generate One Phrase ─────────────────────────────────────────────
async function generatePhrase(key, text) {
  console.log(`  Generating: ${key} — "${text.substring(0, 50)}..."`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } }
          }
        }
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API ${response.status}: ${err.substring(0, 200)}`);
  }

  const data = await response.json();
  const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

  if (!audioPart) {
    throw new Error(`No audio returned for key: ${key}`);
  }

  // Decode base64 PCM
  const pcmBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
  const mime = audioPart.inlineData.mimeType || '';
  const rateMatch = mime.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;

  // Convert to WAV
  const wavBuffer = pcmToWav(pcmBuffer, sampleRate);
  const outputPath = path.join(OUTPUT_DIR, `en-${key}.wav`);
  fs.writeFileSync(outputPath, wavBuffer);

  const sizeKB = Math.round(wavBuffer.length / 1024);
  console.log(`  Saved: en-${key}.wav (${sizeKB} KB)`);

  return outputPath;
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('\n========================================');
  console.log('BELLA VOICE GENERATOR');
  console.log(`Voice: ${VOICE_NAME}`);
  console.log(`Model: ${TTS_MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('========================================\n');

  if (!API_KEY) {
    console.error('ERROR: GEMINI_API_KEY not found in environment!');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const entries = Object.entries(PHRASES);
  let success = 0;
  let failed = 0;

  for (const [key, text] of entries) {
    try {
      await generatePhrase(key, text);
      success++;
      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`  FAILED: ${key} — ${err.message}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`DONE! ${success} generated, ${failed} failed`);
  console.log(`Files in: ${OUTPUT_DIR}`);
  console.log('========================================\n');
}

main();
