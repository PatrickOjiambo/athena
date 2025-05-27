
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <Input
        placeholder="Ask about your portfolio or DeFi strategies..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-white/5 border-white/10 focus-visible:ring-okx-purple"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={isLoading || !message.trim()}
        className="bg-okx-purple hover:bg-okx-purple/80 cursor-pointer text-white"
      >
        Send
      </Button>
    </form>
  );
};

export default ChatInput;
