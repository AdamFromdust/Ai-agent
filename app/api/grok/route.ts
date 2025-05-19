import { NextResponse } from "next/server"
import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"

// Set a longer timeout for the API route
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Stream response from Grok
    const result = streamText({
      model: xai("grok-3-beta"),
      prompt: prompt,
      system: "You are a helpful AI assistant powered by Grok. Provide accurate and helpful responses.",
    })

    // Return the streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error processing Grok request:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    )
  }
}
