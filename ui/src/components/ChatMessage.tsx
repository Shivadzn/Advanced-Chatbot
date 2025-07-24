
import { User, Bot, Clipboard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  message_type?: string; // Add this to support code_only
  code?: string; // Add this to support code_only
}

interface ChatMessageProps {
  message: Message;
}

// Robust plain text renderer: supports bullet/numbered lists and paragraphs
function renderTextEnhanced(text: string) {
  const lines = text.split(/\r?\n/);
  const result: React.ReactNode[] = [];
  let buffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const isBullet = (line: string) => /^\s*-\s+/.test(line);
  const isNumbered = (line: string) => /^\s*\d+\.\s+/.test(line);

  function flushBuffer() {
    if (buffer.length > 0 && listType) {
      if (listType === 'ul') {
        result.push(
          <ul className="list-disc ml-6 my-2">
            {buffer.map((b, i) => <li key={i}>{b.trim().replace(/^\s*-\s+/, '')}</li>)}
          </ul>
        );
      } else if (listType === 'ol') {
        result.push(
          <ol className="list-decimal ml-6 my-2">
            {buffer.map((b, i) => <li key={i}>{b.trim().replace(/^\s*\d+\.\s+/, '')}</li>)}
          </ol>
        );
      }
      buffer = [];
      listType = null;
    }
  }

  lines.forEach((line, idx) => {
    if (isBullet(line)) {
      if (listType !== 'ul') flushBuffer();
      listType = 'ul';
      buffer.push(line);
    } else if (isNumbered(line)) {
      if (listType !== 'ol') flushBuffer();
      listType = 'ol';
      buffer.push(line);
    } else if (line.trim() === '') {
      flushBuffer();
    } else {
      flushBuffer();
      result.push(<p className="mb-2" key={idx}>{line}</p>);
    }
  });
  flushBuffer();
  return result;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div
      className={`flex gap-4 animate-fade-in ${
        message.isUser ? "flex-row-reverse" : "flex-row"
      }`}
      aria-label={message.isUser ? "User message" : "Bot message"}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback
          className={`${
            message.isUser
              ? "bg-gradient-to-r from-green-400 to-blue-500"
              : "bg-gradient-to-r from-purple-400 to-pink-500"
          } text-white`}
        >
          {message.isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`max-w-[70%] ${
          message.isUser ? "text-right" : "text-left"
        }`}
      >
        <div
          className={`inline-block px-4 py-3 rounded-2xl shadow-sm font-normal text-sm ${
            message.isUser
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
          }`}
        >
          {message.text && renderTextEnhanced(message.text)}
          {message.code && (
            <div style={{ marginTop: '1em', position: 'relative' }}>
              <button
                onClick={() => handleCopy(message.code!)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 18,
                  zIndex: 2,
                  background: '#fff',
                  border: '2px solid #222',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#222',
                  opacity: 1,
                  padding: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                }}
                title={copied ? 'Copied!' : 'Copy code'}
                aria-label="Copy code"
              >
                <Clipboard size={8} />
                {copied && (
                  <span style={{ position: 'absolute', top: -28, right: 0, background: '#222', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>Copied!</span>
                )}
              </button>
              <SyntaxHighlighter language="python" style={coy} customStyle={{ margin: 0, background: '#181818', borderRadius: '12px', padding: '1.2em', paddingTop: '2.2em' }}>
                {message.code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
