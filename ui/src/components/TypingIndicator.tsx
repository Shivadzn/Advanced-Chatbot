
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TypingIndicator = () => {
  return (
    <div className="flex gap-4 animate-fade-in">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <Bot className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="max-w-[70%]">
        <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-1">AI is typing...</p>
      </div>
    </div>
  );
};

export default TypingIndicator;
