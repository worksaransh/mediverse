"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  citedContentIds?: string[];
  flagged?: boolean;
}

export default function AIMentorPage() {
  const router = useRouter();

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "AI-generated: Hello! I am your Mediverse AI Mentor. I can assist with clinical vignettes, NEET PG study strategies, research queries, and latest guidelines. Please let me know how I can guide your learning journey today.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotaCount, setQuotaCount] = useState(0);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll chat window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle message dispatch
  async function handleSendMessage(textToSend: string) {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });

      if (res.status === 429) {
        setQuotaExceeded(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "AI-generated Error: You have exceeded your daily quota of 20 questions. Please try again tomorrow.",
          },
        ]);
        return;
      }

      if (!res.ok) throw new Error("Failed to load mentor response");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          citedContentIds: data.citedContentIds,
          flagged: data.flagged,
        },
      ]);

      // Update quota estimate
      setQuotaCount((prev) => Math.min(20, prev + 1));

    } catch (e) {
      console.error("[Mentor Chat UI] Error:", e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI-generated: I experienced an issue communicating with the service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans flex flex-col">
      {/* Header bar */}
      <header className="bg-[#171d1b] border-b border-[#3d4946]/50 py-4 px-6 sticky top-0 z-40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[#bccac4] hover:text-[#5cdbc2] text-sm font-semibold transition-colors"
          >
            ← Dashboard
          </button>
          <div className="h-4 w-px bg-[#3d4946]" />
          <h1 className="text-md font-bold text-white flex items-center gap-2">
            🤖 AI Clinical Mentor
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping inline-block" />
          </h1>
        </div>

        {/* Quota limit tracker */}
        <div className="text-xs text-[#bccac4] font-medium bg-[#0f1513] px-3 py-1.5 rounded-full border border-[#3d4946]">
          Daily Quota: <span className="text-[#5cdbc2] font-semibold">{quotaCount}/20</span> used
        </div>
      </header>

      {/* Main Chat Pane */}
      <main className="flex-1 w-full max-w-[800px] mx-auto flex flex-col p-4 md:p-6 overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[400px]">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            
            // Format disclaimers with warning alerts
            const isDisclaimer = msg.content.includes("Disclaimer:");
            
            return (
              <div
                key={idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
                data-testid={isUser ? "user-message" : "mentor-message"}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 border text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#172b26] border-[#5cdbc2]/20 text-white"
                      : isDisclaimer
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                        : "bg-[#171d1b] border-[#3d4946] text-[#dee4e0]"
                  } shadow-md`}
                >
                  {/* Safety Warning Header */}
                  {isDisclaimer && (
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-2 uppercase text-xs tracking-wider">
                      <span>⚠</span>
                      <span>Clinical Safety Redirect</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Citations block */}
                  {msg.citedContentIds && msg.citedContentIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#3d4946]/50 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#bccac4] font-medium">Citations:</span>
                      {msg.citedContentIds.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-0.5 bg-[#5cdbc2]/10 border border-[#5cdbc2]/20 text-[#5cdbc2] text-[10px] font-bold rounded uppercase tracking-wider"
                          data-testid={`citation-${id}`}
                        >
                          📄 {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-[#171d1b] border border-[#3d4946] rounded-2xl p-4 flex items-center gap-2 text-sm text-[#bccac4]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#5cdbc2] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#5cdbc2] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#5cdbc2] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Mentor is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Quick Prompts */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleSendMessage("Give me a high-yield study plan for Pharmacology")}
            className="p-3 bg-[#171d1b] hover:bg-[#252b29] border border-[#3d4946] rounded-xl text-left text-xs text-[#bccac4] transition-colors"
          >
            <span className="font-semibold text-white block mb-1">📅 Study Plan</span>
            How do I organize my pharmacology review?
          </button>
          <button
            onClick={() => handleSendMessage("Show me recent research papers on SGLT2 inhibitors")}
            className="p-3 bg-[#171d1b] hover:bg-[#252b29] border border-[#3d4946] rounded-xl text-left text-xs text-[#bccac4] transition-colors"
          >
            <span className="font-semibold text-[#5cdbc2] block mb-1">🔬 Research RAG</span>
            Read clinical trial files in db.
          </button>
          <button
            onClick={() => handleSendMessage("Can you diagnose my sudden chest pain radiating to neck?")}
            className="p-3 bg-[#171d1b] hover:bg-amber-950/10 border border-[#3d4946] hover:border-amber-500/20 rounded-xl text-left text-xs text-[#bccac4] transition-colors"
          >
            <span className="font-semibold text-amber-400 block mb-1">🚨 Safety Check</span>
            Test the clinical safety triage trigger.
          </button>
        </div>

        {/* Input box */}
        <div className="mt-auto bg-[#171d1b] border border-[#3d4946] rounded-2xl p-2.5 flex items-center shadow-lg gap-2">
          <input
            type="text"
            value={input}
            disabled={quotaExceeded || loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
            placeholder={quotaExceeded ? "Quota limit exceeded" : "Ask about clinical trial outcomes, guidelines, or study schedules..."}
            className="flex-1 bg-transparent border-0 outline-none text-white text-sm px-3 placeholder-[#bccac4]/60 disabled:opacity-50"
            id="chat-input"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || quotaExceeded || loading}
            className="px-5 py-2.5 bg-[#0fa891] hover:bg-[#5cdbc2] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-[#0fa891] active:scale-[0.98]"
            id="chat-send-btn"
          >
            Send
          </button>
        </div>

      </main>
    </div>
  );
}
