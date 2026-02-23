<div align="center">

# 🛡️ ByzantineMind

### AI Consensus Through Byzantine Fault Tolerance

*When one AI can be tricked, seven AIs voting can't be fooled.*

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?logo=python&logoColor=white)](https://python.org)

</div>

---

## 🧠 What is ByzantineMind?

**ByzantineMind** is a Byzantine Fault Tolerant AI consensus system that prevents any single AI model from being manipulated, hallucinating, or being compromised.

Instead of trusting one LLM, ByzantineMind routes every action through an ensemble of **7 independent AI agents** (Mistral, Groq, Gemini, Cerebras, OpenRouter) and requires a **cryptographic 2f+1 quorum** before any decision is finalized — exactly like how distributed ledgers prevent data corruption.

> **The Problem:** A single LLM can be prompt-injected, hallucinate, or be silently compromised.
>
> **Our Solution:** A PBFT consensus protocol where 7 diverse LLMs independently evaluate every action. Even if **2 agents** are fully compromised (Byzantine faults), the remaining 5 form a quorum and the system stays mathematically safe.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React 18 + TypeScript                     │
│   Landing Page │ Live Dashboard │ Session EXPLAINER Chatbot  │
│   Query Input  │ Vote Breakdown │ Trust Scores │ Faults     │
└────────────────────────┬────────────────────────────────────┘
                         │  WebSocket (live events) + REST API
┌────────────────────────┴────────────────────────────────────┐
│                  FastAPI Gateway (Python)                     │
├──────────────────────────────────────────────────────────────┤
│  ArmorIQ Security Layer                                       │
│  ┌──────────┐  ┌───────────┐  ┌────────┐  ┌───────────────┐ │
│  │ Intent   │→ │ Gatekeeper│→ │ Sentry │→ │   Auditor     │ │
│  │ Engine   │  │ (AuthZ)   │  │ (Drift)│  │ (SQLite)      │ │
│  └──────────┘  └───────────┘  └────────┘  └───────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  PBFT Consensus Engine (3-Phase Protocol)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Pre-Prepare  →  Prepare (2f+1)  →  Commit (2f+1)     │  │
│  │  + View Change on timeout  +  Cryptographic Certs      │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  Heterogeneous Agent Ensemble (7 Independent LLM Nodes)       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐ │
│  │ Mistral│ │ Groq   │ │ Gemini │ │ OR Phi4│ │ Cerebras etc │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  Ed25519 Crypto  │  Fault Injector  │  Dynamic Trust Scores │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys for LLM providers (Mistral, Groq, Gemini, Cerebras, OpenRouter)

### 1. Clone & Setup

```bash
git clone https://github.com/Harsh4r0ra/delhi-hacks.git
cd delhi-hacks

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # Mac/Linux

# Install Python dependencies
pip install -r req.txt
```

### 2. Configure API Keys

```bash
cp .env.example .env
# Edit .env and add your API keys
```

| Variable | Provider | Free Tier? |
|----------|----------|:----------:|
| `MISTRAL_API_KEY` | [Mistral AI](https://console.mistral.ai) | ✅ |
| `GROQ_API_KEY` | [Groq](https://console.groq.com) | ✅ |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) | ✅ |
| `OPENROUTER_API_KEY`| [OpenRouter](https://openrouter.ai/)     | ✅ |
| `CEREBRAS_API_KEY` | [Cerebras](https://cloud.cerebras.ai) | ✅ |

Set `MODE=full` for real LLMs, or `MODE=fast` for instant simulated agents. OpenRouter enables automatic load-balancing and higher diversity (Gemma 2, DeepSeek, Phi-4).

### 3. Start Backend

```bash
# From project root
set PYTHONPATH=.    # Windows (PowerShell: $env:PYTHONPATH=".")
uvicorn backend.main:app --port 8000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Open Dashboard

- **Landing Page:** http://localhost:8080
- **Dashboard:** http://localhost:8080/dashboard
- **API Docs:** http://localhost:8000/docs

---

##  Key Features

| Feature | Description |
|---------|-------------|
| **7-Agent Consensus** | 7 independent LLMs from different providers vote on every action. |
| **PBFT Protocol** | Real 3-phase Byzantine Fault Tolerant consensus with view changes and timeouts. |
| **ArmorIQ Security** | Intent classification, risk assessment, gatekeeper authorization, and drift detection. |
| **Dynamic Trust System**| Agent reputation scores that decay mathematically when they disagree with the established quorum. |
| **AI Explainability**| Download a raw CSV session audit, upload it to the built-in Chatbot, and let Llama 3.3 generate a human-friendly Security Health Report. |
| **Fault Injection** | Live dashboard console to inject Byzantine (lying), Crash, or Collusion faults to test system liveness. |
| **Ed25519 Cryptography** | Every vote is cryptographically signed; certificates are tamper-proof. |

---

## 🧪 BFT Parameters

With 7 nodes, ByzantineMind can tolerate **2 simultaneous bad actors** while guaranteeing mathematically proven consensus.

| Parameter | Value | Meaning |
|-----------|:-----:|---------|
| **n** (nodes) | 7 | Total consensus participants |
| **f** (faults) | 2 | Maximum tolerable Byzantine faults |
| **Quorum** | 5 | Minimum votes needed (2f+1) |
| **Formula** | n = 3f+1 | Classic PBFT safety bound |

---

## 🏆 Built for Delhi Hacks

ByzantineMind was built to solve a fundamental problem in AI safety: **How do you trust an autonomous AI's decision when any single model can be compromised or hallucinate?**

Our answer: **You don't trust one. You make seven vote.**

---

<div align="center">
  <sub>Built with ❤️ by the ByzantineMind team</sub>
</div>