# Vantage85

A modern platform built with FastAPI + React + shadcn/ui + Figma MCP integration.

## Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Backend   | Python 3.11+, FastAPI, Uvicorn         |
| Frontend  | React 18, TypeScript, Vite             |
| UI        | shadcn/ui, Tailwind CSS v4             |
| State     | TanStack Query, Zustand                |
| Design    | Figma MCP (`@figma/mcp`)               |
| Database  | Supabase (PostgreSQL)                  |

## Project Structure

```
Vantage85/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Route handlers
│   │   ├── core/               # Config, security
│   │   ├── services/           # Business logic (Figma, etc.)
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── main.py             # FastAPI app entry
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # UI + layout components
│   │   ├── pages/              # Route pages
│   │   ├── services/           # API clients
│   │   ├── store/              # Zustand stores
│   │   └── lib/utils.ts        # cn() helper
│   └── package.json
└── .cursor/mcp.json            # Figma MCP config
```

## Getting Started

### 1. Figma MCP Setup

Add your Figma API key to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp"],
      "env": {
        "FIGMA_API_KEY": "your-token-here"
      }
    }
  }
}
```

Get your token at: https://www.figma.com/developers/api#access-tokens

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in values
uvicorn app.main:app --reload
```

API available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173
