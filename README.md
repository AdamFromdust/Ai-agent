# OpenAI Terminal Agent

A simple agent that can communicate with OpenAI and execute commands in a terminal environment.

## Setup

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Create a `.env` file based on `.env.example` and add your OpenAI API key
4. Start the server:
   \`\`\`
   node index.js
   \`\`\`

## Usage

### Using curl

Send a request to the agent:

\`\`\`bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Write a hello world script in bash"}'
\`\`\`

### Example Response

\`\`\`json
{
  "aiResponse": "Here's a simple Hello World script in bash:\n\n```bash\necho \"Hello, World!\"\n```\n\nTo run this script, you can either:\n\n1. Copy and paste the command directly into your terminal, or\n2. Save it to a file (e.g., `hello.sh`), make it executable with `chmod +x hello.sh`, and then run it with `./hello.sh`",
  "executed": true,
  "command": "echo \"Hello, World!\"",
  "result": "Hello, World!\n",
  "error": null
}
\`\`\`

## Features

- Send prompts to OpenAI and get responses
- Automatically detect and execute bash commands in the AI's response
- Return both the AI response and the result of any executed commands
