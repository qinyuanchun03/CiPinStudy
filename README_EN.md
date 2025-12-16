# 📰 Xinhua Insight (新华洞察) v1.0

> **Decoding the "Baguwen" (Bureaucratic Formalism) | 读懂字里行间的焦虑**

[![Chinese](https://img.shields.io/badge/docs-中文版-red.svg)](README.md)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Tech](https://img.shields.io/badge/stack-React_19_·_Vite_·_Tailwind-38bdf8)
![Privacy](https://img.shields.io/badge/privacy-Local_Storage_Only-green)

**Xinhua Insight** is a client-side news intelligence dashboard designed to strip away the "positive energy" adjectives from official reports and reveal the underlying logic of policy, economy, and social control.

It combines real-time data crawling with Large Language Models (LLM) to act as your **"Deep Logic Decoder"**.

---

## 🛠 Technical Architecture & Crawling Logic

This project uses a **Client-Side Only** architecture. All data fetching, cleaning, storage, and analysis happen exclusively in your browser.

### 1. 🔍 The Crawler
Due to browser Same-Origin Policy (SOP), direct access to news sites is blocked. We use the following strategy:
*   **Target**: `https://m.news.cn/` (Mobile version, cleaner structure).
*   **Proxy**: Uses `AllOrigins` or similar public CORS proxies to bypass restrictions.
*   **Decoding**: Manually handles `ArrayBuffer` with `TextDecoder('utf-8')` to prevent encoding issues.

### 2. 🧹 Parsing
*   **DOM Parsing**: Uses the browser's native `DOMParser`.
*   **Selectors**: Targets `.headline`, `.swiper-slide`, and `.list li`.
*   **Date Extraction**: Extracts dates directly from the URL structure (e.g., `/2024-03/15/`) rather than relying on inconsistent on-page text.

### 3. 📊 Local NLP
*   **Tokenization**: Front-end based simple segmentation (N-gram).
*   **Stop Words**: Automatically removes bureaucratic filler words (e.g., "Strengthen", "Promote", "Important") to isolate high-value nouns (e.g., "Security", "Risk", "Struggle").

---

## ✨ Key Features

### 🤖 Multi-Perspective AI Decoding
We don't just summarize; we **interpret** through distinct personas:

| Persona | Role & Focus |
|---------|--------------|
| 🗣️ **Plain Spoken (Recommended)** | **The Truth-Teller.** Translates "Fiscal Policy" into "Watch your wallet". Synthesizes politics and economics into simple, actionable advice for the average family. |
| 🏃‍♂️ **Survivalist (Runxue)** | **The Alarmist.** Focuses on physical safety, border controls, supply chain shortages, and "Iron Fist" avoidance. |
| 📉 **Bear Economist** | **The Skeptic.** Looks past GDP growth to see local debt crises, tax enforcement risks, and currency devaluation. |
| 🕵️ **Political Observer** | **The Insider.** Analyzes personnel changes, meetings attended/absent, and ideological signaling (Zhongnanhai Watcher). |

### 🔒 Privacy First
- **Zero Database**: All crawled data and API keys are stored in your browser's `LocalStorage`.
- **BYOK (Bring Your Own Key)**: Connects directly to OpenAI, DeepSeek, or a local Ollama instance running on your machine.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- An API Key (OpenAI, DeepSeek) OR a local Ollama setup.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/xinhua-insight.git
cd xinhua-insight

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will launch at `http://localhost:3000`.

---

## ⚙️ Configuration

Click the **Settings (⚙️)** icon in the top right corner.

### Option A: Cloud Providers (OpenAI / DeepSeek)
1. Select **Provider**: `OpenAI` or `DeepSeek`.
2. Enter your **API Key**.
3. Enter the **Model ID** (e.g., `gpt-4o`, `deepseek-chat`).
4. Click **Test Connection**.

### Option B: Local Privacy (Ollama)
1. Ensure Ollama is running (`ollama serve`).
2. Select **Provider**: `Local Ollama`.
3. Base URL: `http://localhost:11434` (Default).
4. Model ID: `llama3`, `mistral`, or `qwen`.
5. **Note**: You may need to configure Ollama to allow CORS if accessing from a different host.

---

## ⚠️ Disclaimer

This project is for **educational and research purposes only**. The "decoding" provided by the AI is based on prompt engineering logic designed to interpret political rhetoric critically. It does not constitute financial or legal advice.

---

<p align="center">
  Made with ❤️ by the Xinhua Insight Team
</p>
