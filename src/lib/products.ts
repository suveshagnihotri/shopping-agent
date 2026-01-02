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
}

let cachedProducts: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
    if (cachedProducts) return cachedProducts;

    try {
        const csvFilePath = path.join(process.cwd(), 'output_2.csv');
        console.log('Loading products from:', csvFilePath);

        if (!fs.existsSync(csvFilePath)) {
            console.error('CSV file not found at:', csvFilePath);
            return [];
        }

        const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });

        cachedProducts = records.map((record: any) => {
            try {
                return {
                    id: record.product_id,
                    name: record.name,
                    description: `${record.brand} ${record.category} for ${record.gender}. ${record.discount_display_label || ''}`,
                    price: parseFloat(record.price) || 0,
                    category: record.category,
                    imageUrl: record.image_url,
                    brand: record.brand,
                    productUrl: record.product_url,
                }
            } catch (e) {
                console.error('Error parsing record:', record, e);
                return null;
            }
        }).filter((p): p is Product => p !== null);

        return cachedProducts || [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
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
