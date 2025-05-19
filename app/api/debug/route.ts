import { NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function GET() {
  try {
    // Test the Grok integration with a simple request
    const result = await generateText({
      model: xai("grok-3-beta"),
      prompt: "Say hello world",
      system: "You are a helpful assistant.",
    })

    return NextResponse.json({
      status: "success",
      message: "Grok integration is working",
      response: result.text,
    })
  } catch (error) {
    console.error("Error testing Grok integration:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Grok integration test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
