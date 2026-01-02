import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Prompt from '@/models/Prompt';

export async function GET() {
    try {
        await dbConnect();
        const prompts = await Prompt.find({}).sort({ version: -1 });
        return NextResponse.json(prompts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { content } = await req.json();

        const latestPrompt = await Prompt.findOne({}).sort({ version: -1 });
        const nextVersion = latestPrompt ? latestPrompt.version + 1 : 1;

        const newPrompt = new Prompt({
            content,
            version: nextVersion,
            isActive: true,
        });

        await newPrompt.save();
        return NextResponse.json(newPrompt);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 });
    }
}
