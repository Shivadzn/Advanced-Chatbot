import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
MAX_LENGTH = int(os.getenv("MAX_LENGTH", "1024"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.2"))


def create_llm():
    if not GROQ_API_KEY or not GROQ_MODEL:
        raise ValueError("GROQ_API_KEY and GROQ_MODEL must be set in the environment.")
    return ChatGroq(
        model=GROQ_MODEL,
        api_key=GROQ_API_KEY,
        temperature=TEMPERATURE,
        max_tokens=MAX_LENGTH,
    )

llm = None
try:
    if GROQ_API_KEY and GROQ_MODEL:
        llm = create_llm()
    else:
        print("LLM will not be initialized due to missing GROQ_API_KEY or GROQ_MODEL.")
except ValueError as e:
    print(f"❌ Failed to initialize LLM: {e}")
    llm = None 