<div align="center">

# 🛡️ ByzantineMind

### AI Consensus Through Byzantine Fault Tolerance

*When one AI can be tricked, four AIs voting can't be fooled.*

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?logo=python&logoColor=white)](https://python.org)

</div>

---

## 🧠 What is ByzantineMind?

**ByzantineMind** is a Byzantine Fault Tolerant AI consensus system that prevents any single AI model from being manipulated, hallucinating, or being compromised.

Instead of trusting one LLM, ByzantineMind routes every action through **4 independent AI agents** (Mistral, Groq/Llama, Gemini, Cerebras) and requires a **cryptographic 2f+1 quorum** before any decision is finalized — exactly like how distributed databases prevent data corruption.

> **The Problem:** A single LLM can be prompt-injected, hallucinate, or be silently compromised.
>
> **Our Solution:** A PBFT consensus protocol where 4 diverse LLMs independently evaluate every action. Even if 1 agent is fully compromised (Byzantine fault), the remaining 3 outvote it and the system stays safe.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React 18 + TypeScript                     │
│   Landing Page │ Live Dashboard │ System Overview │ Audit    │
│   Query Input  │ Vote Breakdown │ Fault Injector │ Tabs     │
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
│  Agent Ensemble (4 Independent LLM Nodes)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Mistral  │  │  Groq    │  │  Gemini  │  │  Cerebras   │ │
│  │ Small    │  │ Llama70B │  │  Flash   │  │  Llama 70B  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  Ed25519 Crypto  │  Fault Injector  │  SQLite Audit Trail   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys for at least one LLM provider (Mistral, Groq, Gemini, or Cerebras)

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
| `CEREBRAS_API_KEY` | [Cerebras](https://cloud.cerebras.ai) | ✅ |

Set `MODE=full` for real LLMs, or `MODE=fast` for instant simulated agents.

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

## 🎮 Automated Demo

Run the automated demo script to see all scenarios:

```bash
python demo/run_demo.py
```

This fires 5 predefined scenarios + a Byzantine fault injection attack, showing:
- ✅ Safe operations being APPROVED
- 🛑 Dangerous operations being REJECTED
- ⚡ A compromised agent being outvoted by the healthy quorum
- 📜 Full audit trail with cryptographic certificates

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Model Consensus** | 4 independent LLMs from different providers vote on every action |
| **PBFT Protocol** | Real 3-phase Byzantine Fault Tolerant consensus with cryptographic certificates |
| **ArmorIQ Security** | Intent classification, risk assessment, gatekeeper authorization, and drift detection |
| **Fault Injection** | Live demo of Byzantine, Crash, Omission, Timing, and Collusion faults |
| **Ed25519 Cryptography** | Every vote is cryptographically signed; certificates are tamper-proof |
| **SQLite Audit Trail** | Every decision is permanently logged with full forensic detail |
| **Real-Time Dashboard** | WebSocket-powered live visualization of consensus rounds |
| **Dual Mode** | `fast` mode for instant demos, `full` mode for real LLM inference |

---

## 🧪 BFT Parameters

| Parameter | Value | Meaning |
|-----------|:-----:|---------|
| **n** (nodes) | 4 | Total consensus participants |
| **f** (faults) | 1 | Maximum tolerable Byzantine faults |
| **Quorum** | 3 | Minimum votes needed (2f+1) |
| **Formula** | n = 3f+1 | Classic PBFT safety bound |

---

## 📁 Project Structure

```
delhi-hacks/
├── backend/
│   ├── agents/           # LLM agent implementations (Mistral, Groq, Gemini, Cerebras)
│   ├── api/              # FastAPI routes + WebSocket
│   ├── armoriq/          # Intent engine, gatekeeper, sentry, auditor, registry
│   ├── consensus/        # PBFT engine, messages, certificates
│   ├── crypto/           # Ed25519 identity + signing
│   └── faults/           # Fault injector (Byzantine, Crash, Omission, etc.)
├── frontend/
│   ├── src/components/   # Dashboard + Landing page components
│   ├── src/hooks/        # useByzantineMind (WebSocket + REST)
│   ├── src/lib/          # API client + types
│   └── src/pages/        # Index, Dashboard, NotFound
├── demo/
│   └── run_demo.py       # Automated demonstration script
├── .env.example          # API key template
└── req.txt               # Python dependencies
```

---

## 🏆 Built for Delhi Hacks

ByzantineMind was built to solve a fundamental problem in AI safety: **How do you trust an AI's decision when any single model can be compromised?**

Our answer: **You don't trust one. You make four vote.**

---

<div align="center">
  <sub>Built with ❤️ by the ByzantineMind team</sub>
</div>