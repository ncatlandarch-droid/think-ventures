/**
 * Think! Ventures — Automated Merch Pipeline
 * 
 * Creates a standard merch collection in Printful for any brand logo.
 * Usage: node merch-pipeline.js <logo-path> <brand-name> [--store-id=18232014]
 * 
 * Standard Collection:
 *   1. Unisex T-Shirt (Bella + Canvas 3001) — ID 71
 *   2. Premium Pullover Hoodie (Cotton Heritage M2580) — ID 380
 *   3. White Glossy Mug (11oz) — ID 19
 *   4. Tote Bag — ID 84
 *   5. Dad Hat (Otto Cap) — ID 396
 *   6. Kids Tee — (same as 71, youth sizes)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Config ───────────────────────────────────────────────────────────
const API_KEY = process.env.PRINTFUL_API_KEY;
const DEFAULT_STORE_ID = '18232014'; // Think! Apparel store

const STANDARD_COLLECTION = [
  {
    name: 'Classic Logo Tee',
    product_id: 71,  // Bella + Canvas 3001
    variant_ids: [4012, 4013, 4014, 4017, 4018], // S, M, L, XL, 2XL in Black
    color: 'Black',
    placement: 'front',
    printfile_id: 1,
    print_area: { width: 1800, height: 2400 }
  },
  {
    name: 'Founder Mode Hoodie',
    product_id: 380, // Cotton Heritage M2580
    variant_ids: [10779, 10780, 10781, 10782, 10783], // S-2XL in Black
    color: 'Black',
    placement: 'front',
    printfile_id: 1,
    print_area: { width: 1800, height: 2400 }
  },
  {
    name: 'Dream Builder Mug',
    product_id: 19,  // White Glossy Mug 11oz
    variant_ids: [1320], // 11oz
    color: 'White',
    placement: 'default',
    printfile_id: 43,
    print_area: { width: 2700, height: 1050 }
  },
  {
    name: 'Dream Builder Tote',
    product_id: 84,  // All-Over Print Tote Bag
    variant_ids: [4533], // Black handles
    color: 'Black',
    placement: 'default',
    printfile_id: 6,
    print_area: { width: 2550, height: 2475 }
  },
  {
    name: 'Brand Cap',
    product_id: 396, // Distressed Dad Hat
    variant_ids: [10990, 10991], // Black, Navy
    color: 'Black',
    placement: 'embroidery_front',
    printfile_id: 75,
    print_area: { width: 1650, height: 600 }
  }
];

// ─── API Helper ───────────────────────────────────────────────────────
function printfulRequest(method, endpoint, body = null, storeId = DEFAULT_STORE_ID) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.printful.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': storeId
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.code === 200) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${parsed.code}: ${JSON.stringify(parsed.error)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Upload File to Printful ──────────────────────────────────────────
async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`  Uploading ${fileName}...`);

  // Convert local path to public URL on thinkventures.app
  const relativePath = path.relative(
    path.join(__dirname, '..'), filePath
  ).replace(/\\/g, '/');
  const publicUrl = `https://thinkventures.app/${relativePath}`;
  
  console.log(`  Using public URL: ${publicUrl}`);

  const result = await printfulRequest('POST', '/files', {
    type: 'default',
    url: publicUrl
  });

  console.log(`  Uploaded! File ID: ${result.result.id}`);
  return result.result;
}

// ─── Create Product ───────────────────────────────────────────────────
async function createProduct(brandName, fileId, fileUrl, template) {
  const productName = `${brandName} ${template.name}`;
  console.log(`  Creating: ${productName}...`);

  const body = {
    sync_product: {
      name: productName,
      thumbnail: fileUrl
    },
    sync_variants: template.variant_ids.map(variantId => ({
      variant_id: variantId,
      files: [
        {
          type: template.placement,
          id: fileId
        }
      ],
      options: []
    }))
  };

  try {
    const result = await printfulRequest('POST', '/store/products', body);
    console.log(`  Created! Product ID: ${result.result.id}`);
    return result.result;
  } catch (err) {
    console.error(`  FAILED: ${err.message}`);
    return null;
  }
}

// ─── Generate Mockup ──────────────────────────────────────────────────
async function generateMockup(productId, variantId, fileUrl, template) {
  console.log(`  Generating mockup for product ${productId}...`);

  try {
    const body = {
      variant_ids: [variantId],
      files: [
        {
          placement: template.placement,
          image_url: fileUrl,
          position: template.print_area
        }
      ]
    };

    const result = await printfulRequest('POST', 
      `/mockup-generator/create-task/${template.product_id}`, body);
    
    return result.result;
  } catch (err) {
    console.error(`  Mockup generation failed: ${err.message}`);
    return null;
  }
}

// ─── Check Mockup Task Status ─────────────────────────────────────────
async function waitForMockup(taskKey, productId, maxWait = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const result = await printfulRequest('GET', 
        `/mockup-generator/task?task_key=${taskKey}`);
      
      if (result.result.status === 'completed') {
        return result.result.mockups;
      } else if (result.result.status === 'failed') {
        console.error(`  Mockup task failed for product ${productId}`);
        return null;
      }
    } catch (err) {
      // Still processing
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.error(`  Mockup task timed out for product ${productId}`);
  return null;
}

// ─── Download Mockup Image ────────────────────────────────────────────
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(outputPath); });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(outputPath); });
      }
    }).on('error', reject);
  });
}

// ─── Main Pipeline ────────────────────────────────────────────────────
async function runPipeline(logoPath, brandName, storeId) {
  console.log('\n========================================');
  console.log(`THINK! VENTURES MERCH PIPELINE`);
  console.log(`Brand: ${brandName}`);
  console.log(`Logo:  ${logoPath}`);
  console.log(`Store: ${storeId}`);
  console.log('========================================\n');

  if (!API_KEY) {
    console.error('ERROR: PRINTFUL_API_KEY environment variable not set!');
    process.exit(1);
  }

  if (!fs.existsSync(logoPath)) {
    console.error(`ERROR: Logo file not found: ${logoPath}`);
    process.exit(1);
  }

  // Create output directory for mockups
  const outputDir = path.join(__dirname, '..', 'assets', 'images', 'merch', 
    brandName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Step 1: Upload logo
  console.log('STEP 1: Uploading logo to Printful...');
  const uploadedFile = await uploadFile(logoPath);
  const fileId = uploadedFile.id;
  const fileUrl = uploadedFile.preview_url || uploadedFile.url;

  // Step 2: Create products
  console.log('\nSTEP 2: Creating products...');
  const createdProducts = [];

  for (const template of STANDARD_COLLECTION) {
    const product = await createProduct(brandName, fileId, fileUrl, template);
    if (product) {
      createdProducts.push({ product, template });
    }
    // Rate limit - wait 1 second between calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 3: Generate mockups
  console.log('\nSTEP 3: Generating mockups...');
  const mockupTasks = [];

  for (const { product, template } of createdProducts) {
    const task = await generateMockup(
      product.id, 
      template.variant_ids[0], 
      fileUrl, 
      template
    );
    if (task) {
      mockupTasks.push({ task, product, template });
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 4: Wait for and download mockups
  console.log('\nSTEP 4: Downloading mockup images...');
  const mockupResults = [];

  for (const { task, product, template } of mockupTasks) {
    const mockups = await waitForMockup(task.task_key, product.id);
    if (mockups && mockups.length > 0) {
      const mockupUrl = mockups[0].mockup_url || mockups[0].extra[0]?.url;
      if (mockupUrl) {
        const fileName = `${template.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        const outputPath = path.join(outputDir, fileName);
        await downloadImage(mockupUrl, outputPath);
        console.log(`  Saved: ${outputPath}`);
        mockupResults.push({ name: template.name, path: outputPath, url: mockupUrl });
      }
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('PIPELINE COMPLETE!');
  console.log(`Created ${createdProducts.length} products`);
  console.log(`Downloaded ${mockupResults.length} mockup images`);
  console.log(`Mockups saved to: ${outputDir}`);
  console.log('========================================\n');

  return { products: createdProducts, mockups: mockupResults };
}

// ─── CLI Entry Point ──────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node merch-pipeline.js <logo-path> <brand-name> [--store-id=ID]');
  console.log('');
  console.log('Example:');
  console.log('  node merch-pipeline.js ./assets/images/bella-avatar.png "Think! Ventures"');
  console.log('  node merch-pipeline.js ./assets/partners/bfg-logo.png "Brothers Function Group"');
  process.exit(0);
}

const logoPath = path.resolve(args[0]);
const brandName = args[1];
const storeArg = args.find(a => a.startsWith('--store-id='));
const storeId = storeArg ? storeArg.split('=')[1] : DEFAULT_STORE_ID;

runPipeline(logoPath, brandName, storeId).catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
