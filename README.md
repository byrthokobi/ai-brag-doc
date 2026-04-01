# AI Brag Document Generator

The **AI Brag Document Generator** is a tool designed to help professionals track, generate, and summarize their work achievements and create polished "brag documents" using AI. The brag document is generated per week and per month basis.

## 🏗 Architecture & Monorepo Strategy

This project is structured as a **monorepo** using [Turborepo](https://turbo.build/repo). This allows us to manage multiple applications and shared packages within a single repository, ensuring consistency across configuration, types, and dependencies while enabling fast, cached builds and task execution.

### Folder Structure

The repository is divided into two main directories: `apps` for the deployable applications, and `packages` for shared code and configurations.

```
ai-brag-doc
├── apps/               # Deployable applications
│   ├── web/            # Next.js frontend application
│   ├── api/            # Backend API service
│   └── worker/         # Background worker for processing AI tasks asynchronously
├── packages/           # Shared libraries and configurations
│   ├── ai/             # Core AI logic and prompt templates
│   ├── config/         # Shared configurations
│   └── types/          # Shared TypeScript definitions used across apps
├── turbo.json          # Turborepo configuration
├── package.json        # Root workspace dependencies
└── docker-compose.yml  # Local development orchestration
```

## 🚀 Getting Started (Necessary Items)

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose (for running dependent services locally)

### Environment Setup

1. Ensure your `.env` file is present in the root. This should contain necessary environment variables (e.g., API keys for the AI service, database connection strings).

### Running Locally

You can use Turborepo to run local development servers across all apps simultaneously or run specific apps individually.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the local Docker containers** (database, redis, etc.):

   ```bash
   docker-compose up -d
   ```

3. **Start development servers (all apps):**
   ```bash
   npx turbo run dev
   ```

## 📦 Packages & Sharing Code

The monorepo structure allows for seamless code sharing:

- **`@repo/types`**: Define your TypeScript interfaces in `packages/types` to share them between the `web`, `api`, and `worker`.
- **`@repo/ai`**: Centralized logic for interacting with LLMs in `packages/ai`, keeping the API and Worker implementations clean.

By using Turborepo's caching, when you make a change in a shared package, only the dependent applications are rebuilt, dramatically improving developer experience and deployment times.
