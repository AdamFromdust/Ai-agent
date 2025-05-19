import express from "express"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import dotenv from "dotenv"
import { exec } from "child_process"
import util from "util"

// Load environment variables
dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

// Convert exec to Promise-based
const execPromise = util.promisify(exec)

// Endpoint to handle OpenAI requests
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    console.log(`Received prompt: ${prompt}`)

    // Generate response from OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      system:
        "You are a helpful terminal assistant. Provide concise, accurate responses that can be used in a terminal environment. If asked to execute commands, provide the exact command to run.",
    })

    console.log(`OpenAI response: ${text}`)

    // Check if the response contains a command to execute
    if (text.includes("```bash") || text.includes("```sh")) {
      const commandMatch = text.match(/```(?:bash|sh)\n([\s\S]*?)\n```/)

      if (commandMatch && commandMatch[1]) {
        const command = commandMatch[1].trim()
        console.log(`Executing command: ${command}`)

        try {
          // Execute the command
          const { stdout, stderr } = await execPromise(command)

          return res.json({
            aiResponse: text,
            executed: true,
            command,
            result: stdout,
            error: stderr || null,
          })
        } catch (execError) {
          return res.json({
            aiResponse: text,
            executed: true,
            command,
            result: null,
            error: execError.message,
          })
        }
      }
    }

    // If no command to execute, just return the response
    return res.json({
      aiResponse: text,
      executed: false,
    })
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ error: "An error occurred while processing your request" })
  }
})

// Simple hello world endpoint
app.get("/", (req, res) => {
  res.send("Hello World! This is your OpenAI terminal agent.")
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log("Use curl to interact with the agent:")
  console.log(
    `curl -X POST http://localhost:${PORT}/ask -H "Content-Type: application/json" -d '{"prompt":"hello world"}'`,
  )
})
