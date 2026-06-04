/**
 * Think! Apparel — Instant Merch Pipeline
 * 
 * End-to-end automated merch creation:
 *   1. Generate high-res print designs via Gemini Imagen
 *   2. Upload designs to Printful
 *   3. Create products in Printful (syncs to Stripe automatically)
 *   4. Generate Stripe payment links
 *   5. Output ready-to-embed product data
 * 
 * Environment Variables Required:
 *   GEMINI_API_KEY     — Google AI API key (for design generation)
 *   PRINTFUL_API_KEY   — Printful API token (for product creation)
 *   STRIPE_SECRET_KEY  — Stripe secret key (for payment links)
 * 
 * Usage:
 *   node scripts/merch-pipeline.mjs --brand "Think! Ventures" --designs designs.json
 *   node scripts/merch-pipeline.mjs --quick "Think! Ventures"
 * 
 * Quick mode generates a standard 4-product line (Tee, Hoodie, Cap, Mug)
 */

import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ─── Environment ───
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const PRINTFUL_KEY = process.env.PRINTFUL_API_KEY;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

const missing = [];
if (!GEMINI_KEY) missing.push('GEMINI_API_KEY');
if (!PRINTFUL_KEY) missing.push('PRINTFUL_API_KEY');
if (!STRIPE_KEY) missing.push('STRIPE_SECRET_KEY');

if (missing.length > 0) {
  console.error(`ERROR: Missing environment variables: ${missing.join(', ')}`);
  console.error('Set them with: setx VARIABLE_NAME "value"');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
const stripe = new Stripe(STRIPE_KEY);

// ─── Printful API Helper ───
async function printfulAPI(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  
  const res = await fetch(`https://api.printful.com${endpoint}`, opts);
  const data = await res.json();
  
  if (data.code !== 200 && data.code !== undefined) {
    throw new Error(`Printful API error: ${data.result || JSON.stringify(data)}`);
  }
  return data.result || data;
}

// ─── Printful Product Catalog IDs ───
// Common Printful product IDs for popular items
const PRINTFUL_PRODUCTS = {
  tee: {
    id: 71,           // Bella+Canvas 3001 Unisex Short Sleeve
    name: 'Unisex Staple Tee',
    variants: [
      { size: 'S', color: 'Black', variant_id: 4011 },
      { size: 'M', color: 'Black', variant_id: 4012 },
      { size: 'L', color: 'Black', variant_id: 4013 },
      { size: 'XL', color: 'Black', variant_id: 4014 },
      { size: '2XL', color: 'Black', variant_id: 4015 },
    ],
    placement: 'front',
    retailPrice: 29.99,
  },
  hoodie: {
    id: 146,          // Gildan 18500 Heavy Blend Hoodie
    name: 'Heavy Blend Hoodie',
    variants: [
      { size: 'S', color: 'Black', variant_id: 7854 },
      { size: 'M', color: 'Black', variant_id: 7855 },
      { size: 'L', color: 'Black', variant_id: 7856 },
      { size: 'XL', color: 'Black', variant_id: 7857 },
      { size: '2XL', color: 'Black', variant_id: 7858 },
    ],
    placement: 'front',
    retailPrice: 54.99,
  },
  mug: {
    id: 19,           // White Glossy Mug 11oz
    name: 'White Glossy Mug',
    variants: [
      { size: '11oz', color: 'White', variant_id: 1320 },
    ],
    placement: 'default',
    retailPrice: 19.99,
  },
  cap: {
    id: 206,          // Yupoong 6245CM Dad Hat
    name: 'Dad Hat',
    variants: [
      { size: 'One Size', color: 'Black', variant_id: 7853 },
    ],
    placement: 'front',
    retailPrice: 24.99,
  },
  tote: {
    id: 83,           // Canvas Tote
    name: 'Tote Bag',
    variants: [
      { size: 'One Size', color: 'Natural', variant_id: 4531 },
    ],
    placement: 'front',
    retailPrice: 22.99,
  },
};

// ─── Design Generation ───
async function generateDesign(prompt, outputPath) {
  console.log(`    Generating design...`);
  
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const imageBytes = response.generatedImages[0].image.imageBytes;
    const buffer = Buffer.from(imageBytes, 'base64');
    writeFileSync(outputPath, buffer);
    console.log(`    Saved: ${outputPath}`);
    return outputPath;
  }
  throw new Error('No image generated');
}

// ─── Upload to Printful ───
async function uploadToPrintful(filePath, fileName) {
  console.log(`    Uploading to Printful...`);
  
  const fileBuffer = readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  
  const result = await printfulAPI('/files', 'POST', {
    type: 'default',
    url: `data:image/png;base64,${base64}`,
    filename: fileName,
  });
  
  console.log(`    Uploaded! File ID: ${result.id}`);
  return result;
}

// ─── Create Printful Product ───
async function createPrintfulProduct(name, fileId, productType, retailPrice) {
  console.log(`    Creating Printful product...`);
  
  const catalog = PRINTFUL_PRODUCTS[productType];
  if (!catalog) throw new Error(`Unknown product type: ${productType}`);
  
  const syncVariants = catalog.variants.map(v => ({
    variant_id: v.variant_id,
    retail_price: retailPrice || catalog.retailPrice,
    files: [{
      type: catalog.placement,
      id: fileId,
    }],
  }));
  
  const product = await printfulAPI('/store/products', 'POST', {
    sync_product: {
      name: name,
      thumbnail: fileId,
    },
    sync_variants: syncVariants,
  });
  
  console.log(`    Created! Product ID: ${product.id}`);
  return product;
}

