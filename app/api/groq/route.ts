import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Generate response from Groq
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: prompt,
      system: "You are a helpful AI assistant powered by Groq. Provide concise, accurate, and helpful responses.",
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error processing Groq request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
