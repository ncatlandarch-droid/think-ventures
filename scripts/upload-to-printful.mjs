/**
 * Upload existing merch designs to Printful and create products
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const PRINTFUL_KEY = process.env.PRINTFUL_API_KEY;
if (!PRINTFUL_KEY) { console.error('ERROR: Set PRINTFUL_API_KEY'); process.exit(1); }

async function printfulAPI(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_KEY}`,
      'Content-Type': 'application/json',
      'X-PF-Store-Id': '18232014',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.printful.com${endpoint}`, opts);
  const data = await res.json();
  return data;
}

// Our existing designs mapped to Printful products
const DESIGNS = [
  { name: 'Think! Ventures Classic Tee', file: 'classic-tee.png', productId: 71, variantIds: [4011,4012,4013,4014,4015], price: 29.99, placement: 'front' },
  { name: 'Bella Mascot Tee', file: 'bella-tee.png', productId: 71, variantIds: [4011,4012,4013,4014,4015], price: 29.99, placement: 'front' },
  { name: 'Founder Mode Hoodie', file: 'founder-hoodie.png', productId: 146, variantIds: [7854,7855,7856,7857,7858], price: 54.99, placement: 'embroidery_front' },
  { name: 'LaunchPad Crew Tee', file: 'launchpad-tee.png', productId: 71, variantIds: [4011,4012,4013,4014,4015], price: 29.99, placement: 'front' },
  { name: 'Think! Ventures Cap', file: 'ventures-cap.png', productId: 206, variantIds: [7853], price: 24.99, placement: 'embroidery_front' },
  { name: 'Entrepreneur Mug', file: 'entrepreneur-mug.png', productId: 19, variantIds: [1320], price: 19.99, placement: 'default' },
  { name: 'Dream Builder Tote', file: 'dream-tote.png', productId: 314, variantIds: [10029], price: 22.99, placement: 'front' },
  { name: 'Bella Kids Tee', file: 'bella-kids-tee.png', productId: 71, variantIds: [4011,4012,4013,4014,4015], price: 24.99, placement: 'front' },
];

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Uploading designs to Printful');
  console.log('═══════════════════════════════════════════\n');

  // First verify API works
  console.log('  Testing Printful API...');
  const storeInfo = await printfulAPI('/stores');
  console.log(`  Connected! Store count: ${Array.isArray(storeInfo.result) ? storeInfo.result.length : 'N/A'}\n`);

  // Skip already-created products
  const SKIP = ['Think! Ventures Classic Tee', 'Bella Mascot Tee', 'LaunchPad Crew Tee', 'Entrepreneur Mug', 'Bella Kids Tee'];

  for (const design of DESIGNS) {
    if (SKIP.includes(design.name)) { console.log(`  ${design.name}... SKIPPED (already created)`); continue; }
    console.log(`  ${design.name}...`);
    
    try {
      // Use the live URL from the deployed site
      const publicUrl = `https://thinkventures.app/assets/images/merch/${design.file}`;
      
      // Upload file to Printful using public URL
      const uploadResult = await printfulAPI('/files', 'POST', {
        type: 'default',
        url: publicUrl,
        filename: design.file,
      });
      
      if (uploadResult.code !== 200) {
        console.log(`    Upload failed: ${JSON.stringify(uploadResult)}`);
        continue;
      }
      
      const fileId = uploadResult.result.id;
      console.log(`    Uploaded! File ID: ${fileId}`);
      
      // Create sync product
      const syncVariants = design.variantIds.map(vid => ({
        variant_id: vid,
        retail_price: design.price,
        files: [{ type: design.placement, id: fileId }],
      }));
      
      const product = await printfulAPI('/store/products', 'POST', {
        sync_product: { name: design.name, thumbnail: publicUrl },
        sync_variants: syncVariants,
      });
      
      if (product.code === 200) {
        console.log(`    Product created in Printful!`);
      } else {
        console.log(`    Product result: ${JSON.stringify(product).substring(0, 200)}`);
      }
      
    } catch (err) {
      console.log(`    Error: ${err.message}`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════');
  console.log('  Done! Check your Printful dashboard.');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
