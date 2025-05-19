import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { xai } from '@ai-sdk/xai';

export const maxDuration = 30; // Shorter duration for a simple hello

export async function POST(request: Request) {
  try {
    const prompt = 'Say a friendly and short hello world greeting.';

    console.log('Sending fixed prompt to Grok for hello world.');

    const result = streamText({
      model: xai('grok-3-beta'), // Using the same model as the other endpoint
      prompt: prompt,
      system: 'You are a cheerful AI assistant. Respond with very short greetings.',
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          // We expect a short response, but we'll stream it chunk by chunk as good practice
          for await (const chunk of result.textStream) {
            // For this simple hello, we'll send raw text chunks
            // If a more complex JSON structure was needed, we'd stringify it.
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          console.error('Stream iteration error in grok-hello:', error);
          // Send an error message chunk if something goes wrong during streaming
          const errorMessage = JSON.stringify({ error: 'Error streaming_response' });
          controller.enqueue(new TextEncoder().encode(errorMessage));
        } finally {
          controller.close();
        }
      },
      cancel(reason) {
        console.log('Stream cancelled in grok-hello:', reason);
        // Add cancellation logic if the AI SDK supports it and it's necessary
      }
    });

    return new Response(responseStream, {
      headers: {
        // Changed to text/plain as we are sending raw text chunks
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error processing Grok hello request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
} 