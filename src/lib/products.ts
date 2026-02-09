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
    occasion?: string;
    season?: string;
    color?: string;
    ageBucket?: string;
    brandStory?: string;
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
let loadingPromise: Promise<Product[]> | null = null;

//Get Base Url
function getBaseUrl(vendor: string): string {
    const v = vendor.toLowerCase();
    if (v.includes('snitch')) return 'https://www.snitch.co.in';
    if (v.includes('fuaark')) return 'https://fuaark.com';
    if (v.includes('techno')) return 'https://www.technosport.in';
    if (v.includes('rare')) return 'https://thehouseofrare.com';
    if (v.includes('bewakoof')) return 'https://www.bewakoof.com';
    if (v.includes('bonkers')) return 'https://www.bonkerscorner.com';
    if (v.includes('almost gods')) return 'https://almostgods.com';
    if (v.includes('07-oct') || v.includes('7-10')) return 'https://7-10.in';
    if (v.includes('cult')) return 'https://cultsport.com';
    if (v.includes('baller')) return 'https://ballerathletik.com';
    if (v.includes('chk')) return 'https://gochk.com';
    if (v.includes('comet')) return 'https://wearcomet.com';
    if (v.includes('gully labs')) return 'https://gullylabs.com';
    if (v.includes('studio') || v.includes('jaywalking')) return 'https://www.jaywalking.in';
    if (v.includes('overlays')) return 'https://overlaysclothing.com';
    if (v.includes('tego')) return 'https://tego.fit';
    return '';
}


