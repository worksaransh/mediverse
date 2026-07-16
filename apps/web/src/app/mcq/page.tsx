"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Option {
  key: string;
  text: string;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: Option[];
  subject: string;
  topicTags: string[];
  difficulty: number;
}

interface AttemptResult {
  isCorrect: boolean;
  correctOption: string;
  explanation: string;
  accuracyEma: number;
  oldEma: number;
  topic: string;
}

interface MasteryChange {
  topic: string;
  oldEma: number;
  newEma: number;
  direction: "improved" | "declined" | "unchanged";
}

export default function MCQPracticePage() {
  const router = useRouter();

  // State Management
  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions] = useState(5); // Set length is 5 questions
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [adaptivityMessage, setAdaptivityMessage] = useState<string | null>(null);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [masteryChanges, setMasteryChanges] = useState<MasteryChange[]>([]);
  const [showExplanation, setShowExplanation] = useState(true);

  // Refs for tracking timer and start timestamps
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Timer runner
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Format timer as mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch the next adaptive MCQ
  async function fetchNextQuestion(excludes: string[]) {
    setLoading(true);
    setSelectedKey(null);
    setAttemptResult(null);
    setAdaptivityMessage(null);
    questionStartTimeRef.current = Date.now();

    try {
      const excludeQuery = excludes.join(",");
      const res = await fetch(`/api/mcq/next?exclude=${excludeQuery}`);
      if (!res.ok) throw new Error("Failed to load next question");
      const data = await res.json();

      if (data.completed) {
        setCompleted(true);
      } else {
        setCurrentQuestion(data.mcq);
        setAdaptivityMessage(data.adaptivityMessage);
      }
    } catch (e) {
      console.error("[MCQ UI] Error loading next MCQ:", e);
    } finally {
      setLoading(false);
    }
  }

  // Initial mount load
  useEffect(() => {
    fetchNextQuestion([]);
  }, []);

  // Handle option submission
  async function handleOptionSelect(key: string) {
    if (selectedKey || !currentQuestion) return; // Prevent double select
    setSelectedKey(key);

    const timeTakenMs = Date.now() - questionStartTimeRef.current;

    try {
      const res = await fetch("/api/mcq/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcqId: currentQuestion.id,
          selectedOption: key,
          timeTakenMs,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit attempt");
      const result: AttemptResult = await res.json();
      setAttemptResult(result);
      setShowExplanation(true);

      // Track changes for summary screen
      const changeDir = result.accuracyEma > result.oldEma 
        ? "improved" 
        : result.accuracyEma < result.oldEma 
          ? "declined" 
          : "unchanged";

      setMasteryChanges((prev) => {
        const idx = prev.findIndex(item => item.topic === result.topic);
        if (idx !== -1) {
          // update existing
          const updated = [...prev];
          updated[idx]!.newEma = result.accuracyEma;
          updated[idx]!.direction = result.accuracyEma > updated[idx]!.oldEma 
            ? "improved" 
            : result.accuracyEma < updated[idx]!.oldEma 
              ? "declined" 
              : "unchanged";
          return updated;
        }
        return [...prev, {
          topic: result.topic,
          oldEma: result.oldEma,
          newEma: result.accuracyEma,
          direction: changeDir as any
        }];
      });

      // Update excluded IDs
      setExcludeIds((prev) => [...prev, currentQuestion.id]);

    } catch (e) {
      console.error("[MCQ UI] Attempt submission failed:", e);
    }
  }

  // Proceed to next question
  function handleNextQuestion() {
    if (questionIndex >= totalQuestions) {
      setCompleted(true);
    } else {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      fetchNextQuestion([...excludeIds]);
    }
  }

  // Finish session
  function handleFinishSession() {
    router.push("/dashboard");
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#171d1b] border border-[#3d4946] rounded-2xl p-8 text-center space-y-6 shadow-xl">
          {/* Pulsing ECG Heartbeat Icon */}
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center w-20 h-20 bg-[#5cdbc2]/10 rounded-full border border-[#5cdbc2]/20 animate-pulse">
              <svg className="w-12 h-12 text-[#5cdbc2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h2.5l2-6 3 12 2-8 1.5 2h4" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white font-headline-md">Session Complete!</h1>
          <p className="text-sm text-[#bccac4]">You completed a set of {excludeIds.length} adaptive practice questions in {formatTime(timer)}.</p>

          <div className="border-t border-[#3d4946]/50 pt-6 space-y-4 text-left">
            <h3 className="text-xs uppercase tracking-widest text-[#86948f] font-semibold mb-2">Mastery Performance Shift</h3>
            
            <div className="space-y-3">
              {masteryChanges.map((change, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-white">{change.topic}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#bccac4] font-mono">
                      {(change.oldEma * 100).toFixed(0)}% → {(change.newEma * 100).toFixed(0)}%
                    </span>
                    {change.direction === "improved" && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-[#5cdbc2] text-[10px] font-bold uppercase rounded border border-emerald-500/20">
                        ▲ Improved
                      </span>
                    )}
                    {change.direction === "declined" && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-[#ffb4ab] text-[10px] font-bold uppercase rounded border border-red-500/20">
                        ▼ Declined
                      </span>
                    )}
                    {change.direction === "unchanged" && (
                      <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 text-[10px] font-bold uppercase rounded border border-slate-500/20">
                        ■ Stable
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {masteryChanges.length === 0 && (
                <p className="text-sm text-[#bccac4] italic text-center">No topic shifts logged in this session.</p>
              )}
            </div>
          </div>

          <button
            onClick={handleFinishSession}
            id="finish-session-btn"
            className="w-full bg-[#0fa891] hover:bg-[#5cdbc2] text-black font-semibold py-3 rounded-xl transition-all font-headline-sm active:scale-[0.98]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = (questionIndex / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans flex flex-col">
      {/* ─── Top Bar & ECG Progress Line ─── */}
      <header className="bg-[#0f1513] sticky top-0 z-40 border-b border-[#3d4946]/30">
        <div className="flex items-center justify-between px-6 h-14 max-w-[1024px] mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-[#5cdbc2] text-lg">📁</span>
            <span className="font-semibold text-sm text-white" id="question-counter">
              Q {questionIndex} / {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#bccac4]">
            <span>⏱</span>
            <span className="font-mono" id="session-timer">{formatTime(timer)}</span>
            <span className="text-[#5cdbc2]">🤖</span>
          </div>
        </div>

        {/* ECG Heartbeat SVG Progress Indicator */}
        <div className="w-full h-2 bg-[#171d1b] relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0fa891] to-[#5cdbc2] transition-all duration-500 relative flex items-center justify-end"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Heartbeat pulse glow tip */}
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping absolute right-0" />
            <div className="w-1.5 h-1.5 bg-[#5cdbc2] rounded-full absolute right-0" />
          </div>
        </div>
      </header>

      {/* ─── Main Content area ─── */}
      <main className="flex-1 w-full max-w-[768px] mx-auto px-6 py-6 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#5cdbc2] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#bccac4] animate-pulse">Loading next question...</p>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            {/* Subject Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#171d1b] border border-[#3d4946] text-[#bccac4] text-xs font-semibold rounded uppercase">
                {currentQuestion.subject}
              </span>
              <span className="px-2.5 py-0.5 border border-[#5cdbc2]/20 text-[#5cdbc2] text-xs font-semibold rounded uppercase flex items-center gap-1">
                ✨ AI Insight
              </span>
            </div>

            {/* Adaptivity Overrides Warning Alert */}
            {adaptivityMessage && (
              <div
                id="adaptivity-alert"
                className="p-4 bg-emerald-950/40 border border-[#5cdbc2]/30 text-[#5cdbc2] text-sm font-medium rounded-xl flex items-center gap-2.5 shadow-sm shadow-[#5cdbc2]/5"
              >
                <span>💡</span>
                <span>{adaptivityMessage}</span>
              </div>
            )}

            {/* Question Vignette */}
            <h1 className="text-xl font-bold text-white font-headline-md leading-snug" id="question-text">
              {currentQuestion.question}
            </h1>

            {/* Options container */}
            <div className="space-y-3" id="options-container">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedKey === opt.key;
                const isCorrect = attemptResult?.correctOption === opt.key;
                const isIncorrectSelection = isSelected && !attemptResult?.isCorrect;

                let btnStyles = "border-[#3d4946] bg-[#171d1b] hover:bg-[#252b29] text-white";
                let circleContent = opt.key;
                let circleStyles = "border-[#86948f] text-[#bccac4]";

                if (selectedKey) {
                  if (isCorrect) {
                    btnStyles = "border-[#5cdbc2] bg-[#5cdbc2]/10 text-white font-semibold";
                    circleStyles = "bg-[#5cdbc2] text-black border-transparent";
                    circleContent = "✔";
                  } else if (isIncorrectSelection) {
                    btnStyles = "border-[#ffb4ab] bg-[#ffb4ab]/10 text-white";
                    circleStyles = "bg-[#ffb4ab] text-black border-transparent";
                    circleContent = "✘";
                  } else {
                    btnStyles = "border-[#3d4946] bg-[#171d1b]/40 text-[#bccac4]/60 cursor-default";
                    circleStyles = "border-[#3d4946]/40 text-[#bccac4]/40";
                  }
                }

                return (
                  <button
                    key={opt.key}
                    disabled={!!selectedKey}
                    onClick={() => handleOptionSelect(opt.key)}
                    className={`w-full flex items-center text-left p-4 rounded-xl border transition-all duration-200 active:scale-[0.99] min-h-[56px] ${btnStyles}`}
                    data-testid={`option-${opt.key}`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-4 shrink-0 font-bold text-sm transition-all ${circleStyles}`}>
                      {circleContent}
                    </div>
                    <span className="text-sm leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation collapsible block */}
            {attemptResult && (
              <div className="bg-[#171d1b] rounded-xl overflow-hidden border border-[#3d4946] transition-all" id="explanation-box">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-[#252b29] hover:bg-[#303634] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#5cdbc2]">💡</span>
                    <span className="font-semibold text-sm text-white font-headline-sm">Answer Explanation</span>
                  </div>
                  <span className={`text-[#bccac4] transition-transform duration-300 ${showExplanation ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {showExplanation && (
                  <div className="p-5 space-y-4 border-t border-[#3d4946]/30 text-sm leading-relaxed text-[#bccac4]" id="explanation-text-box">
                    <div className="relative">
                      <span className="absolute -top-1 right-0 bg-[#5cdbc2] text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        AI Verified
                      </span>
                      <p className="pr-16 text-white font-medium mb-3">
                        {attemptResult.isCorrect ? "Correct answer selected!" : `Incorrect. The correct answer was option ${attemptResult.correctOption}.`}
                      </p>
                      <p>{attemptResult.explanation}</p>
                    </div>

                    <div className="p-4 bg-[#0f1513] border-l-4 border-[#0fa891] rounded-r text-xs italic">
                      &quot;Make sure to record these key topic parameters for clinical review. Your current mastery level for {currentQuestion.subject} is now {(attemptResult.accuracyEma * 100).toFixed(0)}%.&quot;
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm py-20 text-[#bccac4]">Failed to load question details.</p>
        )}
      </main>

      {/* ─── Bottom CTA Navigation Footer ─── */}
      <footer className="fixed bottom-0 w-full z-40 bg-[#0f1513] border-t border-[#3d4946]/30 shadow-lg">
        <div className="max-w-[768px] mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Weakness Indicator */}
          {currentQuestion && (
            <div className="px-3.5 py-1.5 bg-[#ffb4a1]/10 border border-[#ffb4a1]/20 rounded-full text-[#ffb4a1] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
              <span>⚠</span>
              <span className="uppercase tracking-wider">
                {currentQuestion.subject} mastery check
              </span>
            </div>
          )}

          {/* Next Question CTA */}
          {selectedKey && (
            <button
              onClick={handleNextQuestion}
              id="next-question-btn"
              className="w-full sm:w-auto px-8 py-3 bg-[#0fa891] hover:bg-[#5cdbc2] text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-all font-headline-sm active:scale-[0.98]"
            >
              <span>{questionIndex >= totalQuestions ? "Finish Session" : "Next Question"}</span>
              <span>→</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
