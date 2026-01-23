import { getProducts, searchProducts } from './src/lib/products';

async function test() {
    console.log('Testing getProducts...');
    const products = await getProducts();
    console.log(`Total products loaded: ${products.length}`);
    if (products.length > 0) {
        console.log('First product:', JSON.stringify(products[0], null, 2));
    }

    console.log('\nTesting searchProducts("Navy XXL")...');
    const results = await searchProducts('Navy XXL');
    console.log(`Search results count: ${results.length}`);
    results.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.brand}) - ${p.price}`);
    });

    console.log('\nChecking Bonkers Corner image...');
    const bonkers = products.find(p => p.brand.toLowerCase().includes('bonkers'));
    if (bonkers) console.log('Bonkers Image:', bonkers.imageUrl);

    console.log('\nChecking Almost Gods image...');
    const almost = products.find(p => p.brand.toLowerCase().includes('almost gods'));
    if (almost) console.log('Almost Gods Image:', almost.imageUrl);

    console.log('\nChecking Bewakoof image...');
    const bewakoof = products.find(p => p.brand.toLowerCase().includes('bewakoof'));
    if (bewakoof) console.log('Bewakoof Image:', bewakoof.imageUrl);
}

test().catch(console.error);
