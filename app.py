from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.endpoints import router
import time
import asyncio
from core.db import Base, engine

app = FastAPI(
    title="LangChain Chat Bot (Groq LLM, FastAPI)",
    description="Advanced chatbot API using LangChain and Groq models",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Serve the UI folder at the root
app.mount("/", StaticFiles(directory="ui/dist", html=True), name="ui")

# Add the log_requests middleware to the FastAPI app
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"🔄 {request.method} {request.url.path} → {response.status_code} ({process_time:.2f}s)")
    return response

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# In your startup event:
@app.on_event("startup")
async def on_startup():
    await init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
