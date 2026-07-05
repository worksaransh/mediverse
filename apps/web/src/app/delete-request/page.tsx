"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteRequestPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDeleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!identifier) return;

    if (!confirm("Are you absolutely sure you want to permanently erase your account and all study progress? This action is irreversible.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process erasure request");

      setMessage(data.message);
      setIdentifier("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-[#171d1b] border border-[#3d4946] rounded-2xl p-8 md:p-10 shadow-2xl">
        <button
          onClick={() => router.back()}
          className="text-[#5cdbc2] hover:underline mb-6 inline-block text-xs"
        >
          ← Go Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-3">Request Data Erasure</h1>
        <p className="text-xs text-[#bccac4] mb-6 leading-relaxed">
          Under the India DPDP Act 2023, you have the right to request deletion of your account. Submitting this request will instantly delete your profile, credentials, streaks, subscriptions, and active recall histories from our database.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleDeleteSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
              Phone number or Email address
            </label>
            <input
              type="text"
              placeholder="e.g. +919876543210 or student@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] placeholder-[#86948f] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !identifier.trim()}
            className="w-full h-12 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/30 hover:border-red-500 font-semibold rounded-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-red-500/20 disabled:hover:text-red-200"
          >
            {loading ? "Erasing..." : "Permanently Erase My Data"}
          </button>
        </form>
      </div>
    </div>
  );
}
