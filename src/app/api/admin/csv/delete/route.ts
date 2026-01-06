import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        // Security check: prevent path traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        if (!filename.endsWith('.csv')) {
            return NextResponse.json({ error: 'Only CSV files can be deleted' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        return NextResponse.json({
            message: 'File deleted successfully',
            filename: filename
        });
    } catch (error) {
        console.error('Error deleting CSV file:', error);
        return NextResponse.json({ error: 'Failed to delete CSV file' }, { status: 500 });
    }
}
