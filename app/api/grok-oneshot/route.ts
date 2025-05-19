import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { xai } from '@ai-sdk/xai';

export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const prompt = "Tell me a very short, one-sentence fact about space.";

    console.log('Sending one-shot prompt to Grok for a space fact.');

    const result = await generateText({
      model: xai('grok-3-beta'),
      prompt: prompt,
      system: 'You are an AI assistant that provides concise facts.',
    });

    console.log('Received one-shot response from Grok:', result.text);

    return NextResponse.json({
      fact: result.text,
      finishReason: result.finishReason,
      usage: result.usage,
    });

  } catch (error) {
    console.error('Error processing Grok one-shot request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process one-shot request';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
} 