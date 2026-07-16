"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@mediverse/ui";

interface Option {
  key: string;
  text: string;
}

interface QuizQuestion {
  questionOrder: number;
  mcqId: string;
  question: string;
  options: Option[];
  difficulty: number;
}

interface QuizSession {
  id: string;
  title: string;
  mode: string;
  subject: string;
  totalQuestions: number;
}

interface AnswerResult {
  isCorrect: boolean;
  correctOption: string;
  explanation: string;
}

interface SessionResult {
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTakenSeconds: number;
}

export default function QuizGeneratorPage() {
  const [subject, setSubject] = useState("Biology");
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState("practice");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());

  async function startQuiz(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, count, mode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start test");
      }
      const data = await res.json();
      setSession(data.session);
      setQuestions(data.questions || []);
      setQIndex(0);
      setResult(null);
      startTimeRef.current = Date.now();
      questionStartRef.current = Date.now();
    } catch (err: any) {
      setError(err.message || "Something went wrong starting the test.");
    } finally {
      setStarting(false);
    }
  }

  async function submitAnswer() {
    if (!session || !selectedKey) return;
    const q = questions[qIndex];
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${session.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcqId: q.mcqId,
          selectedOption: selectedKey,
          timeTakenMs: Date.now() - questionStartRef.current,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswerResult(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function nextQuestion() {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelectedKey(null);
      setAnswerResult(null);
      questionStartRef.current = Date.now();
      return;
    }

    // Last question — finalize the session.
    if (!session) return;
    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const res = await fetch(`/api/quiz/${session.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeTakenSeconds }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult({
        scorePercent: data.session.scorePercent,
        correctAnswers: data.session.correctAnswers,
        totalQuestions: data.session.totalQuestions,
        timeTakenSeconds: data.session.timeTakenSeconds,
      });
    }
  }

  const currentQuestion = questions[qIndex];

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans pb-20">
      <nav className="border-b border-[#3d4946]/30 bg-[#0f1513]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-white font-bold text-xl tracking-tight">
            Mediverse
          </Link>
          <Link href="/dashboard" className="text-sm text-[#5cdbc2] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Test Generator</h1>
          <p className="text-sm text-[#bccac4] mt-1">
            Generate a scoped test from the question bank for any subject.
          </p>
        </div>

        {!session && !result && (
          <Card className="border-[#3d4946] bg-[#171d1b] p-6">
            <form onSubmit={startQuiz} className="grid gap-4 md:grid-cols-4 items-end">
              <label className="flex flex-col gap-1 text-xs text-[#86948f] md:col-span-2">
                Subject
                <input
                  className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[#86948f]">
                Questions
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[#86948f]">
                Mode
                <select
                  className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="practice">Practice</option>
                  <option value="timed">Timed</option>
                  <option value="mock_exam">Mock Exam</option>
                </select>
              </label>
              <div className="md:col-span-4">
                <Button type="submit" variant="primary" disabled={starting}>
                  {starting ? "Starting…" : "🚀 Start Test"}
                </Button>
              </div>
            </form>
            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          </Card>
        )}

        {session && currentQuestion && !result && (
          <Card className="border-[#3d4946] bg-[#171d1b] p-8 space-y-6">
            <p className="text-xs text-[#86948f] uppercase tracking-wider">
              Question {qIndex + 1} of {questions.length} · {session.subject}
            </p>
            <p className="text-lg font-bold text-white leading-relaxed">{currentQuestion.question}</p>

            <div className="grid gap-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedKey === opt.key;
                const isRevealedCorrect = answerResult && opt.key === answerResult.correctOption;
                const isRevealedWrong = answerResult && isSelected && !answerResult.isCorrect;
                return (
                  <button
                    key={opt.key}
                    disabled={!!answerResult}
                    onClick={() => setSelectedKey(opt.key)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                      isRevealedCorrect
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                        : isRevealedWrong
                          ? "bg-red-500/10 border-red-500/40 text-red-300"
                          : isSelected
                            ? "bg-[#5cdbc2]/10 border-[#5cdbc2]/40 text-white"
                            : "bg-[#0f1513] border-[#3d4946] text-[#dee4e0] hover:border-[#5cdbc2]/30"
                    }`}
                  >
                    <span className="font-bold text-[#5cdbc2] mr-2">{opt.key}.</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {answerResult && (
              <div className="p-4 bg-[#5cdbc2]/5 border border-[#5cdbc2]/10 rounded-xl text-xs text-[#bccac4]">
                <span className="font-bold text-white">
                  {answerResult.isCorrect ? "✅ Correct — " : "❌ Incorrect — "}
                </span>
                {answerResult.explanation}
              </div>
            )}

            <div className="flex justify-end">
              {!answerResult ? (
                <Button variant="primary" disabled={!selectedKey || submitting} onClick={submitAnswer}>
                  {submitting ? "Checking…" : "Submit Answer"}
                </Button>
              ) : (
                <Button variant="primary" onClick={nextQuestion}>
                  {qIndex + 1 < questions.length ? "Next Question →" : "Finish Test"}
                </Button>
              )}
            </div>
          </Card>
        )}

        {result && (
          <Card className="border-[#3d4946] bg-[#171d1b] p-8 text-center space-y-4">
            <p className="text-3xl font-bold text-[#5cdbc2]">{result.scorePercent}%</p>
            <p className="text-sm text-[#bccac4]">
              {result.correctAnswers} / {result.totalQuestions} correct · {result.timeTakenSeconds}s
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSession(null);
                setQuestions([]);
                setResult(null);
              }}
            >
              Start Another Test
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
