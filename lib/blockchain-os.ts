interface Node {
  position: number
  data: any
  connections: number[]
  status: "active" | "mining" | "validating" | "inactive"
}

interface Transaction {
  id: string
  from: number
  to: number
  data: string
  status: "pending" | "verified" | "rejected"
  timestamp: number
}

interface Block {
  height: number
  hash: string
  previousHash: string
  timestamp: number
  transactions: Transaction[]
  miner: number
}

export class BlockchainOS {
  private nodes: Map<number, Node>
  private blocks: Block[]
  private transactions: Map<string, Transaction>
  private currentPosition: number
  private blockHeight: number
  private version: string
  private incomingVectors: number
  private outgoingVectors: number

  constructor() {
    this.version = "1.0.4"
    this.currentPosition = 0
    this.blockHeight = 0
    this.nodes = new Map()
    this.blocks = []
    this.transactions = new Map()
    this.incomingVectors = 0
    this.outgoingVectors = 0

    // Initialize blockchain with genesis block
    this.initializeBlockchain()
  }

  private initializeBlockchain() {
    // Create genesis block
    const genesisBlock: Block = {
      height: 0,
      hash: "0000000000000000000000000000000000000000000000000000000000000000",
      previousHash: "",
      timestamp: Date.now(),
      transactions: [],
      miner: 0,
    }

    this.blocks.push(genesisBlock)

    // Create initial nodes
    for (let i = 0; i < 10; i++) {
      this.nodes.set(i, {
        position: i,
        data: {},
        connections: [i > 0 ? i - 1 : 9, i < 9 ? i + 1 : 0], // Connect to adjacent nodes
        status: "active",
      })
    }
  }

  public getWelcomeMessage(): string {
    return `[BlockchainOS v${this.version}] - Linear Topology Network
Position: ${this.currentPosition}
Block Height: ${this.blockHeight}
Vector Flow: ${this.incomingVectors} → ${this.outgoingVectors}
-------------------------------------------
Welcome to BlockchainOS - Linear Topology Network
Type 'help' to see available commands.
-------------------------------------------
[Ready for input] >`
  }

  public getSystemStatus(): string {
    return `[BlockchainOS v${this.version}] - Linear Topology Network
Position: ${this.currentPosition}
Block Height: ${this.blockHeight}
Vector Flow: ${this.incomingVectors} → ${this.outgoingVectors}
-------------------------------------------`
  }

  public processCommand(command: string): string {
    const parts = command.trim().split(/\s+/)
    const mainCommand = parts[0].toLowerCase()

    try {
      switch (mainCommand) {
        case "help":
          return this.getHelp()

        case "node.info":
          const position = Number.parseInt(parts[1])
          return this.getNodeInfo(position)

        case "vector.send":
          const start = Number.parseInt(parts[1])
          const end = Number.parseInt(parts[2])
          const data = parts.slice(3).join(" ")
          return this.sendVector(start, end, data)

        case "topology.map":
          const range = parts[1] ? Number.parseInt(parts[1]) : 10
          return this.getTopologyMap(range)

        case "block.mine":
          return this.mineBlock()

        case "transaction.verify":
          const id = parts[1]
          return this.verifyTransaction(id)

        case "consensus.status":
          return this.getConsensusStatus()

        case "position.change":
          const newPosition = Number.parseInt(parts[1])
          return this.changePosition(newPosition)

        default:
          return `${this.getSystemStatus()}
Error: Command not recognized: ${mainCommand}
Type 'help' to see available commands.
-------------------------------------------
[Ready for input] >`
      }
    } catch (error) {
      return `${this.getSystemStatus()}
Error: ${error instanceof Error ? error.message : "Unknown error occurred"}
-------------------------------------------
[Ready for input] >`
    }
  }

  private getHelp(): string {
    return `${this.getSystemStatus()}
Available Commands:
- help                       Display this help message
- node.info [position]       Display information about a node at a specific position
- vector.send [start] [end] [data]  Send data from one position to another
- topology.map [range]       Visualize the network topology within a specified range
- block.mine                 Mine a new block
- transaction.verify [id]    Verify the status of a transaction
- consensus.status           Check the current consensus state of the network
- position.change [position] Change your current position in the network
-------------------------------------------
[Ready for input] >`
  }

  private getNodeInfo(position: number): string {
    if (isNaN(position)) {
      throw new Error("Invalid position. Please provide a number.")
    }

    const node = this.nodes.get(position)
    if (!node) {
      throw new Error(`No node exists at position ${position}`)
    }

    return `${this.getSystemStatus()}
Node Information:
Position: ${node.position}
Status: ${node.status}
Connections: ${node.connections.join(", ")}
Vector Potential: ${node.connections.length}
-------------------------------------------
[Ready for input] >`
  }

  private sendVector(start: number, end: number, data: string): string {
    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid positions. Please provide numbers for start and end.")
    }

    if (!this.nodes.has(start)) {
      throw new Error(`No node exists at position ${start}`)
    }

    if (!this.nodes.has(end)) {
      throw new Error(`No node exists at position ${end}`)
    }

    if (!data) {
      throw new Error("No data provided for the vector")
    }

    // Create a transaction
    const txId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const transaction: Transaction = {
      id: txId,
      from: start,
      to: end,
      data,
      status: "pending",
      timestamp: Date.now(),
    }

    this.transactions.set(txId, transaction)
    this.outgoingVectors++

