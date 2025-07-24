from pydantic import BaseModel, Field
from typing import Optional

class PromptRequest(BaseModel):
    prompt: str = Field(..., description="The user's prompt or question")
    session_id: Optional[str] = Field(None, description="Session ID for conversation history")
    response_type: Optional[str] = Field("both", description="Type of response: 'code', 'explanation', 'conversation', or 'both'")
    max_history: Optional[int] = Field(10, description="Maximum number of conversation turns to remember")

class HistoryRequest(BaseModel):
    session_id: str = Field(..., description="Session ID to retrieve or clear history") 