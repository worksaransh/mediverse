"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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

        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-xs text-[#bccac4] mb-8">
          Last Updated: July 5, 2026 | Compliant with the India Digital Personal Data Protection (DPDP) Act, 2023.
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-[#bccac4]">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Data We Collect</h2>
            <p>
              We collect and process personal data only when you provide explicit consent:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Credentials:</strong> Phone number and email address.</li>
              <li><strong>MBBS Profiles:</strong> Study stage, exam targets, target years, and weak subjects focus areas.</li>
              <li><strong>Activity Data:</strong> Daily MCQ attempt histories, streaks, bookmarks, and search logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Purpose of Collection</h2>
            <p>
              Your data is processed strictly for the following purposes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To construct your personalized daily medical study dashboards.</li>
              <li>To run active-recall spaced repetition intervals on questions you mark or attempt.</li>
              <li>To customize your AI Mentor study plans and literature research feeds.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Data Retention & Erasure</h2>
            <p>
              We retain your data only for as long as your account remains active. Under Section 12 of the DPDP Act 2023, you have the right to request the erasure of your personal data. To trigger immediate deletion of all data associated with your credentials, please visit our <a href="/delete-request" className="text-[#5cdbc2] hover:underline font-semibold">Data Deletion Request Page</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. User Rights under DPDP Act</h2>
            <p>
              As a Data Principal in India, you are entitled to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Right to Access:</strong> Request a summary of personal data processed.</li>
              <li><strong>Right to Correction/Erasure:</strong> Correct, update, or erase credentials and profiles.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Contact Information</h2>
            <p>
              For grievances, data protection queries, or consent withdrawal, contact our Data Protection Officer at:
              <br />
              <strong className="text-white block mt-1">Email: dpo@mediverse.in</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
