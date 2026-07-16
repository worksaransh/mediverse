"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  
  // Waitlist form state
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans overflow-x-hidden selection:bg-[#5cdbc2] selection:text-black">
      {/* Head CSS rules overlay */}
      <style jsx global>{`
        .hero-gradient {
          background: radial-gradient(circle at 50% 50%, rgba(92, 219, 194, 0.08) 0%, rgba(15, 21, 19, 0) 70%);
        }
        .ai-pill-glow {
          box-shadow: 0 0 12px rgba(92, 219, 194, 0.3);
        }
      `}</style>

      {/* Top Header Navigation */}
      <header className="bg-[#0f1513] w-full top-0 sticky z-[100] border-b border-[#3d4946]/30 backdrop-blur-md">
        <nav className="flex items-center justify-between px-6 h-14 w-full max-w-[1024px] mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5cdbc2]" style={{ fontVariationSettings: "'FILL' 1" }}>
              clinical_notes
            </span>
            <span className="font-bold text-lg text-[#5cdbc2] tracking-tight">Mediverse OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-[#5cdbc2]" href="/">Home</Link>
            <Link className="text-sm text-[#bccac4] hover:text-[#5cdbc2] transition-colors" href="/topics/pharmacology">Pharmacology</Link>
            <Link className="text-sm text-[#bccac4] hover:text-[#5cdbc2] transition-colors" href="/topics/pathology">Pathology</Link>
            <Link className="text-sm text-[#bccac4] hover:text-[#5cdbc2] transition-colors" href="/topics/anatomy">Anatomy</Link>
            <button
              id="sign-in-btn"
              onClick={() => router.push("/login")}
              className="bg-[#5cdbc2] text-[#00382f] text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#7bf8dd] transition-all"
            >
              Sign In
            </button>
          </div>
          <div className="md:hidden">
            <span className="material-symbols-outlined text-[#5cdbc2] cursor-pointer" onClick={() => router.push("/login")}>
              menu
            </span>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="hero-gradient pt-16 pb-24 px-6">
          <div className="max-w-[1024px] mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#171d1b] border border-[#3d4946]/30 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-[#5cdbc2] text-[18px]">
                  auto_awesome
                </span>
                <span className="text-[10px] text-[#5cdbc2] uppercase tracking-wider font-semibold">
                  V2.0 CLINICALLY VALIDATED STUDY PLATFORM
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
                Turn 15 minutes a day into exam success and career growth
              </h1>
              
              <p className="text-[#bccac4] text-lg max-w-md">
                The &ldquo;Career OS&rdquo; for medical professionals. Master high-stakes residency entrance exams with adaptive rigor, customized mock questions, and clinical precision.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  id="cta-start"
                  onClick={() => router.push("/login")}
                  className="bg-[#5cdbc2] text-[#00382f] px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#5cdbc2]/20 hover:bg-[#7bf8dd] transition-all flex items-center justify-center gap-2 group"
                >
                  Start free
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-[#171d1b] border border-[#3d4946]/30 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-[#252b29] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  See how it works
                </button>
              </div>
              
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#0f1513] bg-[#303634] overflow-hidden">
                    <img className="w-full h-full object-cover" alt="Dr. Sarah" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjK1cI5reYFf72Bvrn0G44GZzniI4NXpK8UxdX-uRDlpE_Ges1pifKDWPatcpesIsn5rtsjaibrC3jfuJvOm-9BEIG7BNXQRyNZX_KlyKCC1v-Q1XRLEymZlykEHeFA2kRstFOVICdUrJhBoEZVmrAvPLKCxLoP6s5ndQ9H9-LFKN82QFSe9IkMTq7n93Xm90dDw3vV7pvE4nqrjVdZa8485FDOddOUZieXXnHh11yBAx_oGtsLD8GjUJh23r_pa0oLWAYQhLkMKs"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#0f1513] bg-[#303634] overflow-hidden">
                    <img className="w-full h-full object-cover" alt="Dr. Rahul" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD05LoFDtUa7S2PulEqLP-0NNZUcSBSDAadi4EXCq2l5-RT9XMedBDx25iVVZRUD5Yc3A_GGZv5hwDSNIgUBAiN2pGuvj_xRxcJ8Y70FjESCUoyndNJPRzjJKqxVNBoLkSb3VlD8dmXI0ZYbs9HlXvtQM6WYsTRy0amrZOPv6lp_b8Kn93mq9VMNddNKEAkcv1ldKAfbXvIg6d6FpfnGl3XopsWr6j_PPzOaaVf2tMvNvpRK4LVmG5VU6fhRK7BRgX-YTxgvPKViGg"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#0f1513] bg-[#303634] overflow-hidden">
                    <img className="w-full h-full object-cover" alt="Dr. Anjali" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB65GNozD4PlUaGnow2Qmp1DMeGYFhyP2OUrtd_3-EkKfyGdEAwbFH5b1pSyVxQILZ1UuNaU_MUS5bKVwK0iC3HjRyxx6Kv20hrPbfo11gCeOU3M2mUQG6c8Ifc8FnLaJSpkIa-Y-7QZPrCOLHZ-PI5K1lk0GXQcv8gsvy8KnOILekxOrTakcgOVAOug20QiobXncc6S7_cSef5uHaWNKTsmygVUoXDG-DeJrw4Q1LescN4qUVPI0aZmitHfdVKlcMHFMkLC5sHEXA"/>
                  </div>
                </div>
                <p className="text-xs text-[#bccac4]">
                  Trusted by <span className="text-[#5cdbc2] font-bold">12,000+</span> medical professionals in India
                </p>
              </div>
            </div>

            {/* Side Mockup Dashboard UI */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-[300px] h-[520px] bg-[#303634] rounded-[2.5rem] border-[6px] border-[#303634] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[#0f1513] flex flex-col">
                  {/* Status Bar */}
                  <div className="h-6 w-full flex justify-between px-6 pt-2 items-center">
                    <span className="text-[10px] font-bold text-white">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3.5 h-2 rounded bg-white/20"></div>
                      <div className="w-3.5 h-2 rounded bg-white/40"></div>
                    </div>
                  </div>
                  {/* Content Mock */}
                  <div className="p-4 space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-[#5cdbc2]">Dashboard</h3>
                      <span className="material-symbols-outlined text-[#5cdbc2] text-sm">smart_toy</span>
                    </div>
                    <div className="bg-[#171d1b] border border-[#3d4946]/20 p-3 rounded-xl space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#bccac4]">TODAY&apos;S STUDY GOAL</p>
                      <div className="flex justify-between items-end">
                        <span className="font-mono text-xl text-[#5cdbc2]">12/15</span>
                        <span className="text-[9px] text-[#bccac4]">Minutes</span>
                      </div>
                      <div className="w-full bg-[#303634] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#5cdbc2] w-[80%] h-full"></div>
                      </div>
                    </div>
                    <div className="bg-[#171d1b] border border-[#5cdbc2]/30 p-3 rounded-xl space-y-2 relative">
                      <div className="absolute -top-2 -right-2 bg-[#5cdbc2] text-[#00382f] text-[8px] px-1.5 py-0.5 rounded-full font-bold">ACTIVE</div>
                      <p className="font-bold text-xs text-white">Adaptive MCQ Engine</p>
                      <p className="text-[9px] text-[#bccac4]">Next: Pharmacology — SGLT2 Inhibitors</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#252b29] p-3 rounded-xl h-20 flex flex-col justify-between">
                        <span className="material-symbols-outlined text-[#5cdbc2] text-sm">trending_up</span>
                        <span className="text-[9px] font-bold text-white">Percentile: 84%</span>
                      </div>
                      <div className="bg-[#252b29] p-3 rounded-xl h-20 flex flex-col justify-between">
                        <span className="material-symbols-outlined text-[#ffb4a1] text-sm">local_fire_department</span>
                        <span className="text-[9px] font-bold text-white">14 Day Streak</span>
                      </div>
                    </div>
                  </div>
                  {/* Bottom Bar */}
                  <div className="mt-auto h-[44px] border-t border-[#3d4946]/20 flex justify-around items-center bg-[#171d1b]">
                    <span className="material-symbols-outlined text-[#5cdbc2] text-[18px]">home</span>
                    <span className="material-symbols-outlined text-[#bccac4] text-[18px]">quiz</span>
                    <span className="material-symbols-outlined text-[#bccac4] text-[18px]">psychology</span>
                    <span className="material-symbols-outlined text-[#bccac4] text-[18px]">person</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Stat Badge */}
              <div className="absolute top-20 -left-10 bg-[#252b29] border border-[#3d4946]/30 p-3 rounded-xl shadow-lg hidden lg:block animate-bounce" style={{ animationDuration: "4s" }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#5cdbc2]">check_circle</span>
                  <div>
                    <p className="text-xs font-bold text-white">+4.2% Mastery</p>
                    <p className="text-[8px] text-[#bccac4] uppercase tracking-wider">Spaced Repetition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[#090f0e]">
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-white mb-4">Precision-engineered for medical study</h2>
              <p className="text-[#bccac4] max-w-xl mx-auto">No decorative noise. Just high-yield adaptive modules designed to secure your top residency matching goals.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 bg-[#171d1b] border border-[#3d4946]/20 rounded-2xl hover:border-[#5cdbc2] transition-all duration-300 group">
                <div className="w-12 h-12 bg-[#5cdbc2]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5cdbc2] transition-colors">
                  <span className="material-symbols-outlined text-[#5cdbc2] group-hover:text-[#00382f]">quiz</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Adaptive MCQs</h3>
                <p className="text-[#bccac4] text-xs leading-relaxed">
                  Our system isolates your subject weak areas. Spaced-repetition loops ensure you retain tough pharmacology and pathology concepts indefinitely.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="p-8 bg-[#171d1b] border border-[#3d4946]/20 rounded-2xl hover:border-[#5cdbc2] transition-all duration-300 group">
                <div className="w-12 h-12 bg-[#5cdbc2]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5cdbc2] transition-colors">
                  <span className="material-symbols-outlined text-[#5cdbc2] group-hover:text-[#00382f]">dynamic_feed</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Personalized Discover Feed</h3>
                <p className="text-[#bccac4] text-xs leading-relaxed">
                  An automatic morning brief ranking literature summaries and exam updates according to your curriculum needs.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-[#171d1b] border border-[#3d4946]/20 rounded-2xl hover:border-[#5cdbc2] transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#5cdbc2] text-[#00382f] text-[9px] px-2 py-0.5 rounded-full font-bold">AI</div>
                <div className="w-12 h-12 bg-[#5cdbc2]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5cdbc2] transition-colors">
                  <span className="material-symbols-outlined text-[#5cdbc2] group-hover:text-[#00382f]">psychology</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">AI Mentor</h3>
                <p className="text-[#bccac4] text-xs leading-relaxed">
                  Stuck on a clinical vignette? Ask the Orchestrated Clinical Mentor for prompt guideline citations and safe diagnostics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Community & Waitlist Coming Soon Section */}
        <section className="py-20 bg-[#0f1513]">
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="bg-[#171d1b] border border-[#3d4946]/30 rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                
                {/* Waitlist Capture Card */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-[#5cdbc2]/10 text-[#5cdbc2] px-3 py-1 rounded-full text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#5cdbc2] animate-pulse"></span>
                    COMMUNITY COMING SOON
                  </div>
                  <h2 className="text-3xl font-extrabold text-white leading-tight">
                    Join the Elite Medical Circles
                  </h2>
                  <p className="text-[#bccac4] text-sm">
                    Gain exclusive access to peer discussion boards, high-yield PDF digests, and real-time exam notifications. Sign up for early developer drops and beta invites.
                  </p>

                  {/* Stateful Form */}
                  {!submitted ? (
                    <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          id="waitlist-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your institutional email address..."
                          className="flex-1 px-4 py-3 bg-[#0f1513] border border-[#3d4946] rounded-xl text-sm text-white focus:outline-none focus:border-[#5cdbc2] transition-colors"
                        />
                        <button
                          id="waitlist-submit"
                          type="submit"
                          className="px-6 py-3 bg-[#5cdbc2] hover:bg-[#7bf8dd] text-[#00382f] font-bold rounded-xl text-sm transition-all"
                        >
                          Join Waitlist
                        </button>
                      </div>
                      {error && <p className="text-xs text-[#ffb4ab]">{error}</p>}
                    </form>
                  ) : (
                    <div id="waitlist-success-badge" className="p-4 bg-[#5cdbc2]/10 border border-[#5cdbc2]/20 rounded-xl text-[#5cdbc2]">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        Success! You have been added to the newsletter waitlist.
                      </p>
                    </div>
                  )}

                  {/* External Community Links */}
                  <div className="flex gap-4 pt-2">
                    <a
                      href="https://wa.me/mock"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-[#bccac4] hover:text-[#5cdbc2] transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      WhatsApp Group
                    </a>
                    <a
                      href="https://t.me/mock"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-[#bccac4] hover:text-[#5cdbc2] transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Telegram Channel
                    </a>
                  </div>
                </div>

                {/* Blurred Preview Card */}
                <div className="relative p-6 bg-[#252b29] border border-[#3d4946]/30 rounded-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-[#252b29]/80 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-4">
                    <span className="material-symbols-outlined text-4xl text-[#5cdbc2] mb-2">lock</span>
                    <p className="text-sm font-bold text-white">Private Beta Preview</p>
                    <p className="text-[10px] text-[#bccac4] max-w-[200px]">Active verification required to unlock peer forums.</p>
                  </div>
                  
                  {/* Mock content behind blur */}
                  <div className="space-y-4 opacity-40 select-none pointer-events-none">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-500"></div>
                      <div className="space-y-1">
                        <div className="w-24 h-3 bg-slate-400 rounded"></div>
                        <div className="w-16 h-2 bg-slate-500 rounded"></div>
                      </div>
                    </div>
                    <div className="w-full h-12 bg-[#171d1b] rounded-lg"></div>
                    <div className="w-full h-8 bg-[#171d1b] rounded-lg"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#090f0e] text-[#bccac4] py-12 border-t border-[#3d4946]/10">
        <div className="max-w-[1024px] mx-auto px-6 text-center space-y-4">
          <div className="flex justify-center gap-6 text-xs font-bold text-[#bccac4]">
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/pharmacology">Pharmacology</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/pathology">Pathology</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/anatomy">Anatomy</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/biochemistry">Biochemistry</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/surgery">General Surgery</Link>
          </div>
          <p className="text-xs">
            © 2026 Mediverse. Precision Operating System for Medical Prep in India.
          </p>
        </div>
      </footer>
    </div>
  );
}
