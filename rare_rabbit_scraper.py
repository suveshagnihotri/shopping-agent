import requests
import csv
import json
import time

def fetch_rare_rabbit_products(collection_handle):
    base_url = f"https://thehouseofrare.com/collections/{collection_handle}/products.json"
    all_products = []
    page = 1
    
    while True:
        print(f"Fetching page {page}...")
        try:
            response = requests.get(f"{base_url}?page={page}&limit=250")
            response.raise_for_status()
            data = response.json()
            products = data.get('products', [])
            
            if not products:
                break
                
            all_products.extend(products)
            page += 1
            time.sleep(1) # Be nice to the server
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            break
            
    return all_products

def convert_to_csv(products, output_file):
    headers = [
        'brand', 'category', 'discount', 'discount_display_label', 'gender', 
        'image_url', 'images', 'mrp', 'name', 'price', 'primary_colour', 
        'product_id', 'product_url', 'rating', 'rating_count', 'season', 'sizes', 'year'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        
        for p in products:
            variant = p['variants'][0] if p['variants'] else {}
            price = float(variant.get('price', 0))
            mrp = float(variant.get('compare_at_price', price) or price)
            discount = mrp - price
            discount_percent = int((discount / mrp) * 100) if mrp > 0 else 0
            
            # Extract sizes
            sizes = []
            for v in p['variants']:
                if v.get('option1'):
                    sizes.append(v['option1'])
            
            # Extract color (usually option2 in Shopify)
            color = variant.get('option2', '')
            
            row = {
                'brand': p.get('vendor', 'RARE RABBIT'),
                'category': p.get('product_type', ''),
                'discount': int(discount),
                'discount_display_label': f"({discount_percent}% OFF)" if discount_percent > 0 else "",
                'gender': 'Men',
                'image_url': p['images'][0]['src'] if p['images'] else '',
                'images': ",".join([img['src'] for img in p['images']]),
                'mrp': int(mrp),
                'name': p.get('title', ''),
                'price': int(price),
                'primary_colour': color,
                'product_id': p.get('id', ''),
                'product_url': f"https://thehouseofrare.com/products/{p.get('handle', '')}",
                'rating': 0,
                'rating_count': 0,
                'season': 'New Arrival',
                'sizes': ",".join(list(set(sizes))),
                'year': 2026
            }
            writer.writerow(row)

if __name__ == "__main__":
    collection = "rare-rr-men-shirts"
    output = "rare_rabbit_shirts.csv"
    
    print(f"Starting scrape for collection: {collection}")
    products = fetch_rare_rabbit_products(collection)
    print(f"Found {len(products)} products.")
    
    convert_to_csv(products, output)
    print(f"Saved to {output}")
