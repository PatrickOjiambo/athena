
import React from 'react';
import { cn } from '@/lib/utils';

export type MessageType = 'user' | 'ai' | 'system';

interface ChatMessageProps {
  message: string;
  type: MessageType;
  timestamp?: string;
  isLoading?: boolean;
}

const ThinkingIndicator = () => {
  return (
    <div className="flex space-x-1 items-center mt-1 ml-1">
      <div className="w-1.5 h-1.5 bg-okx-purple rounded-full animate-thinking" />
      <div className="w-1.5 h-1.5 bg-okx-purple rounded-full animate-thinking [animation-delay:250ms]" />
      <div className="w-1.5 h-1.5 bg-okx-purple rounded-full animate-thinking [animation-delay:500ms]" />
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, type, timestamp, isLoading }) => {
  return (
    <div className={cn(
      "mb-4 max-w-3xl",
      type === 'user' ? "ml-auto" : "mr-auto",
      type === 'system' ? "w-full mx-auto" : ""
    )}>
      {type === 'system' ? (
        <div className="flex justify-center items-center py-2">
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      ) : (
        <div className={cn(
          type === 'user' ? "chat-bubble-user" : "chat-bubble-ai",
          "relative"
        )}>
          <div className="mb-1">
            <span className="text-xs text-muted-foreground">
              {type === 'user' ? 'You' : 'OKX AI'}
              {timestamp && ` • ${timestamp}`}
            </span>
          </div>
          <div className="prose prose-invert">
            {message}
            {isLoading && <ThinkingIndicator />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
