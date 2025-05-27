"use client";

import { useState } from "react";
import Tantei from "@/agent/ui/entrypoint";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { BotIcon } from "lucide-react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed  right-5 bottom-5   z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className=" gap-x-2 bg-[var(--primary)] flex flex-row items-center justify-between cursor-pointer  text-[var(--primary-foreground)] rounded-lg p-4 shadow-lg transition-all duration-200 hover:scale-110 animate-bounce-slow border border-[var(--border-color)]"
        >
          <p className="mt-1">Ask athena</p>
          <BotIcon className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-[var(--background)] rounded-lg shadow-xl w-[500px] h-[600px] flex flex-col overflow-hidden animate-slide-up border border-[var(--border-color)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Chat with athena AI
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--muted-foreground)] hover:text-red-800 transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Tantei />
          </div>
        </div>
      )}
    </div>
  );
}
