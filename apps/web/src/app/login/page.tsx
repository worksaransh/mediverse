"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone) return;
    if (!consent) {
      setError("Under the India DPDP Act 2023, you must consent to the Privacy Policy and Terms of Service to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otp) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");

      if (data.onboardingCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    if (!consent) {
      setError("Under the India DPDP Act 2023, you must consent to the Privacy Policy and Terms of Service to continue.");
      return;
    }
    setLoading(true);
    try {
      // Simulate Google OAuth response
      const mockGoogleProfile = {
        email: `google-${Math.floor(Math.random() * 1000)}@mediverse.in`,
        name: "Google Student",
        googleId: `g-${Math.floor(Math.random() * 10000000)}`,
        avatarUrl: null,
      };

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockGoogleProfile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");

      if (data.onboardingCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[440px] bg-[#171d1b] border border-[#3d4946] rounded-2xl p-8 shadow-2xl">
        {/* logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5cdbc2] to-[#0fa891] flex items-center justify-center shadow-lg shadow-[#5cdbc2]/20">
            <span className="text-[#00201a] font-bold text-xl">M</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#dee4e0] mb-2 tracking-tight">
            Welcome to Mediverse
          </h1>
          <p className="text-sm text-[#bccac4]">
            {step === "phone"
              ? "Sign in or create an account with your phone number"
              : `Enter the 4-digit code sent to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 mb-6 p-4 bg-[#1b211f] border border-[#3d4946] rounded-xl">
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 accent-[#5cdbc2] rounded border-[#3d4946] focus:ring-0 focus:outline-none cursor-pointer"
          />
          <span className="text-xs text-[#bccac4] leading-relaxed">
            I provide explicit consent under the India DPDP Act 2023 for Mediverse to collect, process, and retain my phone, email, and clinical learning profile as detailed in the{" "}
            <a href="/privacy" className="text-[#5cdbc2] hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and{" "}
            <a href="/terms" className="text-[#5cdbc2] hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a>.
          </span>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#86948f] font-medium">
                  +91
                </span>
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 pl-12 pr-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] placeholder-[#86948f] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <button
              id="send-otp-btn"
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full h-12 bg-[#5cdbc2] hover:bg-[#5cdbc2]/90 disabled:bg-[#5cdbc2]/30 text-[#00201a] font-semibold rounded-xl flex items-center justify-center transition-all hover:shadow-lg hover:shadow-[#5cdbc2]/10 active:scale-[0.98]"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                One-Time Password
              </label>
              <input
                id="otp-input"
                type="text"
                placeholder="Enter 4-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-center text-lg tracking-[0.5em] font-bold text-[#dee4e0] placeholder-[#86948f] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                maxLength={4}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-[#5cdbc2] hover:underline"
              >
                Change Phone
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-[#86948f] hover:text-[#dee4e0]"
              >
                Resend OTP
              </button>
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full h-12 bg-[#5cdbc2] hover:bg-[#5cdbc2]/90 disabled:bg-[#5cdbc2]/30 text-[#00201a] font-semibold rounded-xl flex items-center justify-center transition-all hover:shadow-lg hover:shadow-[#5cdbc2]/10 active:scale-[0.98]"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3d4946]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#171d1b] px-3 text-[#86948f]">Or continue with</span>
          </div>
        </div>

        <button
          id="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 bg-white/5 border border-[#3d4946] text-[#dee4e0] hover:bg-white/10 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Account
        </button>
      </div>
    </div>
  );
}