export async function getProducts(): Promise<Product[]> {
    if (cachedProducts) {
        console.log(`[CACHE-HIT] Returning ${cachedProducts.length} products from memory`);
        return cachedProducts;
    }

    if (loadingPromise) {
        console.log('[CACHE-PENDING] Waiting for existing load operation...');
        return loadingPromise;
    }

    loadingPromise = (async (): Promise<Product[]> => {
        try {
            console.log('[CACHE-MISS] Loading products from CSV files...');
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
                            let productUrl = handle;
                            if (handle && !handle.startsWith('http')) {
                                productUrl = baseUrl ? `${baseUrl}/products/${handle}` : handle;
                            }

                            const imagesStr = record.images || record.product_images || record.image_url || '';
                            const images = imagesStr.includes(' | ')
                                ? imagesStr.split(' | ')
                                : imagesStr.split(',').map((s: string) => s.trim());
                            let imageUrl = images[0] || '';

                            // Bewakoof images are often just filenames in the CSV
                            if (imageUrl && !imageUrl.startsWith('http') && record.vendor?.toLowerCase().includes('bewakoof')) {
                                imageUrl = `https://images.bewakoof.com/t1080/${imageUrl}`;
                            }

                            const options = [
                                record.variant_option1 || record.option1,
                                record.variant_option2 || record.option2,
                                record.variant_option3 || record.option3
                            ].filter(Boolean).join(' ');

                            const enrichedFields = [
                                record.enriched_occasion,
                                record.enriched_season,
                                record.enriched_age_bucket,
                                record.enriched_brand_story
                            ].filter(Boolean).join(' ');

                            const description = `${record.tags || ''} ${options} ${enrichedFields}`.trim();

                            return {
                                id: record.product_id || record.variant_id || `${fileName}-${record.id || handle}`,
                                name: record.product_title || record.title,
                                description: description,
                                price: parseFloat(record.variant_price || record.price) || 0,
                                category: record.product_type || '',
                                imageUrl: imageUrl,
                                brand: record.vendor || '',
                                productUrl: productUrl,
                                sourceFile: fileName,
                                occasion: record.enriched_occasion,
                                season: record.enriched_season,
                                color: record.enriched_color,
                                ageBucket: record.enriched_age_bucket,
                                brandStory: record.enriched_brand_story
                            } as Product;
                        } catch (e) {
                            return null;
                        }
                    }).filter((p: any): p is Product => p !== null);

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

            console.log(`[CACHE-COMPLETE] Successfully loaded ${cachedProducts.length} unique products from ${files.length} files.`);
            return cachedProducts;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        } finally {
            loadingPromise = null; // Reset promise after completion or error
        }
    })();

    return loadingPromise;
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
    const startTime = performance.now();
    const products = await getProducts();

    // List of common colors to detect in queries
    const commonColors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'grey', 'gray', 'brown', 'beige', 'navy', 'olive', 'maroon'];

    // Normalize utility
    const normalize = (text: string) => text
        .toLowerCase()
        .replace(/-/g, ' ') // Replace hyphens with spaces
        .replace(/[^\w\s]/g, ' ') // Remove other special chars
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();

    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return [];

    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 1);
    const queryColors = queryWords.filter(word => commonColors.includes(word));

    // Supplement keywords with common variations
    const expandedKeywords = queryWords.flatMap(word => {
        if (word === 'tshirt' || word === 'tshirts' || word === 'tee' || word === 'tees') {
            return ['tshirt', 'tshirts', 'tee', 'tees', 't shirt', 't shirts'];
        }
        return [word];
    });

    const isClothingSearch = expandedKeywords.some(kw =>
        ['tshirt', 'tshirts', 'tee', 'tees', 'shirt', 'shirts', 'top', 'tops'].includes(kw)
    );

    const scoreProduct = (product: Product) => {
        const name = normalize(product.name);
        const description = normalize(product.description);
        const color = normalize(product.color || '');
        const category = normalize(product.category);
        const tags = normalize(product.brandStory || ''); // Assuming brandStory or tags might be stored here based on previous map

        let score = 0;
        let matchesAll = true;

        for (const kw of queryWords) {
            const isColorKw = commonColors.includes(kw);
            let kwMatched = false;

            // Variation handling for tshirts
            const checkMatch = (text: string, word: string) => {
                if (['tshirt', 'tshirts', 'tee', 'tees', 't shirt', 't shirts'].includes(word)) {
                    return /\b(tshirt|tshirts|tee|tees|t\s+shirt|t\s+shirts)\b/i.test(text);
                }
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                return regex.test(text);
            };

            // Scoring logic
            if (checkMatch(name, kw)) {
                score += 10; // High priority for name matches
                kwMatched = true;
            }
            if (checkMatch(color, kw)) {
                score += 8; // High priority for explicit color field
                kwMatched = true;
            }
            if (checkMatch(category, kw)) {
                score += 5;
                kwMatched = true;
            }
            if (checkMatch(description, kw)) {
                // Penalize color matches if they are only in the description/tags (often noisy)
                score += isColorKw ? 1 : 3;
                kwMatched = true;
            }

            if (!kwMatched) {
                matchesAll = false;
            }
        }

        // Penalty for color mismatch if colors were specified in query
        if (queryColors.length > 0) {
            const productColorText = `${name} ${color}`.toLowerCase();
            const hasMainColorMatch = queryColors.some(c => new RegExp(`\\b${c}\\b`).test(productColorText));
            if (!hasMainColorMatch) {
                score -= 15; // Heavy penalty if query has color but title/color field doesn't match
            }
        }

        // Boost for category relevance
        if (isClothingSearch && (category.includes('t-shirt') || category.includes('shirt') || category.includes('top'))) {
            score += 2;
        }

        return { score, matchesAll };
    };

    const results = products
        .map(product => {
            const { score, matchesAll } = scoreProduct(product);
            return { product, score, matchesAll };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => {
            // Priority 1: Match all keywords
            if (a.matchesAll && !b.matchesAll) return -1;
            if (!a.matchesAll && b.matchesAll) return 1;
            // Priority 2: Higher score
            return b.score - a.score;
        });

    // Interleave results by brand to ensure diversity
    const brandGroups: Record<string, typeof results> = {};
    for (const item of results) {
        const brand = item.product.brand || 'Unknown';
        if (!brandGroups[brand]) brandGroups[brand] = [];
        brandGroups[brand].push(item);
    }

    const brandNames = Object.keys(brandGroups);
    const uniqueResults: Product[] = [];
    const seenIds = new Set<string>();
    let round = 0;
    let addedInRound = true;

    while (uniqueResults.length < 10 && addedInRound) {
        addedInRound = false;
        for (const brand of brandNames) {
            const group = brandGroups[brand];
            if (round < group.length) {
                const item = group[round];
                if (!seenIds.has(item.product.id)) {
                    seenIds.add(item.product.id);
                    uniqueResults.push(item.product);
                    addedInRound = true;
                }
            }
            if (uniqueResults.length >= 10) break;
        }
        round++;
    }

    const duration = performance.now() - startTime;
    console.log(`[PEEQ-PERF] searchProducts for "${query}" took ${duration.toFixed(2)}ms`);

    return uniqueResults;
}

export async function getProductById(id: string): Promise<Product | undefined> {
    const products = await getProducts();
    return products.find((p) => p.id === id);
}
