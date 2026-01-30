import { getProducts, searchProducts } from '../src/lib/products';

async function verifyEnrichment() {
    console.log('--- Verification Started ---');

    const allProducts = await getProducts();
    console.log(`Total products loaded: ${allProducts.length}`);

    // Check for products from one of the new CSVs
    const bonkersProducts = allProducts.filter(p => p.sourceFile === 'bonkers_corner_products_enriched.csv');
    console.log(`Bonkers Corner products: ${bonkersProducts.length}`);

    if (bonkersProducts.length > 0) {
        const enrichedSample = bonkersProducts.find(p => p.occasion || p.season || p.color);
        if (enrichedSample) {
            console.log('Enriched product sample found:');
            console.log(`- ID: ${enrichedSample.id}`);
            console.log(`- Name: ${enrichedSample.name}`);
            console.log(`- Occasion: ${enrichedSample.occasion}`);
            console.log(`- Season: ${enrichedSample.season}`);
            console.log(`- Color: ${enrichedSample.color}`);
            console.log(`- Description (includes enriched): ${enrichedSample.description}`);
        } else {
            console.log('No enriched products found in Bonkers Corner sample.');
        }
    }

    // Test Search
    const searchTerms = ['party', 'winter', 'oversized', 'cotton', 'Multicolor', 'Red Tshirt'];
    for (const term of searchTerms) {
        const results = await searchProducts(term);
        console.log(`Search for "${term}": found ${results.length} products`);
        if (results.length > 0) {
            console.log(`- Top result: ${results[0].name} (${results[0].brand})`);
            if (term === 'Multicolor' || term === 'Red Tshirt') {
                results.slice(0, 5).forEach((r, i) => {
                    const productText = `${r.name} ${r.description} ${r.category} ${r.brand} ${r.occasion || ''} ${r.season || ''} ${r.ageBucket || ''} ${r.brandStory || ''}`.toLowerCase();
                    const keywords = term.toLowerCase().split(/\s+/);
                    const matches = keywords.map(kw => ({ kw, found: productText.includes(kw) }));
                    console.log(`- Result ${i + 1} (${r.name}):`);
                    matches.forEach(m => console.log(`  * Keyword "${m.kw}": ${m.found ? 'FOUND' : 'NOT FOUND'}`));
                    if (term === 'Red Tshirt' && productText.includes('red')) {
                        // Find where 'red' is
                        const index = productText.indexOf('red');
                        const context = productText.substring(Math.max(0, index - 20), Math.min(productText.length, index + 20));
                        console.log(`  * 'red' context: "...${context}..."`);
                    }
                });
            }
        }
    }

    console.log('--- Verification Finished ---');
}

verifyEnrichment().catch(console.error);
