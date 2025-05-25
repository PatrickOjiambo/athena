import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import type { UIBLOCK } from "@/agent/framework/actions";

const STORAGE_KEY = "tantei_messages";

interface Message {
  blocks: Array<UIBLOCK>;
  id: string;
}

interface TanteiContext {
  currentPrompt: string | null;
  messages: Array<Message>;
  isLoading: boolean;
  setCurrentPrompt: (prompt: string | null) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

const tanteiContext = createContext<TanteiContext>({
  addMessage() { },
  setCurrentPrompt() { },
  messages: [],
  isLoading: false,
  setLoading() { },
  currentPrompt: null,
  clearMessages() { },
});

export function TanteiContextWrapper(props: { children: ReactNode }) {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error loading messages from localStorage:", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <tanteiContext.Provider
      value={{
        addMessage,
        currentPrompt,
        isLoading,
        messages,
        setCurrentPrompt,
        setLoading,
        clearMessages,
      }}
    >
      {props.children}
    </tanteiContext.Provider>
  );
}

export function useTanteiState() {
  const context = useContext(tanteiContext);
  return context;
}