// ─── Create Stripe Payment Link ───
async function createStripeLink(name, description, priceInCents) {
  console.log(`    Creating Stripe payment link...`);
  
  const product = await stripe.products.create({
    name,
    description,
    metadata: { brand: 'Think! Apparel', pipeline: 'auto' },
  });
  
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: priceInCents,
    currency: 'usd',
  });
  
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    shipping_address_collection: { allowed_countries: ['US'] },
    after_completion: {
      type: 'redirect',
      redirect: { url: 'https://thinkventures.app/merch-success.html' },
    },
  });
  
  console.log(`    Payment link: ${link.url}`);
  return link.url;
}

// ─── Quick Mode: Standard 4-Product Line ───
function getQuickLineDesigns(brandName) {
  const cleanName = brandName.replace(/[!.]/g, '');
  return [
    {
      name: `${brandName} Classic Tee`,
      type: 'tee',
      price: 2999,
      prompt: `A high-resolution print-ready graphic design on a solid transparent background for a t-shirt. The design features a bold, modern logo for "${brandName}" with clean geometric lines. Use deep teal (#0D4F4F) and warm gold (#F5A623) colors. The style is premium, architectural, and tech-forward. Just the graphic design — no shirt, no mockup, no model. Vector-clean edges, centered composition. High contrast for DTG printing. 4500x5400px print area.`,
    },
    {
      name: `${brandName} Premium Hoodie`,
      type: 'hoodie',
      price: 5499,
      prompt: `A high-resolution print-ready graphic design on a solid transparent background for a hoodie. Large bold text "${cleanName}" in a premium condensed font with a small geometric icon above it. Colors: teal (#0D4F4F) and gold (#F5A623). Modern streetwear aesthetic. Just the graphic — no hoodie, no mockup. Clean edges, centered. Print-ready.`,
    },
    {
      name: `${brandName} Snapback Cap`,
      type: 'cap',
      price: 2499,
      prompt: `A small, simple embroidery-ready logo design on a solid transparent background. A minimal geometric monogram of the initials of "${brandName}" in gold (#F5A623) with clean angular lines. Small, compact design suitable for cap embroidery. Just the icon — no cap, no mockup. Maximum 3 colors for embroidery compatibility.`,
    },
    {
      name: `${brandName} Ceramic Mug`,
      type: 'mug',
      price: 1999,
      prompt: `A wide horizontal wraparound print design on a solid transparent background for an 11oz mug. Features the "${brandName}" logo with a fun, inspiring message: "Building Dreams Daily" in modern typography. Colors: teal (#0D4F4F) and gold (#F5A623) on white background. Just the flat graphic — no mug, no mockup. Dimensions optimized for mug printing.`,
    },
  ];
}

// ─── Main Pipeline ───
async function main() {
  const args = process.argv.slice(2);
  
  let brandName = 'Think! Ventures';
  let designs = [];
  
  // Parse args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--brand' || args[i] === '--quick') brandName = args[i + 1];
    if (args[i] === '--designs') {
      const designFile = readFileSync(args[i + 1], 'utf8');
      designs = JSON.parse(designFile);
    }
  }
  
  // Quick mode — generate standard line
  if (designs.length === 0) {
    designs = getQuickLineDesigns(brandName);
  }
  
  console.log('');
  console.log('========================================================');
  console.log(`  Think! Apparel — Instant Merch Pipeline`);
  console.log('========================================================');
  console.log(`  Brand: ${brandName}`);
  console.log(`  Products: ${designs.length}`);
  console.log(`  Mode: ${STRIPE_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
  console.log('========================================================\n');
  
  const outputDir = join(PROJECT_ROOT, 'assets', 'images', 'merch', 'prints');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  
  const results = [];
  
  for (let i = 0; i < designs.length; i++) {
    const design = designs[i];
    console.log(`\n[${i + 1}/${designs.length}] ${design.name}`);
    console.log('  ─────────────────────────────────────');
    
    try {
      // Step 1: Generate design
      const slug = design.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const designPath = join(outputDir, `${slug}.png`);
      await generateDesign(design.prompt, designPath);
      
      // Step 2: Upload to Printful
      let printfulFile = null;
      try {
        printfulFile = await uploadToPrintful(designPath, `${slug}.png`);
      } catch (e) {
        console.log(`    Printful upload skipped: ${e.message}`);
      }
      
      // Step 3: Create Printful product
      if (printfulFile) {
        try {
          await createPrintfulProduct(design.name, printfulFile.id, design.type, design.price / 100);
        } catch (e) {
          console.log(`    Printful product skipped: ${e.message}`);
        }
      }
      
      // Step 4: Create Stripe payment link
      const paymentLink = await createStripeLink(
        design.name,
        `${brandName} official merchandise`,
        design.price
      );
      
      results.push({
        name: design.name,
        type: design.type,
        price: design.price / 100,
        designFile: designPath,
        paymentLink,
      });
      
      console.log('    COMPLETE');
      
    } catch (err) {
      console.error(`    ERROR: ${err.message}`);
    }
  }
  
  // ─── Summary ───
  console.log('\n========================================================');
  console.log('  PIPELINE COMPLETE');
  console.log('========================================================\n');
  
  for (const r of results) {
    console.log(`  ${r.name}`);
    console.log(`    Price: $${r.price.toFixed(2)}`);
    console.log(`    Design: ${r.designFile}`);
    console.log(`    Buy Link: ${r.paymentLink}`);
    console.log('');
  }
  
  // Save results
  const resultsPath = join(PROJECT_ROOT, 'merch-pipeline-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`  Results saved to: ${resultsPath}`);
  console.log('========================================================\n');
}

main().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
