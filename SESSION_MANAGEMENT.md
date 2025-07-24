# Session Management System

This document provides a comprehensive overview of the session management system implemented in the AI Chatbot application.

## Overview

The session management system provides persistent conversation storage, session tracking, and memory management for the AI chatbot. It allows users to maintain conversation context across browser sessions and provides tools for managing chat history.

## Architecture

### Database Schema

**ChatMessage Table:**
- `id`: Primary key (auto-increment)
- `session_id`: Foreign key to identify the session
- `sender`: Either "Human" or "AI"
- `content`: The message content
- `timestamp`: When the message was created

**ChatSession Table:**
- `session_id`: Primary key (UUID)
- `chat_name`: Display name for the session (first 40 chars of first message)
- `created_at`: When the session was created
- `last_activity`: Last time the session was used
- `message_count`: Total number of messages in the session

### Memory Management

**In-Memory Storage:**
- Uses LangChain's `ConversationBufferWindowMemory`
- Sessions expire after 1 hour of inactivity
- Automatic cleanup of expired sessions
- Configurable history window (default: 10 messages)

**Persistence:**
- All messages stored in SQLite database
- Session metadata tracked for analytics
- Automatic session activity updates

## Features

### 1. Session Creation and Management

**Automatic Session Creation:**
- New sessions created when user starts chatting
- Session ID generated using UUID
- Chat name automatically set from first message
- Session stored in localStorage for persistence

**Session Continuity:**
- Sessions persist across browser restarts
- Conversation context maintained
- Memory automatically loaded for existing sessions

### 2. Session History

**History Retrieval:**
- View all past conversations
- Search and filter sessions
- Display session metadata (creation time, last activity, message count)

**History Management:**
- Clear individual session history
- Delete entire sessions
- Bulk cleanup of old sessions

### 3. Session Analytics

**Statistics Available:**
- Total number of sessions
- Total number of messages
- Recent sessions (last 24 hours)
- Session activity patterns

**Admin Features:**
- Session cleanup tools
- Analytics dashboard
- Performance monitoring

## API Endpoints

### Core Session Endpoints

**POST /api/generate/**
- Creates or continues a session
- Saves user and AI messages
- Updates session activity
- Returns response with session_id

**POST /api/get_history/**
- Retrieves conversation history for a session
- Returns formatted message list
- Parameters: `session_id`

**POST /api/clear_history/**
- Clears all messages for a session
- Keeps session metadata
- Parameters: `session_id`

### Session Management Endpoints

**GET /api/session_names/**
- Lists all sessions with metadata
- Returns: session_id, chat_name, created_at, last_activity, message_count
- Ordered by last activity (most recent first)

**DELETE /api/sessions/{session_id}**
- Deletes entire session and all messages
- Removes from both memory and database

**GET /api/sessions/**
- Lists active sessions in memory
- Returns count of active sessions

### Analytics Endpoints

**GET /api/session_stats/**
- Returns session statistics
- Total sessions, messages, recent activity
- Useful for admin dashboard

**POST /api/cleanup_sessions/**
- Bulk cleanup of old sessions
- Parameters: `days_old` (default: 30)
- Returns count of deleted sessions

## Frontend Implementation

### Session State Management

**Local Storage:**
- Session ID persisted in localStorage
- Automatic session restoration
- Fallback to new session if not found

**React State:**
- Session list with metadata
- Current session tracking
- History modal state

### User Interface Features

**Session List:**
- Displays all sessions with metadata
- Shows last activity time
- Message count indicators
- Delete session buttons

**History Modal:**
- Browse session history
- View conversation details
- Navigate between sessions
- Delete individual sessions

**Session Management:**
- New chat functionality
- Session cleanup tools
- Statistics display
- Admin controls

## Usage Examples

### Starting a New Chat

```typescript
const handleNewChat = () => {
  const newSessionId = uuidv4();
  localStorage.setItem('session_id', newSessionId);
  setSessionId(newSessionId);
  setMessages([welcomeMessage]);
};
```

### Loading Session History

```typescript
const fetchHistory = async (sessionId: string) => {
  const res = await fetch("/api/get_history/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  const data = await res.json();
  return data.history;
};
```

### Deleting a Session

```typescript
const deleteSession = async (sessionId: string) => {
  const res = await fetch(`/api/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    // Remove from UI
    setSessionList(prev => prev.filter(s => s.session_id !== sessionId));
  }
};
```

## Configuration

### Session Timeout

```python
# In core/memory.py
SESSION_TIMEOUT = 3600  # 1 hour in seconds
```

### Memory Window

```python
# In api/endpoints.py
max_history: Optional[int] = Field(10, description="Maximum number of conversation turns to remember")
```

### Cleanup Settings

```python
# In core/db.py
async def cleanup_old_sessions(days_old=30):
    # Clean up sessions older than specified days
```

## Best Practices

### 1. Session Security

- Session IDs are UUIDs (not predictable)
- No sensitive data stored in session names
- Automatic cleanup prevents data accumulation

### 2. Performance

- In-memory caching for active sessions
- Database queries optimized with indexes
- Lazy loading of session history

### 3. User Experience

- Persistent sessions across browser restarts
- Clear session management interface
- Confirmation dialogs for destructive actions

### 4. Data Management

- Regular cleanup of old sessions
- Session statistics for monitoring
- Backup and recovery procedures

## Troubleshooting

### Common Issues

**Session Not Found:**
- Check if session_id exists in database
- Verify localStorage persistence
- Check for session cleanup

**Memory Issues:**
- Monitor active session count
- Check session timeout settings
- Review memory cleanup logic

**Performance Problems:**
- Optimize database queries
- Implement pagination for large histories
- Monitor session statistics

### Debug Tools

**API Health Check:**
```bash
GET /api/health
```

**Session Statistics:**
```bash
GET /api/session_stats/
```

**Database Inspection:**
```sql
SELECT * FROM chat_sessions ORDER BY last_activity DESC;
SELECT COUNT(*) FROM chat_messages WHERE session_id = 'your-session-id';
```

## Future Enhancements

### Planned Features

1. **Session Export/Import**
   - Export conversations to JSON/PDF
   - Import conversations from files
   - Share sessions between users

2. **Advanced Analytics**
   - Conversation sentiment analysis
   - Usage patterns and trends
   - Performance metrics

3. **Session Templates**
   - Pre-defined conversation starters
   - Session categories and tags
   - Custom session configurations

4. **Multi-User Support**
   - User authentication
   - Session ownership
   - Collaborative sessions

### Technical Improvements

1. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Index improvements

2. **Caching Strategy**
   - Redis integration
   - Distributed session storage
   - Cache invalidation

3. **Monitoring and Alerting**
   - Session health monitoring
   - Performance alerts
   - Usage analytics

## Conclusion

The session management system provides a robust foundation for maintaining conversation context and managing chat history. It balances performance, usability, and data management while providing tools for both users and administrators.

For questions or issues, refer to the API documentation or contact the development team. 