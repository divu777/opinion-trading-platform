# Opinion Trading App

A real-time opinion trading web app built with TypeScript and microservices architecture.


<img width="1470" height="829" alt="Screenshot 2025-09-03 at 11 15 48 PM" src="https://github.com/user-attachments/assets/68b82a69-c229-4494-bf57-2ece48f69f6e" />


## Architecture

```
apps/
├── client/          # Next.js frontend, API server, queues requests
├── engine/          # Processes trades, manages state
└── websocket/       # Real-time market updates
```

## How it works

1. **Client** sends trade request to **Backend**
2. **Backend** pushes request to queue
3. **Engine** processes queue, updates market state
4. **Engine** publishes results back to user by ID
5. **Engine** sends market updates to **WebSocket**
6. **WebSocket** broadcasts to subscribed clients

## Tech Stack

- **Frontend**: Next.js, NextAuth.js
- **Backend**: Bun, TypeScript
- **Queue**: Redis (Docker container)
- **Storage**: In-memory (V1)
- **Deploy**: Docker + CI/CD to DigitalOcean
- **Monorepo**: Turborepo

## Setup

```bash
# Install deps
bun install

# Start all services
bun run dev

# Or with Docker
docker-compose up
```

## Environment Variables

Set up `.env` files in each app directory with:
- NextAuth secrets
- Service URLs
- Ports

## Notes

- V1 uses in-memory storage (no database)
- All data resets on restart
