import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Section = ({ title, content, isCode = false }) => {
  if (!content) return null;
  return (
    <div style={{
      background: "#f9f9f9",
      border: "1px solid #ddd",
      padding: "1rem",
      borderRadius: "8px",
      marginBottom: "1rem"
    }}>
      <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>{title}</h3>
      {isCode ? (
        <SyntaxHighlighter language="python" style={vscDarkPlus}>
          {content}
        </SyntaxHighlighter>
      ) : (
        <ReactMarkdown>{content}</ReactMarkdown>
      )}
    </div>
  );
};

const StructuredResponse = ({ response }) => {
  if (!response) return null;
  const {
    overview,
    components,
    flow,
    code,
    notes,
    summary,
    explanation,
    response: conversationResponse,
    intent,
    confidence,
    follow_up_questions,
  } = response;
  const isStructured = overview || components || flow || code || notes || summary || explanation;
  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      {isStructured ? (
        <>
          <Section title="🧠 Overview" content={overview || summary || explanation} />
          <Section title="🧩 Key Components" content={components} />
          <Section title="🔁 Flow" content={flow} />
          <Section title="💻 Code" content={code} isCode={true} />
          <Section title="📌 Notes" content={notes} />
        </>
      ) : (
        <Section title="Response" content={conversationResponse} />
      )}
      {/* Optionally show intent, confidence, follow-up questions */}
      {intent && <Section title="Intent" content={intent} />}
      {confidence !== undefined && <Section title="Confidence" content={confidence.toString()} />}
      {follow_up_questions && follow_up_questions.length > 0 && (
        <Section title="Follow-up Questions" content={follow_up_questions.join('\n')} />
      )}
    </div>
  );
};

export default StructuredResponse; 