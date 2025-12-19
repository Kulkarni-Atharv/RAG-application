# Berkshire Hathaway RAG Analyst

A sophisticated Retrieval-Augmented Generation (RAG) application designed to analyze decades of Warren Buffett's shareholder letters. This tool serves as an intelligent financial analyst, providing deep insights into Berkshire Hathaway's investment philosophy, business strategies, and historical performance.

## 🚀 Features

-   **Deep Document Understanding**: Indexes and retrieves information from 40+ years of annual shareholder letters (1977-2024).
-   **Intelligent RAG Pipeline**: Uses vector similarity search (OpenAI embeddings + pgvector) to ground answers in source documents.
-   **Persistent Context**: Remembers conversation history to handle follow-up questions and complex analytical tasks.
-   **Streaming Chat Interface**: Modern, responsive Next.js frontend with real-time token streaming.
-   **Robust Ingestion Engine**: Comparison-based chunking and master-worker architecture for efficient PDF processing.

## 🛠️ Tech Stack

-   **Framework**: [Mastra](https://mastra.ai/) (Agent & RAG Orchestration)
-   **Frontend**: Next.js 15, Tailwind CSS, Lucide React
-   **LLM**: OpenAI GPT-4o
-   **Vector Database**: PostgreSQL with `pgvector`
-   **Embeddings**: `text-embedding-3-small`
-   **Tooling**: TypeScript, Zod, PDF-Parse

## 📋 Prerequisites

-   Node.js (v20+)
-   PostgreSQL (with `pgvector` extension enabled)
-   OpenAI API Key

## ⚡ Getting Started

### 1. Repository Setup
```bash
git clone https://github.com/Kulkarni-Atharv/RAG-application.git
cd RAG-application
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# OpenAI API Key for Embeddings and Chat
OPENAI_API_KEY=sk-proj-...

# PostgreSQL Connection String (must support pgvector)
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/postgres
```

### 3. Ingestion (Index the Data)
Download the shareholder letters into the `data/` directory and run the ingestion script.
*Note: This process runs multiple workers to parse and index PDFs efficiently.*

```bash
npx tsx src/mastra/ingest_master.ts
```

### 4. Running the Application

**Start the Backend Agent Server:**
```bash
# In terminal 1
npx mastra dev
```
*Server runs on localhost:4111*

**Start the Frontend Interface:**
```bash
# In terminal 2
cd frontend
npm install
npm run dev
```
*App accessible at http://localhost:3000*

## 🏗️ Project Structure

```
├── data/                  # Source PDF documents
├── src/
│   ├── mastra/
│   │   ├── agents/        # AI Agent definitions & prompts
│   │   ├── tools/         # Reusable tools (Vector Search)
│   │   ├── ingest_master.ts # Ingestion orchestrator
│   │   └── ingest_worker.ts # PDF processor & embedder
├── frontend/              # Next.js Chat Interface
├── .mastra/               # Generated framework artifacts
└── config.env             # Environment configuration
```

## 📄 License

This project is open-source and available under the MIT License.
