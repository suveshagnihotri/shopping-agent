import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    brand: string;
    productUrl: string;
    sourceFile?: string;
}

export interface CatalogSummary {
    totalFiles: number;
    totalProducts: number;
    brands: string[];
    files: {
        name: string;
        count: number;
    }[];
}

let cachedProducts: Product[] | null = null;
//Get Base Url
function getBaseUrl(vendor: string): string {
    const v = vendor.toLowerCase();
    if (v.includes('snitch')) return 'https://www.snitch.co.in';
    if (v.includes('fuaark')) return 'https://fuaark.com';
    if (v.includes('techno')) return 'https://www.technosport.in';
    if (v.includes('rare')) return 'https://thehouseofrare.com';
    return '';
}


export async function getProducts(): Promise<Product[]> {
    if (cachedProducts) return cachedProducts;

    try {
        // Search in root and one level deep for CSV files
        const rootDir = process.cwd();
        const files = fs.readdirSync(rootDir)
            .filter(f => f.endsWith('.csv'))
            .map(f => path.join(rootDir, f));

        // Also check rare_rabbit_scraper if it exists
        const scraperDir = path.join(rootDir, 'rare_rabbit_scraper');
        if (fs.existsSync(scraperDir)) {
            const scraperFiles = fs.readdirSync(scraperDir)
                .filter(f => f.endsWith('.csv'))
                .map(f => path.join(scraperDir, f));
            files.push(...scraperFiles);
        }

        if (files.length === 0) {
            console.error('No product CSV files found');
            return [];
        }

        let allProducts: Product[] = [];

        for (const filePath of files) {
            try {
                const fileName = path.basename(filePath);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const records = parse(fileContent, {
                    columns: true,
                    skip_empty_lines: true,
                    relax_column_count: true,
                });

                const products = records.map((record: any) => {
                    try {
                        const baseUrl = getBaseUrl(record.vendor || '');
                        const handle = record.handle || '';
                        const productUrl = baseUrl ? `${baseUrl}/products/${handle}` : handle;

                        const images = (record.product_images || '').split(' | ');
                        const imageUrl = images[0] || '';

                        const options = [record.option1, record.option2, record.option3].filter(Boolean).join(' ');
                        const description = `${record.tags || ''} ${options}`.trim();

                        return {
                            id: record.product_id || record.variant_id || `${fileName}-${record.id || handle}`,
                            name: record.product_title || record.title,
                            description: description,
                            price: parseFloat(record.variant_price || record.price) || 0,
                            category: record.product_type || '',
                            imageUrl: imageUrl,
                            brand: record.vendor || '',
                            productUrl: productUrl,
                            sourceFile: fileName
                        } as Product;
                    } catch (e) {
                        return null;
                    }
                }).filter((p): p is Product => p !== null);

                allProducts = allProducts.concat(products);
                console.log(`Loaded ${products.length} products from ${fileName}`);
            } catch (err) {
                console.error(`Error parsing ${filePath}:`, err);
            }
        }

        // Deduplicate by ID
        const seenIds = new Set<string>();
        cachedProducts = allProducts.filter(p => {
            if (!p.id || seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
        });

        console.log(`Loaded ${cachedProducts.length} unique products from ${files.length} files.`);
        return cachedProducts || [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

export async function getCatalogSummary(): Promise<CatalogSummary> {
    const products = await getProducts();
    const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();

    const fileStats: Record<string, number> = {};
    products.forEach(p => {
        if (p.sourceFile) {
            fileStats[p.sourceFile] = (fileStats[p.sourceFile] || 0) + 1;
        }
    });

    return {
        totalFiles: Object.keys(fileStats).length,
        totalProducts: products.length,
        brands,
        files: Object.entries(fileStats).map(([name, count]) => ({ name, count }))
    };
}

export async function searchProducts(query: string): Promise<Product[]> {
    const products = await getProducts();

    // Clean and split the query into keywords
    const keywords = query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2); // Filter out very short words like "a", "to", "me"

    if (keywords.length === 0) {
        // Fallback for very short queries
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return [];
        return products
            .filter((product) =>
                product.name.toLowerCase().includes(lowerQuery) ||
                product.brand.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 10);
    }

    const allMatch = products.filter((product) => {
        const productText = `${product.name} ${product.description} ${product.category} ${product.brand}`.toLowerCase();
        return keywords.every(keyword => productText.includes(keyword));
    });

    if (allMatch.length > 0) {
        return allMatch.slice(0, 10);
    }

    // Fallback: Check if ANY keywords are present (scoring by match count)
    const results = products
        .map(product => {
            const productText = `${product.name} ${product.description} ${product.category} ${product.brand}`.toLowerCase();
            const matchCount = keywords.filter(keyword => productText.includes(keyword)).length;
            return { product, matchCount };
        })
        .filter(item => item.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .map(item => item.product);

    // Remove duplicates (by ID)
    const uniqueResults: Product[] = [];
    const seenIds = new Set<string>();

    for (const product of (allMatch.length > 0 ? allMatch : results)) {
        if (!seenIds.has(product.id)) {
            seenIds.add(product.id);
            uniqueResults.push(product);
        }
        if (uniqueResults.length >= 10) break;
    }

    return uniqueResults;
}

export async function getProductById(id: string): Promise<Product | undefined> {
    const products = await getProducts();
    return products.find((p) => p.id === id);
}
