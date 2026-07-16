"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@mediverse/ui";

interface Deck {
  id: string;
  title: string;
  subject: string;
  topicTags: string[];
  cardCount: number;
  aiGenerated: boolean;
}

interface CardSchedule {
  easinessFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: string;
}

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  hint: string | null;
  schedule: CardSchedule | null;
}

const QUALITY_BUTTONS = [
  { label: "Again", quality: 1, className: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" },
  { label: "Hard", quality: 3, className: "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20" },
  { label: "Good", quality: 4, className: "bg-[#5cdbc2]/10 border-[#5cdbc2]/30 text-[#5cdbc2] hover:bg-[#5cdbc2]/20" },
  { label: "Easy", quality: 5, className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" },
];

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [subject, setSubject] = useState("Biology");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loadingDeck, setLoadingDeck] = useState(false);

  async function loadDecks() {
    setLoadingDecks(true);
    try {
      const res = await fetch("/api/flashcards");
      if (res.ok) {
        const data = await res.json();
        setDecks(data.decks || []);
      }
    } finally {
      setLoadingDecks(false);
    }
  }

  useEffect(() => {
    loadDecks();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Enter a topic to generate flashcards for.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, count }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate flashcards");
      }
      const data = await res.json();
      await loadDecks();
      openDeck(data.deck.id);
      setTopic("");
    } catch (err: any) {
      setError(err.message || "Something went wrong generating your deck.");
    } finally {
      setGenerating(false);
    }
  }

  async function openDeck(deckId: string) {
    setLoadingDeck(true);
    setActiveDeckId(deckId);
    setCardIndex(0);
    setRevealed(false);
    try {
      const res = await fetch(`/api/flashcards/${deckId}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } finally {
      setLoadingDeck(false);
    }
  }

  async function rate(quality: number) {
    const card = cards[cardIndex];
    if (!card) return;
    try {
      await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, quality }),
      });
    } catch {
      // Non-fatal — still advance locally even if the review log write fails.
    }
    setRevealed(false);
    setCardIndex((idx) => idx + 1);
  }

  const currentCard = cards[cardIndex];
  const deckFinished = activeDeckId !== null && !loadingDeck && cardIndex >= cards.length && cards.length > 0;

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans pb-20">
      <nav className="border-b border-[#3d4946]/30 bg-[#0f1513]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-white font-bold text-xl tracking-tight">
            Mediverse
          </Link>
          <Link href="/dashboard" className="text-sm text-[#5cdbc2] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Flashcards</h1>
          <p className="text-sm text-[#bccac4] mt-1">
            Generate an AI flashcard deck for any topic, then review it with spaced repetition.
          </p>
        </div>

        {/* Generator form */}
        <Card className="border-[#3d4946] bg-[#171d1b] p-6">
          <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-4 items-end">
            <label className="flex flex-col gap-1 text-xs text-[#86948f]">
              Subject
              <input
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#86948f] md:col-span-2">
              Topic
              <input
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                placeholder="e.g. Cell Membrane"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#86948f]">
              Cards
              <input
                type="number"
                min={1}
                max={25}
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <div className="md:col-span-4">
              <Button type="submit" variant="primary" disabled={generating}>
                {generating ? "Generating…" : "✨ Generate Deck"}
              </Button>
            </div>
          </form>
          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        </Card>

        {/* Active review session */}
        {activeDeckId && (
          <Card className="border-[#3d4946] bg-[#171d1b] p-8">
            {loadingDeck && <p className="text-sm text-[#bccac4]">Loading deck…</p>}

            {!loadingDeck && deckFinished && (
              <div className="text-center space-y-3">
                <p className="text-lg font-bold text-white">🎉 Deck complete!</p>
                <p className="text-sm text-[#bccac4]">You reviewed all {cards.length} cards.</p>
              </div>
            )}

            {!loadingDeck && currentCard && (
              <div className="space-y-6">
                <p className="text-xs text-[#86948f] uppercase tracking-wider">
                  Card {cardIndex + 1} of {cards.length}
                </p>
                <div className="min-h-[120px] flex items-center justify-center text-center p-6 bg-[#0f1513] rounded-xl border border-[#3d4946]">
                  <p className="text-lg text-white font-semibold">{currentCard.front}</p>
                </div>

                {!revealed ? (
                  <Button variant="secondary" onClick={() => setRevealed(true)}>
                    Show Answer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#5cdbc2]/5 border border-[#5cdbc2]/20 rounded-xl text-sm text-[#dee4e0]">
                      {currentCard.back}
                    </div>
                    {currentCard.hint && (
                      <p className="text-xs text-[#86948f] italic">Hint: {currentCard.hint}</p>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      {QUALITY_BUTTONS.map((b) => (
                        <button
                          key={b.label}
                          onClick={() => rate(b.quality)}
                          className={`border rounded-lg py-2 text-xs font-semibold transition-colors ${b.className}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Deck list */}
        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Your Decks</h2>
          {loadingDecks ? (
            <p className="text-sm text-[#bccac4]">Loading…</p>
          ) : decks.length === 0 ? (
            <p className="text-sm text-[#bccac4]">No decks yet — generate your first one above.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {decks.map((deck) => (
                <button key={deck.id} onClick={() => openDeck(deck.id)} className="text-left">
                  <Card className="border-[#3d4946] bg-[#171d1b] hover:border-[#5cdbc2]/40 transition-colors">
                    <p className="font-bold text-white text-sm">{deck.title}</p>
                    <p className="text-xs text-[#86948f] mt-1">
                      {deck.subject} · {deck.cardCount} cards {deck.aiGenerated ? "· AI-generated" : ""}
                    </p>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
