import { NextResponse } from "next/server"
import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("Received prompt:", prompt)

    // Create a stream from Grok
    const result = streamText({
      model: xai("grok-3-beta"),
      prompt: prompt,
      system: "You are a helpful AI assistant powered by Grok. Provide accurate and helpful responses.",
    })

    // Return the streaming response
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(new TextEncoder().encode(JSON.stringify({ text: chunk }) + "\n"));
          }
        } catch (error) {
          console.error("Stream iteration error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
      cancel(reason) {
        console.log("Stream cancelled:", reason);
        // You might want to call a method on the AI SDK stream to cancel it if available
        // For example, if result.abortController exists: result.abortController.abort();
      }
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error processing Grok request:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    )
  }
}
