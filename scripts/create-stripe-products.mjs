/**
 * Think! Ventures — Stripe Product & Payment Link Creator
 * 
 * Automatically creates all merch products in Stripe and generates
 * payment links. Then updates merch.html with the live buy links.
 * 
 * Usage:
 *   1. Set your Stripe key: setx STRIPE_SECRET_KEY "sk_live_..."
 *   2. Close & reopen terminal
 *   3. Run: node scripts/create-stripe-products.mjs
 * 
 * This will:
 *   - Create 8 products in your Stripe dashboard
 *   - Create a price for each product
 *   - Generate a payment link for each
 *   - Update merch.html with real "Buy Now" links
 */

import Stripe from 'stripe';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ─── Config ───
const API_KEY = process.env.STRIPE_SECRET_KEY;
if (!API_KEY) {
  console.error('ERROR: Set STRIPE_SECRET_KEY environment variable first.');
  console.error('  CMD:        setx STRIPE_SECRET_KEY "sk_live_..."');
  console.error('  PowerShell: [System.Environment]::SetEnvironmentVariable("STRIPE_SECRET_KEY", "sk_live_...", "User")');
  process.exit(1);
}

const stripe = new Stripe(API_KEY);

// ─── Product Definitions ───
const PRODUCTS = [
  {
    id: 'classic-tee',
    name: 'Think! Ventures Classic Tee',
    description: 'Black Bella+Canvas 3001 tee with Think! logo front, "Building Dreams" on back. Premium ringspun cotton.',
    price: 2999, // cents
    image: 'classic-tee.png',
  },
  {
    id: 'bella-tee',
    name: 'Bella Mascot Tee',
    description: '"Every Dream Deserves a Launch" with Bella illustration. Bella+Canvas 3001 unisex.',
    price: 2999,
    image: 'bella-tee.png',
  },
  {
    id: 'founder-hoodie',
    name: 'Founder Mode Hoodie',
    description: 'Premium heavyweight hoodie. "FOUNDER MODE" with Think! logo embroidered. Gildan 18500.',
    price: 5499,
    image: 'founder-hoodie.png',
  },
  {
    id: 'launchpad-tee',
    name: 'LaunchPad Crew Tee',
    description: '"Built by LaunchPad" badge design. Join the crew. Bella+Canvas 3001.',
    price: 2999,
    image: 'launchpad-tee.png',
  },
  {
    id: 'ventures-cap',
    name: 'Think! Ventures Cap',
    description: 'Embroidered Think! logo snapback. Yupoong 6245CM. One size fits most.',
    price: 2499,
    image: 'ventures-cap.png',
  },
  {
    id: 'entrepreneur-mug',
    name: 'Entrepreneur Mug',
    description: 'Ceramic mug with Bella + Think! branding. 11oz. Start every morning with the mission.',
    price: 1999,
    image: 'entrepreneur-mug.png',
  },
  {
    id: 'dream-tote',
    name: 'Dream Builder Tote',
    description: 'Canvas tote with Bella illustration. Carry the mission everywhere.',
    price: 2299,
    image: 'dream-tote.png',
  },
  {
    id: 'bella-kids-tee',
    name: 'Bella Kids Tee',
    description: 'Kid-friendly Bella design for young dreamers. "Future Founder" in teal.',
    price: 2499,
    image: 'bella-kids-tee.png',
  },
];

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Think! Ventures — Stripe Product Setup');
  console.log('═══════════════════════════════════════════\n');

  const mode = API_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE';
  console.log(`  Mode: ${mode}\n`);

  const paymentLinks = {};

  for (const product of PRODUCTS) {
    process.stdout.write(`  Creating: ${product.name}...`);

    // 1. Create the product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: {
        brand: 'Think! Ventures Foundation',
        category: 'merch',
        product_id: product.id,
      },
    });

    // 2. Create the price
    const price = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: product.price,
      currency: 'usd',
    });

    // 3. Create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: 'redirect',
        redirect: { url: 'https://thinkventures.app/merch-success.html' },
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        product_id: product.id,
      },
    });

    paymentLinks[product.id] = paymentLink.url;
    console.log(` Done! ${paymentLink.url}`);
  }

  // ─── Update merch.html ───
  console.log('\n  Updating merch.html with payment links...\n');

  const merchPath = join(PROJECT_ROOT, 'merch.html');
  let html = readFileSync(merchPath, 'utf8');

  // Build the link map for the JS product data
  const linkMap = JSON.stringify(paymentLinks, null, 2);

  // Inject payment links into the page
  // We'll add a STRIPE_LINKS constant and update the Add to Cart button
  const linksScript = `
    // ─── Stripe Payment Links (auto-generated) ───
    const STRIPE_LINKS = ${linkMap};
`;

  // Insert the links constant right after the PRODUCTS array
  html = html.replace(
    '    let cartCount = 0;',
    `${linksScript}\n    let cartCount = 0;`
  );

  // Replace "Add to Cart" button with "Buy Now" linking to Stripe
  html = html.replace(
    `<button class="btn btn--gold" style="width: 100%;" onclick="addToCart(\${p.id})">Add to Cart</button>`,
    `<a href="\${STRIPE_LINKS[PRODUCTS[p.id-1]?.id] || '#'}" target="_blank" class="btn btn--gold" style="width: 100%; display: block; text-align: center; text-decoration: none;">Buy Now</a>`
  );

  writeFileSync(merchPath, html);

  // ─── Summary ───
  console.log('═══════════════════════════════════════════');
  console.log('  All products created successfully!\n');
  console.log('  Payment Links:');
  for (const [id, url] of Object.entries(paymentLinks)) {
    console.log(`    ${id}: ${url}`);
  }
  console.log('\n  merch.html updated with live Buy Now links');
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});
