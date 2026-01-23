import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const rootDir = process.cwd();
        const files = fs.readdirSync(rootDir)
            .filter(file => file.endsWith('.csv'))
            .map(file => {
                const filePath = path.join(rootDir, file);
                const stats = fs.statSync(filePath);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n').filter(line => line.trim()).length;

                return {
                    name: file,
                    size: stats.size,
                    records: lines > 0 ? lines - 1 : 0, // Subtract header
                    lastModified: stats.mtime
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json(files);
    } catch (error) {
        console.error('Error listing CSV files:', error);
        return NextResponse.json({ error: 'Failed to list CSV files' }, { status: 500 });
    }
}
