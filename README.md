# 🔥 HyperStack Pro

Next-generation fullstack framework with AI-powered code generation and real-time sync.

## Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | SolidJS 2.0 + Vite 6 + TypeScript 5.4 |
| **State** | TanStack Store + Nano Stores |
| **Backend** | Hono.js + Bun Runtime |
| **Database** | TursoDB (libSQL) + Drizzle ORM |
| **Auth** | Oslo + Arctic (OAuth 2.0) |
| **Realtime** | PartyKit WebSockets |

## Prerequisites

- **Bun** 1.1.30+ (`curl -fsSL https://bun.sh/install | bash`)
- **TursoDB CLI** (`brew install tursodb/tap/turso`)
- **Node.js** 22+ (for Vite compatibility layer)

## Quick Start

```bash
# 1. Initialize TursoDB (required first!)
turso db create hyperstack-dev --location waw
turso db tokens create hyperstack-dev > .turso-token

# 2. Install dependencies
bun install --frozen-lockfile
cd services && bun install

# 3. Generate Drizzle schemas
bun run db:generate
bun run db:push

# 4. Start development
bun run dev:all
```

**Important:** The dev server requires the TursoDB token to be set. Create `.env.local`:

```env
TURSO_DATABASE_URL=libsql://hyperstack-dev-<your-username>.turso.io
TURSO_AUTH_TOKEN=<token from step 1>
VITE_WS_ENDPOINT=ws://localhost:4567/party
OSLO_SECRET=<generate with: openssl rand -hex 32>
```

## Development URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3333 | 3333 |
| API Gateway | http://localhost:4000 | 4000 |
| WebSocket Server | ws://localhost:4567 | 4567 |
| Drizzle Studio | http://localhost:4983 | 4983 |

## Project Structure

```
hyperstack/
├── apps/
│   ├── web/                 # SolidJS frontend
│   │   ├── src/
│   │   │   ├── routes/      # File-based routing
│   │   │   ├── islands/     # Interactive components
│   │   │   └── stores/      # Nano stores
│   │   └── solid.config.ts
│   └── api/                 # Hono.js backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── middleware/  # Auth, CORS, etc.
│       │   └── db/          # Drizzle schemas
│       └── drizzle.config.ts
├── packages/
│   ├── shared/              # Shared types & utils
│   └── ui/                  # Component library
├── services/
│   └── realtime/            # PartyKit server
└── turbo.json               # Turborepo config
```

## Authentication Setup

This template uses Oslo for authentication with Arctic adapters.

### 1. Configure OAuth Provider

```typescript
// apps/api/src/auth/providers.ts
import { GitHub, Google } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!
);

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  "http://localhost:4000/auth/google/callback"
);
```

### 2. Add environment variables

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. Use auth in frontend

```tsx
import { createAuthClient } from "@hyperstack/auth-client";

const auth = createAuthClient({
  baseUrl: "http://localhost:4000",
});

// In component
const user = auth.useSession();

// Login
auth.signIn("github");
```

## Database

### Schema Definition

```typescript
// apps/api/src/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  authorId: text("author_id").references(() => users.id),
});
```

### Migrations

```bash
# Generate migration
bun run db:generate

# Apply to TursoDB
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

## Real-time (PartyKit)

### Server Setup

```typescript
// services/realtime/src/server.ts
import type { PartyKitServer } from "partykit/server";

export default {
  onConnect(connection, room) {
    connection.send(JSON.stringify({ type: "connected", roomId: room.id }));
  },

  onMessage(message, connection, room) {
    room.broadcast(message, [connection.id]);
  },
} satisfies PartyKitServer;
```

### Client Usage

```tsx
import { usePartySocket } from "partysocket/react";

function Chat() {
  const socket = usePartySocket({
    host: "localhost:4567",
    room: "main",
  });

  socket.send(JSON.stringify({ type: "message", text: "Hello!" }));
}
```

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start frontend only |
| `bun run dev:api` | Start API server |
| `bun run dev:all` | Start everything (turborepo) |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:push` | Push schema to TursoDB |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run build` | Production build |
| `bun run typecheck` | Type checking |
| `bun run test` | Run Vitest |

## Deployment

### Vercel (Frontend)

```bash
cd apps/web
bunx vercel --prod
```

### Fly.io (API)

```bash
cd apps/api
fly launch
fly deploy
```

### PartyKit (Realtime)

```bash
cd services/realtime
npx partykit deploy
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `TURSO_DATABASE_URL` | Yes | TursoDB connection URL |
| `TURSO_AUTH_TOKEN` | Yes | TursoDB auth token |
| `OSLO_SECRET` | Yes | Session encryption key |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth |
| `GOOGLE_CLIENT_ID` | No | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth |
| `VITE_WS_ENDPOINT` | Yes | PartyKit WebSocket URL |

## Troubleshooting

### "TursoDB connection failed"

Make sure you've created the database and token:

```bash
turso db create hyperstack-dev --location waw
turso db tokens create hyperstack-dev
```

### "Drizzle schema mismatch"

```bash
bun run db:generate --force
bun run db:push --force
```

### "PartyKit not connecting"

Check that the realtime service is running:

```bash
cd services/realtime
bun run dev
```

### Reset everything

```bash
turso db destroy hyperstack-dev
rm -rf node_modules apps/*/node_modules .turbo
bun install
turso db create hyperstack-dev --location waw
bun run db:push
```

---

Built with Bun 🥟 | TursoDB ⚡ | SolidJS 💎
