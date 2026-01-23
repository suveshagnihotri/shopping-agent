import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.name.endsWith('.csv')) {
            return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to root directory
        const filePath = path.join(process.cwd(), file.name);
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({
            message: 'File uploaded successfully',
            filename: file.name
        });
    } catch (error) {
        console.error('Error uploading CSV file:', error);
        return NextResponse.json({ error: 'Failed to upload CSV file' }, { status: 500 });
    }
}
