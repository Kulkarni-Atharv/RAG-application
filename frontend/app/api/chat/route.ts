import { berkshireAgent } from '@/lib/mastra/agent';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set max duration for Vercel Function

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];

        // Generate response using the agent
        const result = await berkshireAgent.stream(lastMessage.content);

        // Stream appropriate for AI SDK useNext or simple text stream
        // For Vercel AI SDK compatibility, we might need a specific adapter,
        // but for now, let's stream the text from Mastra.

        // Assuming Mastra stream returns an iterable
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.textStream) {
                    controller.enqueue(new TextEncoder().encode(chunk));
                }
                controller.close();
            },
        });

        return new NextResponse(stream);
    } catch (error) {
        console.error('Agent Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
