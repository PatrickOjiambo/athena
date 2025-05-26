"use client";
import React, { useState, useEffect, useRef } from 'react';
import ChatMessage, { MessageType } from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from './ui/button';

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Welcome to OKX AI Copilot! How can I help you with your DeFi strategies today?',
    type: 'ai',
    timestamp: '12:00 PM'
  }
];

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: getCurrentTime()
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      let aiResponse = '';
      
      if (content.toLowerCase().includes('balance') || content.toLowerCase().includes('portfolio')) {
        aiResponse = "Your portfolio currently holds $2,357.42 across 4 major tokens. Notably, you have a high concentration in memecoins (BONK: ~4.4% of portfolio), which contributes to your high risk score. Would you like recommendations on rebalancing for lower risk?";
      } else if (content.toLowerCase().includes('risk')) {
        aiResponse = "⚠️ Your portfolio has a high risk level (75/100) primarily due to: 1) High memecoin exposure (BONK), 2) Low stablecoin percentage (17.8%). I recommend increasing USDC allocation to at least 30% for safety. Would you like me to prepare a swap to convert some BONK to USDC?";
      } else if (content.toLowerCase().includes('swap') || content.toLowerCase().includes('trade') || content.toLowerCase().includes('sell')) {
        aiResponse = "Based on your portfolio, I can help you swap BONK to USDC to reduce risk. Would you like to swap 50% of your BONK (~$52.11) to USDC? I can show you the estimated price and slippage.";
        setShowTradeModal(true);
      } else {
        aiResponse = "I'm your OKX AI Copilot, designed to help with DeFi strategies on Solana. I can analyze your portfolio, suggest trades, and help execute them. Try asking about your risk level, portfolio balance, or suggestions for optimizing your holdings.";
      }

      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        type: 'ai',
        timestamp: getCurrentTime()
      };

      setMessages((prevMessages) => [...prevMessages, newAiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const [showTradeModal, setShowTradeModal] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] flex-1">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-none"
      >
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id}
            message={msg.content}
            type={msg.type}
            timestamp={msg.timestamp}
          />
        ))}
        {isLoading && (
          <ChatMessage 
            message=""
            type="ai"
            isLoading={true}
          />
        )}
      </div>
      
      <div className="border-t border-white/10 p-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
      
      {showTradeModal && (
        <TradeModal onClose={() => setShowTradeModal(false)} />
      )}
    </div>
  );
};

const TradeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-okx-dark border border-white/10 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Confirm Swap</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="glass-card p-4 mb-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">From</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center">
                  <span className="text-xs font-bold">BONK</span>
                </div>
                <span className="font-semibold">BONK</span>
              </div>
              <div className="text-right">
                <p className="font-medium">7,964,150</p>
                <p className="text-xs text-muted-foreground">~$52.11</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center my-2">
            <div className="w-8 h-8 rounded-full bg-okx-purple/20 flex items-center justify-center">
              <ArrowDown />
            </div>
          </div>

          <div className="glass-card p-4 mb-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">To (estimated)</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-xs font-bold">USDC</span>
                </div>
                <span className="font-semibold">USDC</span>
              </div>
              <div className="text-right">
                <p className="font-medium">51.59</p>
                <p className="text-xs text-muted-foreground">~$51.59</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Rate</span>
              <span>1 BONK ≈ 0.0000065 USDC</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Slippage</span>
              <span>0.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fee</span>
              <span>0.0005 SOL (~$0.05)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="bg-okx-purple hover:bg-okx-purple/80 text-white font-semibold py-6">
            Confirm Swap
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This is a simulated trade for demo purposes only
          </p>
        </div>
      </div>
    </div>
  );
};

import { ArrowDown } from 'lucide-react';

export default ChatContainer;
