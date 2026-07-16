"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans p-6 md:p-12">
      <div className="max-w-[800px] mx-auto bg-[#171d1b] border border-[#3d4946] rounded-2xl p-8 md:p-10 shadow-xl">
        <button
          onClick={() => router.back()}
          className="text-[#5cdbc2] hover:underline mb-8 inline-block text-sm"
        >
          ← Go Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-xs text-[#bccac4] mb-8">
          Last Updated: July 5, 2026
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-[#bccac4]">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Educational Purpose Only</h2>
            <p>
              Mediverse is an online educational revision platform for MBBS students and PG aspirants. All questions, study roadmaps, flashcards, and AI Mentor replies are generated for study and preparation purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Medical Disclaimer</h2>
            <p>
              The services and outputs of this app **do not constitute medical or clinical advice**. They are not a substitute for professional clinical training, medical diagnosis, treatment protocols, or the professional judgment of a healthcare practitioner. Do not use AI-generated outputs for diagnostic purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. User Responsibility</h2>
            <p>
              Users are solely responsible for verifying clinical facts, drug dosages, and guidelines against standard textbook medical references (e.g., Harrison&apos;s, Robbins, Bailey & Love) before making clinical decisions or board exam preparations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Accounts and Security</h2>
            <p>
              You agree to provide accurate credentials during registration. Your phone number is verified via OTP. You are responsible for maintaining the privacy of your account access tokens.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
