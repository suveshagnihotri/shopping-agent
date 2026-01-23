import json
import csv
import os

def convert_json_to_csv(json_file, csv_file):
    if not os.path.exists(json_file):
        print(f"Error: {json_file} not found.")
        return

    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not data:
        print("Error: JSON file is empty.")
        return

    # Define the fields for the CSV
    # We will flatten the variants, so each variant is a row
    fieldnames = [
        'product_id', 'title', 'handle', 'vendor', 'product_type', 'tags',
        'variant_id', 'variant_title', 'variant_sku', 'variant_price', 
        'variant_compare_at_price', 'variant_available', 'variant_option1', 
        'variant_option2', 'variant_option3', 'images'
    ]

    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for product in data:
            base_product = {
                'product_id': product.get('id'),
                'title': product.get('title'),
                'handle': product.get('handle'),
                'vendor': product.get('vendor'),
                'product_type': product.get('product_type'),
                'tags': ', '.join(product.get('tags', [])),
                'images': ', '.join(product.get('images', []))
            }

            variants = product.get('variants', [])
            if not variants:
                # If no variants, still write the product info
                writer.writerow(base_product)
                continue

            for variant in variants:
                row = base_product.copy()
                row.update({
                    'variant_id': variant.get('id'),
                    'variant_title': variant.get('title'),
                    'variant_sku': variant.get('sku'),
                    'variant_price': variant.get('price'),
                    'variant_compare_at_price': variant.get('compare_at_price'),
                    'variant_available': variant.get('available'),
                    'variant_option1': variant.get('option1'),
                    'variant_option2': variant.get('option2'),
                    'variant_option3': variant.get('option3'),
                })
                writer.writerow(row)

    print(f"Successfully converted {json_file} to {csv_file}")

if __name__ == "__main__":
    json_path = '/Users/suveshagnihotri/Documents/work/data-scrapy/rare_rabbit_scraper/rare_rabbit_products.json'
    csv_path = '/Users/suveshagnihotri/Documents/work/data-scrapy/rare_rabbit_scraper/rare_rabbit_products.csv'
    convert_json_to_csv(json_path, csv_path)
