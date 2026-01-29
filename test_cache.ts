import { getProducts } from './src/lib/products';

async function verifyCache() {
    console.log('--- STARTING CACHE VERIFICATION ---');

    // First call - should be a cache miss
    console.log('\n[TEST 1] Initializing first load...');
    const start1 = Date.now();
    const products1 = await getProducts();
    const duration1 = Date.now() - start1;
    console.log(`[TEST 1] Completed in ${duration1}ms. Found ${products1.length} products.`);

    // Second call - should be a cache hit
    console.log('\n[TEST 2] Verifying cache hit...');
    const start2 = Date.now();
    const products2 = await getProducts();
    const duration2 = Date.now() - start2;
    console.log(`[TEST 2] Completed in ${duration2}ms. Found ${products2.length} products.`);

    if (duration2 < duration1 / 2) {
        console.log('\nSUCCESS: Second call was significantly faster (cache hit).');
    } else {
        console.warn('\nWARNING: Second call duration was not significantly shorter.');
    }

    // Concurrent calls - should handle waiting
    console.log('\n[TEST 3] Testing concurrent calls...');
    const start3 = Date.now();
    const [p3, p4, p5] = await Promise.all([
        getProducts(),
        getProducts(),
        getProducts()
    ]);
    const duration3 = Date.now() - start3;
    console.log(`[TEST 3] Concurrent calls completed in ${duration3}ms.`);
    console.log(`[TEST 3] All calls returned ${p3.length} products.`);

    console.log('\n--- VERIFICATION COMPLETE ---');
}

verifyCache().catch(console.error);
