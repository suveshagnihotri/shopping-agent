import csv
import os

def merge_csvs(output_file):
    csv_files = [
        'snitch/products.csv',
        'technosport_scraper/technosport_products.csv',
        'rare_rabbit_scraper/rare_rabbit_products.csv',
        'fuaark/products.csv'
    ]

    # Filter out files that don't exist
    existing_files = [f for f in csv_files if os.path.exists(f)]
    
    if not existing_files:
        print("No CSV files found to merge.")
        return

    # Collect all unique fieldnames
    all_fieldnames = set()
    for file in existing_files:
        with open(file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames:
                all_fieldnames.update(reader.fieldnames)
    
    fieldnames = sorted(list(all_fieldnames))

    count = 0
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        for file in existing_files:
            print(f"Reading {file}...")
            with open(file, 'r', encoding='utf-8') as infile:
                reader = csv.DictReader(infile)
                for row in reader:
                    writer.writerow(row)
                    count += 1

    print(f"Successfully merged {count} records into {output_file}")

if __name__ == "__main__":
    output_path = 'merged_products_all.csv'
    merge_csvs(output_path)
