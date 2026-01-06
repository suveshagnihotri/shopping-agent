import csv
import os

def split_csv(input_file, chunk_size=5000):
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    base_name = os.path.splitext(input_file)[0]
    
    with open(input_file, mode='r', encoding='utf-8', newline='') as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)
        
        chunk = []
        file_count = 1
        
        for i, row in enumerate(reader, 1):
            chunk.append(row)
            
            if i % chunk_size == 0:
                output_file = f"{base_name}_part_{file_count}.csv"
                write_chunk(output_file, header, chunk)
                print(f"Created {output_file} with {len(chunk)} records.")
                chunk = []
                file_count += 1
        
        # Write remaining records
        if chunk:
            output_file = f"{base_name}_part_{file_count}.csv"
            write_chunk(output_file, header, chunk)
            print(f"Created {output_file} with {len(chunk)} records.")

def write_chunk(output_file, header, chunk):
    with open(output_file, mode='w', encoding='utf-8', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(header)
        writer.writerows(chunk)

if __name__ == "__main__":
    split_csv('merged_products_all.csv', 5000)
