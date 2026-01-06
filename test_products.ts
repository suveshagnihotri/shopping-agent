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
}

test().catch(console.error);
