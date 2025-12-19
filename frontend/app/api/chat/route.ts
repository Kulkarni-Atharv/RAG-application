import { berkshireAgent } from '@/lib/mastra/agent';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set max duration for Vercel Function

export async function POST(req: NextRequest) {
    try {
        console.log('API Request received');
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];

        console.log('Calling agent stream with:', lastMessage.content);
        // Generate response using the agent
        const result = await berkshireAgent.stream(lastMessage.content);
        console.log('Agent stream started');

        // Stream appropriate for AI SDK useNext or simple text stream
        // For Vercel AI SDK compatibility, we might need a specific adapter,
        // but for now, let's stream the text from Mastra.

        // Assuming Mastra stream returns an iterable
        const stream = new ReadableStream({
            async start(controller) {
                console.log('Stream controller started');
                try {
                    for await (const chunk of result.textStream) {
                        console.log('Chunk received:', chunk);
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }
                } catch (e) { console.error('Stream error:', e); }
                console.log('Stream finished');
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
