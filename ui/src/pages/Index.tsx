
import { useState, useRef, useEffect } from "react";
import { Send, Volume2, VolumeX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/ChatMessage";
import VoiceButton from "@/components/VoiceButton";
import TypingIndicator from "@/components/TypingIndicator";
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  message_type?: string; // Added for code_only responses
  code?: string; // Added for code_only responses
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  // Change sessionList to store objects with session_id and chat_name
  const [sessionList, setSessionList] = useState<{ session_id: string; chat_name: string }[]>([]);
  const [historyMessages, setHistoryMessages] = useState<string[]>([]);
  const [historySessionId, setHistorySessionId] = useState<string | null>(null);
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  // Remove codeOnly toggle and related logic

  // Ensure a persistent session_id for the user
  const [sessionId, setSessionId] = useState(() => {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('session_id', id);
    }
    return id;
  });

  // New Chat handler
  const handleNewChat = () => {
    // Stop ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([
      {
        id: "welcome",
        text: "Hi! I'm your AI assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    const newSessionId = uuidv4();
    localStorage.setItem('session_id', newSessionId);
    setSessionId(newSessionId);
    setIsMuted(false);
  };

  // Fetch session list with chat names
  const fetchSessionList = async () => {
    try {
      const res = await fetch("/api/session_names/");
      const data = await res.json();
      setSessionList(data || []);
    } catch (e) {
      setSessionList([]);
    }
  };

  // Fetch history for a session
  const fetchHistory = async (sessionId: string) => {
    try {
      const res = await fetch("/api/get_history/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setHistoryMessages(data.history || []);
      setHistorySessionId(sessionId);
    } catch (e) {
      setHistoryMessages([]);
      setHistorySessionId(sessionId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Stop ongoing speech if muted
  useEffect(() => {
    if (isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  // Preload voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      // TTS warm-up: speak a silent utterance to reduce first-time latency
      try {
        const warmup = new window.SpeechSynthesisUtterance(' ');
        warmup.volume = 0;
        synth.speak(warmup);
      } catch (e) {
        // Ignore errors
      }
      const loadVoices = () => {
        voicesRef.current = synth.getVoices();
        setVoicesLoaded(true);
        setIsInitialized(true);
      };
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = () => {
          loadVoices();
          synth.onvoiceschanged = null; // Remove handler after first run
        };
      }
      loadVoices();
    } else {
      setIsInitialized(true);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Stop ongoing speech synthesis before sending a new message
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    let responseText = "";
    let messageType: string | undefined = undefined;
    let codeText: string | undefined = undefined;
    try {
      const API_BASE_URL = "/api";
      const body: any = {
        prompt: text.trim(),
        session_id: sessionId,
      };
      const res = await fetch(`${API_BASE_URL}/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        responseText = err.detail || "Error: Unable to get response from server.";
      } else {
        const data = await res.json();
        responseText = data.response || "No response.";
        messageType = data.message_type;
        if (data.code) {
          codeText = data.code;
        }
      }
    } catch (e) {
      responseText = "Error: Unable to connect to server.";
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isUser: false,
      timestamp: new Date(),
      message_type: messageType,
      code: codeText,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMessage]);
    setLastSpokenId(assistantMessage.id);
  };

  // Only speak new bot responses, not history
  useEffect(() => {
    if (!isMuted && voicesLoaded && lastSpokenId && isInitialized) {
      const lastMsg = messages.find(m => m.id === lastSpokenId && !m.isUser);
      if (lastMsg) {
        const synth = window.speechSynthesis;
        // Cancel any existing speech first
        synth.cancel();
        
        const voices = voicesRef.current;
        const girlVoice = voices.find(
          voice => voice.name === "Google UK English Female"
        ) || voices[0];
        const utterance = new SpeechSynthesisUtterance(lastMsg.text);
        utterance.voice = girlVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Add event listeners to track speech state
        utterance.onend = () => {
          console.log('Speech ended');
        };
        utterance.onerror = (event) => {
          console.error('Speech error:', event);
        };
        
        synth.speak(utterance);
      }
    }
    // eslint-disable-next-line
  }, [lastSpokenId, isMuted, voicesLoaded, isInitialized]);

  // Comprehensive cleanup speech synthesis on component unmount or page reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      }
    };

    const handlePageHide = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      }
    };

    const handleFocusOut = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };

    // Force cancel any existing speech on mount
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusOut);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusOut);
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setInputValue(transcript);
    handleSendMessage(transcript);
  };

  const forceStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this chat history? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessionList((prev) => prev.filter((s) => s.session_id !== sessionId));
        if (historySessionId === sessionId) {
          setHistorySessionId(null);
          setHistoryMessages([]);
        }
      } else {
        alert("Failed to delete session.");
      }
    } catch (e) {
      alert("Error deleting session.");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* New Chat & History Buttons */}
      <div className="flex justify-end gap-1 px-6 pt-4 items-center">
        <button
          onClick={handleNewChat}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-2 rounded shadow text-sm"
        >
          New Chat
        </button>
        <button
          onClick={() => { setShowHistory(true); fetchSessionList(); }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-2 rounded shadow text-sm"
        >
          History
        </button>
      </div>
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <button onClick={() => { setShowHistory(false); setHistorySessionId(null); setHistoryMessages([]); }} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            {!historySessionId ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {sessionList.length === 0 && <li className="text-gray-500">No history found.</li>}
                {sessionList.map((session) => (
                  <li key={session.session_id} className="flex items-center justify-between gap-2 group">
                    <button
                      onClick={() => fetchHistory(session.session_id)}
                      className="flex-1 text-left px-3 py-2 rounded hover:bg-gray-100 border border-gray-200"
                    >
                      {session.chat_name}
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.session_id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete this chat history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <button onClick={() => setHistorySessionId(null)} className="mb-2 text-blue-600 hover:underline">&larr; Back to sessions</button>
                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded border border-gray-200">
                  {historyMessages.length === 0 && <div className="text-gray-500">No messages found.</div>}
                  {historyMessages.map((msg, idx) => {
                    let isUser = msg.startsWith("Human:");
                    let text = msg.replace(/^Human: |^AI: /, "");
                    return (
                      <div
                        key={idx}
                        className={`mb-2 p-2 rounded-lg flex flex-col ${isUser ? "bg-blue-100 text-right ml-10" : "bg-gray-100 text-left mr-10"}`}
                      >
                        <span className="block text-xs text-gray-500 mb-1">{isUser ? "You" : "Bot"}</span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
              AI Chatbot
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Your intelligent conversation partner</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                forceStopSpeech();
                setIsMuted(m => !m);
              }}
              className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow hover:from-blue-600 hover:to-pink-600 transition-colors flex items-center justify-center"
              title={isMuted ? "Unmute Bot" : "Mute Bot"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            {/* Remove codeOnly toggle and related logic */}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or use voice..."
                className="pr-12 h-12 text-base rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <VoiceButton
                isListening={isListening}
                onVoiceResult={handleVoiceResult}
                onListeningChange={setIsListening}
              />
            </div>
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
