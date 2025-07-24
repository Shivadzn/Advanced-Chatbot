
import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  isListening: boolean;
  onVoiceResult: (transcript: string) => void;
  onListeningChange: (listening: boolean) => void;
}

const VoiceButton = ({ isListening, onVoiceResult, onListeningChange }: VoiceButtonProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      console.error("Speech recognition API not found in window.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Speech recognition started.");
      onListeningChange(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Speech recognition result:", transcript);
      onVoiceResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      if (event.error === "not-allowed" || event.error === "denied") {
        alert("Microphone access was denied. Please allow mic permissions in your browser settings.");
      } else if (event.error === "no-speech") {
        alert("No speech was detected. Please try again.");
      } else {
        alert(`Speech recognition error: ${event.error}`);
      }
      onListeningChange(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      onListeningChange(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      alert("Failed to start speech recognition. See console for details.");
      console.error("Failed to start recognition:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onListeningChange(false);
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      variant="ghost"
      size="sm"
      className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow hover:from-blue-600 hover:to-pink-600 transition-colors flex items-center justify-center`}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceButton;
