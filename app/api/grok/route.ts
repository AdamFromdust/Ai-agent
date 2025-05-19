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
    const stream = streamText({
      model: xai("grok-3-beta"),
      prompt: prompt,
      system: "You are a helpful AI assistant powered by Grok. Provide accurate and helpful responses.",
    })

    // Return the streaming response
    const response = new Response(
      new ReadableStream({
        async start(controller) {
          // Handle each chunk of the stream
          stream.onTextChunk((chunk) => {
            controller.enqueue(new TextEncoder().encode(JSON.stringify({ text: chunk }) + "\n"))
          })

          // Handle the end of the stream
          stream.onFinal(() => {
            controller.close()
          })

          // Handle any errors
          stream.onError((error) => {
            console.error("Stream error:", error)
            controller.error(error)
          })
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    )

    return response
  } catch (error) {
    console.error("Error processing Grok request:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    )
  }
}
