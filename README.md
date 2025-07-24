# LangChain Chat Bot (Groq LLM, FastAPI)

A modern, modular application for AI-powered code generation, explanations, and conversational AI. Built with FastAPI, Groq LLMs, LangChain, and a React + TypeScript frontend. Easily deployable via Docker or Hugging Face Spaces.

---

## 🚀 Features
- **Conversational AI**: Natural chat with session-based memory
- **Code Generation**: Generate clean Python code from prompts
- **Explanations**: Step-by-step programming explanations
- **Session Management**: View, clear, and delete chat sessions
- **Voice Input**: Speak to the chatbot using your microphone (Web Speech API)
- **Voice Output**: Bot can read responses aloud, with mute/unmute control
- **UI Controls**: Modern controls for mute/unmute (speaker icon), voice input (mic icon), and session management
- **API Health Check**: Monitor model and server status
- **Modern UI**: Responsive chat interface (React + Tailwind)

---

## 🗂️ Project Structure
```
.
├── app.py                  # FastAPI app entry point
├── api/                    # API endpoints and models
│   ├── endpoints.py
│   └── models.py
├── core/                   # Core logic: LLM, memory, utilities
│   ├── llm.py
│   ├── memory.py
│   └── utils.py
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker container config
├── README.md
├── chatbot.db              # SQLite database for chat/session storage
├── chatbot_demo.mp4        # Demo video file
├── SESSION_MANAGEMENT.md   # Documentation for session management
├── venv/                   # Python virtual environment (local only)
└── ui/                     # Frontend (React + TypeScript, Vite, Tailwind)
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── bun.lockb           # Bun package manager lockfile (if used)
    ├── components.json     # UI component metadata (if used)
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── public/             # Static assets (favicon, robots.txt, etc.)
    ├── src/                # Main frontend source code
    │   ├── App.tsx, App.css, index.css, main.tsx
    │   ├── components/     # React components & UI primitives (ChatMessage, VoiceButton, etc.)
    │   ├── pages/          # Main pages (Index, NotFound)
    │   ├── hooks/          # Custom React hooks
    │   ├── lib/            # Utility libraries
    │   └── types/          # TypeScript type definitions
    └── README.md           # Frontend-specific docs
```
- **Backend**: `app.py`, `api/`, `core/` — FastAPI, LangChain, Groq LLM logic
- **Frontend**: `ui/` — Modern React app (Vite, TypeScript, Tailwind)
- **venv/**: Local Python virtual environment (not for production or version control)

> **Note:** Some folders (like `__pycache__/`, `dist/`, `node_modules/`) are omitted for clarity and should be ignored in version control.

> **Voice Features:**
> - Voice input/output requires a supported browser (Chrome or Edge recommended).
> - Mute/unmute and voice input buttons use clear speaker/mic icons for feedback.
> - When starting a new chat, the speaker is always unmuted by default.

---

## 🛠️ API Endpoints
- `POST /generate/` — Generate AI response (conversation, code, explanation, or both)
- `POST /get_history/` — Get conversation history for a session
- `POST /clear_history/` — Clear conversation history for a session
- `GET /sessions/` — List active sessions
- `DELETE /sessions/{session_id}` — Delete a session
- `GET /health` — Health check/status

---

## 🧑‍💻 Example API Usage

**Generate a response:**
```bash
curl -X POST http://localhost:7860/generate/ \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Write a Python function to reverse a string.",
    "response_type": "both"
  }'
```

**Get session history:**
```bash
curl -X POST http://localhost:7860/get_history/ \
  -H 'Content-Type: application/json' \
  -d '{"session_id": "<your-session-id>"}'
```

---

## 🎥 Demo Video (Direct Embed)

<video src="chatbot_demo.mp4" controls width="600"></video>

> Replace `demo.mp4` with your actual video file or URL. Large files may slow down repo cloning; for big demos, consider YouTube or Loom.

---

## ⚙️ Local Development & Setup

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd code_gen_app_with_langchain
   ```
2. **Create and activate a Python virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Set environment variables:**
   - `GROQ_API_KEY` (required)
   - `GROQ_MODEL` (optional, default: `llama2-70b-4096`)
   - `MAX_LENGTH` (optional, default: 512)
   - `TEMPERATURE` (optional, default: 0.2)
   > You can use a `.env` file for local development.
5. **Run the backend:**
   ```bash
   uvicorn app:app --reload --port 7860
   ```
6. **Install frontend dependencies and run the UI:**
   ```bash
   cd ui
   npm install
   npm run dev
   ```
   The frontend will be available at [http://localhost:8080/](http://192.168.31.22:8080/) by default.

---

## 🚀 Deployment

### Hugging Face Spaces
- Push this repo to your Hugging Face Space (choose "Python" SDK)
- Set your secrets in the Space settings:
  - `GROQ_API_KEY` — Your Groq API key
  - `GROQ_MODEL` — (Optional) Model name
- App auto-starts on port 7860 (required by Spaces)
- UI is served at `/` (from the `ui/` folder via FastAPI's StaticFiles)
- Dockerfile is provided and compatible with Spaces

### Docker
```bash
# Build the Docker image
docker build -t langchain-chatbot .

# Run the container (exposes port 7860)
docker run -p 7860:7860 langchain-chatbot
```
- The UI and API will be available at [http://localhost:7860/](http://localhost:7860/)

**Tip:** Add a `.dockerignore` file to avoid copying `venv/`, `__pycache__/`, etc. into the image:
```
venv/
__pycache__/
*.pyc
.env
```

---

## 📦 .gitignore Example
```venv/
__pycache__/
*.pyc
.env
```

---

## 📝 Notes
- Do **not** upload `venv/` or `__pycache__/` to Hugging Face Spaces or version control.
- All code and explanations are generated by Groq LLMs via LangChain.
- For production, consider using persistent storage for session memory.
- The `chatbot.db` file is used for storing chat or session data locally.
- See `SESSION_MANAGEMENT.md` for details on how chat sessions are managed.

---

## 📄 License
MIT 
