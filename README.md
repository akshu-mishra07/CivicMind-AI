# CivicMind AI — Community Hero (Hyperlocal Problem Solver)

**🌐 Live Web Client Deployment**: [https://web-psi-seven-17.vercel.app](https://web-psi-seven-17.vercel.app)

CivicMind AI is an award-winning community resolution platform that enables citizens to identify, report, verify, track, and resolve community infrastructure issues (such as potholes, water leakages, streetlight outages, and sanitation concerns) through collaborative peer validation and intelligent multi-agent AI automation.

## 🚀 Key Features

*   **Multimodal Issue Reporting**: Report issues with images, short videos, or voice statements. Integrated speech recognition automatically transcribes voice inputs into description details.
*   **Autonomous Agent Swarm**: Incidents sequentially trigger four specialized Gemini 2.5 Flash agents:
    1.  **Vision Agent**: Analyzes images to auto-classify categories, severities, and material textures.
    2.  **Duplicate Detection Agent**: Runs geospatial checks within a 1km radius to prevent duplicate tickets.
    3.  **Priority Agent**: Dynamic scoring based on live maps coordinates (proximity to schools, hospitals), traffic density, and community upvotes.
    4.  **Planning Agent**: Instantly drafts estimated budgets, personnel lists, and step-by-step repair checklists for crew deployment.
*   **Community Peer Verification**: Neighbors witness and verify issues locally, boosting priority scores.
*   **Gamification & Leaderboard**: Earn reputation points (+10 pts for reporting, +5 pts for verifying, +25 pts on resolution) to level up (Bronze, Silver, Gold, Platinum) and unlock badge achievements.

---

## 🛠️ Tech Stack & Monorepo Architecture

The project is structured as a TypeScript monorepo using npm workspaces:

```
├── apps/
│   ├── web/        # Next.js 16 (App Router) Client Dashboard
│   └── server/     # Express.js API Server with MongoDB & Gemini SDK
├── packages/
│   └── shared/     # Shared constants, types, and schema validations
```

*   **Frontend**: Next.js 16, React Query, Zustand, Lucide Icons, HSL light institutional design system variables.
*   **Backend**: Node.js, Express.js, Mongoose (MongoDB geospatial 2dsphere indexes).
*   **AI Swarm**: Google Gemini 2.5 Flash SDK (`@google/genai`).
*   **Authentication**: Firebase Web SDK & Firebase Admin SDK.

---

## ⚡ Quick Start

### 1. Prerequisite Installations
*   Node.js (>=20.0.0)
*   MongoDB Instance (Atlas or Local)
*   Firebase Project Credentials

### 2. Environment Setup
Copy the example environment file in the root directory:
```bash
cp .env.example .env
```
Fill in the database connections, Firebase API keys, Google Maps keys, and your `GEMINI_API_KEY`.

### 3. Install Dependencies
Run the workspace-wide dependency installer from the root directory:
```bash
npm install
```

### 4. Running the Project Locally
Start both the Next.js frontend dev server and the Express backend API server concurrently:
```bash
npm run dev
```
*   **Frontend client**: http://localhost:3000
*   **Backend API**: http://localhost:5000

### 5. Production Compilation
Verify all packages compile cleanly:
```bash
npm run build
```

---

## 🤖 Swarm Architecture Flow

```
[Citizen Upload] ──> [Vision Agent] ──> [Duplicate Agent] ──> [Priority Agent] ──> [Planning Agent] ──> [Officer Dashboard]
```

Built with ❤️ for the **Google Hackathon 2026 — Community Hero Challenge**.
