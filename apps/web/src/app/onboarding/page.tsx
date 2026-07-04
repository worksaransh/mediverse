"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type OnboardingStep = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 State
  const [examTarget, setExamTarget] = useState<string>("");

  // Step 2 State
  const [currentYear, setCurrentYear] = useState<string>("");
  const [examTargetYear, setExamTargetYear] = useState<number>(new Date().getFullYear() + 1);
  const [examDate, setExamDate] = useState<string>("");

  // Step 3 State
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  const subjects = [
    "Anatomy",
    "Physiology",
    "Biochemistry",
    "Pathology",
    "Pharmacology",
    "Microbiology",
    "Forensic Medicine",
    "Social & Preventive Medicine",
    "ENT",
    "Ophthalmology",
    "General Medicine",
    "General Surgery",
    "Obstetrics & Gynecology",
    "Pediatrics",
  ];

  function toggleSubject(subject: string) {
    setWeakSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject],
    );
  }

  async function handleCompleteOnboarding() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examTarget,
          currentYear,
          examTargetYear: Number(examTargetYear),
          examDate,
          weakSubjects,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete onboarding");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleContinue() {
    if (step === 1 && examTarget) {
      setStep(2);
    } else if (step === 2 && currentYear && examTargetYear && examDate) {
      setStep(3);
    } else if (step === 3 && weakSubjects.length > 0) {
      handleCompleteOnboarding();
    }
  }

  function handleBack() {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  }

  const isContinueDisabled = () => {
    if (step === 1) return !examTarget;
    if (step === 2) return !currentYear || !examTargetYear || !examDate;
    if (step === 3) return weakSubjects.length === 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] flex flex-col font-sans">
      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-[#0f1513]/80 backdrop-blur-md px-6 h-14 flex items-center justify-between border-b border-[#3d4946]/30">
        <button
          onClick={handleBack}
          disabled={step === 1 || loading}
          className={`w-10 h-10 flex items-center justify-start text-[#bccac4] active:scale-95 transition-transform disabled:opacity-20`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${step >= 1 ? "bg-[#5cdbc2]" : "bg-[#3d4946]"}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step >= 2 ? "bg-[#5cdbc2]" : "bg-[#3d4946]"}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step >= 3 ? "bg-[#5cdbc2]" : "bg-[#3d4946]"}`} />
        </div>
        <div className="w-10" />
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[480px] mx-auto px-6 pt-8 pb-32">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-12 h-12 border-4 border-[#5cdbc2] border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-bold text-[#dee4e0] mb-2">Analyzing your profile...</h2>
            <p className="text-sm text-[#bccac4] max-w-xs">
              Claude is analyzing your weak subjects to generate a custom AI study plan.
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Exam Target */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#dee4e0] mb-3 tracking-tight">
                    What are you preparing for?
                  </h1>
                  <p className="text-sm text-[#bccac4]">
                    Tailor your study plan to your specific examination goal.
                  </p>
                </div>

                <div className="space-y-4">
                  {["NEET PG", "INI-CET", "FMGE", "NEET SS"].map((exam) => {
                    const isSelected = examTarget === exam;
                    return (
                      <button
                        key={exam}
                        id={`exam-${exam.replace(" ", "-").toLowerCase()}`}
                        onClick={() => setExamTarget(exam)}
                        className={`w-full flex items-center justify-between p-5 bg-[#171d1b] border rounded-xl text-left transition-all ${
                          isSelected
                            ? "border-[#5cdbc2] bg-[#5cdbc2]/10"
                            : "border-[#3d4946] hover:border-[#5cdbc2]/50"
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-lg block leading-tight text-[#dee4e0]">
                            {exam}
                          </span>
                          <span className="text-xs text-[#bccac4] mt-1 block">
                            {exam === "NEET PG" && "National Eligibility cum Entrance Test (Postgraduate)"}
                            {exam === "INI-CET" && "Institute of National Importance Combined Entrance Test"}
                            {exam === "FMGE" && "Foreign Medical Graduate Examination"}
                            {exam === "NEET SS" && "Super Specialty Entrance Test"}
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? "bg-[#5cdbc2] border-[#5cdbc2]" : "border-[#3d4946]"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4 text-[#00201a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Year and Date */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#dee4e0] mb-3 tracking-tight">
                    Timeline details
                  </h1>
                  <p className="text-sm text-[#bccac4]">
                    Provide your year of study and target exam timeline.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Current Study Year */}
                  <div>
                    <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                      Current Stage of Study
                    </label>
                    <select
                      id="stage-select"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                      required
                    >
                      <option value="" disabled>Select your MBBS year / status</option>
                      <option value="MBBS Year 1">MBBS 1st Professional</option>
                      <option value="MBBS Year 2">MBBS 2nd Professional</option>
                      <option value="MBBS Year 3">MBBS 3rd Professional Part 1</option>
                      <option value="MBBS Year 4">MBBS 3rd Professional Part 2</option>
                      <option value="Intern">Compulsory Rotatory Internship (CRRI)</option>
                      <option value="Post-Intern">Post-Intern / Repeater</option>
                    </select>
                  </div>

                  {/* Target Exam Year */}
                  <div>
                    <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                      Target Exam Year
                    </label>
                    <input
                      id="target-year-input"
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      value={examTargetYear}
                      onChange={(e) => setExamTargetYear(parseInt(e.target.value))}
                      className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                      required
                    />
                  </div>

                  {/* Target Exam Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                      Estimated Exam Date
                    </label>
                    <input
                      id="target-date-input"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Weak Subjects */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#dee4e0] mb-3 tracking-tight">
                    Select your weak areas
                  </h1>
                  <p className="text-sm text-[#bccac4]">
                    Select at least 1 subject where you want more AI-guided practice.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {subjects.map((sub) => {
                    const isSelected = weakSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        id={`subject-${sub.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        onClick={() => toggleSubject(sub)}
                        className={`p-4 rounded-xl border text-left text-sm transition-all ${
                          isSelected
                            ? "border-[#5cdbc2] bg-[#5cdbc2]/10 text-white font-medium"
                            : "border-[#3d4946] bg-[#171d1b] hover:border-[#5cdbc2]/50 text-[#bccac4]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-wider text-[#86948f]">
                            MBBS
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#5cdbc2] flex items-center justify-center">
                              <svg className="w-3 h-3 text-[#00201a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="block">{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      {!loading && (
        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-[#0f1513]/90 backdrop-blur-lg border-t border-[#3d4946]/50 z-50">
          <div className="max-w-[480px] mx-auto">
            <button
              id="continue-btn"
              onClick={handleContinue}
              disabled={isContinueDisabled()}
              className="w-full h-14 bg-[#5cdbc2] text-[#00201a] font-semibold text-lg rounded-xl shadow-lg shadow-[#5cdbc2]/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
            >
              {step === 3 ? "Complete Onboarding" : "Continue"}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <p className="mt-4 text-center text-xs tracking-wide text-[#86948f]">
              {step === 1 && "Step 1 of 3: Target Examination"}
              {step === 2 && "Step 2 of 3: Timeline & Stages"}
              {step === 3 && "Step 3 of 3: Medical Subject Weaknesses"}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
