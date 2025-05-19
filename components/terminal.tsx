"use client"

import type React from "react"
import { forwardRef } from "react"

interface TerminalProps {
  history: string[]
  input: string
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent) => void
}

export const Terminal = forwardRef<HTMLDivElement, TerminalProps>(({ history, input, setInput, handleSubmit }, ref) => {
  return (
    <div className="flex flex-col rounded-md border border-green-500 bg-black p-4">
      <div ref={ref} className="mb-4 h-[60vh] overflow-y-auto font-mono text-sm text-green-500">
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line.startsWith("[BlockchainOS") ? (
              <div className="mb-2 font-bold text-green-400">{line}</div>
            ) : line.startsWith("[Ready for input]") ? (
              <div className="mb-1 font-bold text-yellow-400">{line}</div>
            ) : line.includes("Error:") ? (
              <div className="mb-1 text-red-500">{line}</div>
            ) : (
              <div className="mb-1">{line}</div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <div className="mr-2 text-green-500">[Ready for input] &gt;</div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent font-mono text-green-500 outline-none"
          autoFocus
        />
      </form>
    </div>
  )
})

Terminal.displayName = "Terminal"