    // Simulate vector path
    const path = this.calculatePath(start, end)

    return `${this.getSystemStatus()}
Vector Sent:
Transaction ID: ${txId}
From Position: ${start}
To Position: ${end}
Data: ${data}
Status: Pending
Vector Path: ${path.join(" → ")}
-------------------------------------------
[Ready for input] >`
  }

  private calculatePath(start: number, end: number): number[] {
    const path = [start]
    let current = start

    // In a one-dimensional topology, we move in the direction of the target
    while (current !== end) {
      if (current < end) {
        current = (current + 1) % this.nodes.size
      } else {
        current = (current - 1 + this.nodes.size) % this.nodes.size
      }
      path.push(current)

      // Prevent infinite loops
      if (path.length > this.nodes.size) {
        break
      }
    }

    return path
  }

  private getTopologyMap(range: number): string {
    if (isNaN(range) || range <= 0) {
      throw new Error("Invalid range. Please provide a positive number.")
    }

    // Limit range to prevent excessive output
    const actualRange = Math.min(range, 20)

    let map = `${this.getSystemStatus()}
Network Topology Map (Range: ${actualRange}):

`

    // Create a visual representation of the linear topology
    let line = ""
    for (let i = 0; i < actualRange; i++) {
      const node = this.nodes.get(i)
      if (node) {
        if (i === this.currentPosition) {
          line += "[*]"
        } else {
          line += `[${i}]`
        }

        if (i < actualRange - 1) {
          line += "---"
        }
      }
    }

    map += line + "\n\n"

    // Add node status information
    for (let i = 0; i < actualRange; i++) {
      const node = this.nodes.get(i)
      if (node) {
        map += `Position ${i}: ${node.status.toUpperCase()}\n`
      }
    }

    return (
      map +
      `-------------------------------------------
[Ready for input] >`
    )
  }

  private mineBlock(): string {
    // Set current node to mining
    const currentNode = this.nodes.get(this.currentPosition)
    if (!currentNode) {
      throw new Error(`No node exists at current position ${this.currentPosition}`)
    }

    currentNode.status = "mining"

    // Get pending transactions
    const pendingTransactions: Transaction[] = []
    this.transactions.forEach((tx) => {
      if (tx.status === "pending") {
        pendingTransactions.push(tx)
        tx.status = "verified"
      }
    })

    // Create new block
    const previousBlock = this.blocks[this.blocks.length - 1]
    const newBlock: Block = {
      height: previousBlock.height + 1,
      hash: this.generateHash(previousBlock.hash + JSON.stringify(pendingTransactions)),
      previousHash: previousBlock.hash,
      timestamp: Date.now(),
      transactions: pendingTransactions,
      miner: this.currentPosition,
    }

    this.blocks.push(newBlock)
    this.blockHeight = newBlock.height

    // Reset node status
    currentNode.status = "active"

    return `${this.getSystemStatus()}
Block Successfully Mined:
Height: ${newBlock.height}
Hash: ${newBlock.hash.substring(0, 16)}...
Transactions: ${pendingTransactions.length}
Mining Position: ${this.currentPosition}
Mining Time: ${(Date.now() - previousBlock.timestamp) / 1000} seconds
-------------------------------------------
[Ready for input] >`
  }

  private generateHash(data: string): string {
    // Simple hash function for simulation
    let hash = ""
    const characters = "0123456789abcdef"

    for (let i = 0; i < 64; i++) {
      hash += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return hash
  }

  private verifyTransaction(id: string): string {
    if (!id) {
      throw new Error("Transaction ID is required")
    }

    const transaction = this.transactions.get(id)
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`)
    }

    return `${this.getSystemStatus()}
Transaction Verification:
ID: ${transaction.id}
From Position: ${transaction.from}
To Position: ${transaction.to}
Status: ${transaction.status.toUpperCase()}
Timestamp: ${new Date(transaction.timestamp).toLocaleString()}
Data: ${transaction.data}
-------------------------------------------
[Ready for input] >`
  }

  private getConsensusStatus(): string {
    // Count active nodes
    let activeNodes = 0
    this.nodes.forEach((node) => {
      if (node.status === "active" || node.status === "mining" || node.status === "validating") {
        activeNodes++
      }
    })

    const consensusPercentage = (activeNodes / this.nodes.size) * 100

    return `${this.getSystemStatus()}
Consensus Status:
Active Nodes: ${activeNodes}/${this.nodes.size}
Consensus Percentage: ${consensusPercentage.toFixed(2)}%
Latest Block: ${this.blockHeight}
Latest Block Hash: ${this.blocks[this.blocks.length - 1].hash.substring(0, 16)}...
Network Health: ${consensusPercentage >= 66 ? "HEALTHY" : "AT RISK"}
-------------------------------------------
[Ready for input] >`
  }

  private changePosition(position: number): string {
    if (isNaN(position)) {
      throw new Error("Invalid position. Please provide a number.")
    }

    if (!this.nodes.has(position)) {
      throw new Error(`No node exists at position ${position}`)
    }

    this.currentPosition = position

    return `${this.getSystemStatus()}
Position Changed:
New Position: ${this.currentPosition}
Node Status: ${this.nodes.get(this.currentPosition)?.status.toUpperCase()}
Connected To: ${this.nodes.get(this.currentPosition)?.connections.join(", ")}
-------------------------------------------
[Ready for input] >`
  }
}
