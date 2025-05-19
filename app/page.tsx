"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold">Grok AI Assistant</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div>
              <label htmlFor="prompt" className="text-sm font-medium mb-2 block">
                Your message
              </label>
              <Textarea
                id="prompt"
                placeholder="Ask Grok anything..."
                className="min-h-[120px] resize-y"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {response && (
              <div className="rounded-lg border border-blue-200 p-4 bg-blue-50">
                <h3 className="font-medium mb-2 text-blue-800">Grok's Response:</h3>
                <div className="whitespace-pre-wrap text-gray-700">{response}</div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Ask Grok"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
