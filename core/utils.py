import re
from typing import Any, Dict

def classify_message(prompt: str) -> str:
    """Always classify as 'conversation' for a conversational chatbot."""
    return "conversation"

def process_response(raw_response: str, response_type: str) -> Dict[str, Any]:
    """Process and format the model's response for conversation only."""
    raw_response = raw_response.strip()
    return {"response": raw_response}
