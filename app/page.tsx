"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { BlockchainOS } from "@/lib/blockchain-os"
import { Terminal } from "@/components/terminal"

export default function Home() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [blockchainOS] = useState(() => new BlockchainOS())
  const terminalRef = useRef<HTMLDivElement>(null)
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Display welcome message on initial load
    const welcomeMessage = blockchainOS.getWelcomeMessage()
    setHistory([welcomeMessage])
  }, [blockchainOS])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user input to history
    setHistory((prev) => [...prev, `[Ready for input] > ${input}`])

    // Process command and get response
    const response = blockchainOS.processCommand(input)

    // Add response to history
    setHistory((prev) => [...prev, response])

    // Clear input
    setInput("")

    // Scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }
    }, 0)

    // Existing code for handling prompt and response
    if (!prompt.trim()) {
      alert("Please enter some text to send to Grok.")
      return
    }

    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/grok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response from Grok")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let responseText = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          try {
            // Try to parse as JSON
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "")
              .map((line) => {
                try {
                  return JSON.parse(line)
                } catch (e) {
                  return null
                }
              })
              .filter(Boolean)

            for (const parsed of lines) {
              if (parsed.text) {
                responseText += parsed.text
                setResponse(responseText)
              }
            }
          } catch (e) {
            // If parsing fails, just append the raw text
            responseText += chunk
            setResponse(responseText)
          }
        }
      } else {
        // Fallback for non-streaming responses
        const data = await res.json()
        setResponse(data.text || "No response received")
      }
    } catch (error) {
      console.error("Error:", error)
      setResponse("Error: Failed to get response from Grok. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl">
        <h1 className="mb-4 text-center text-2xl font-bold text-green-500">BlockchainOS - Linear Topology Network</h1>

        <Terminal ref={terminalRef} history={history} input={input} setInput={setInput} handleSubmit={handleSubmit} />
      </div>
    </main>
  )
}
