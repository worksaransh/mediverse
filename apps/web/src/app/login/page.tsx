"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [authMode, setAuthMode] = useState<"otp" | "email_login" | "email_signup">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

      router.refresh();
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

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    if (!consent) {
      setError("Under the India DPDP Act 2023, you must consent to the Privacy Policy and Terms of Service to continue.");
      return;
    }
    if (authMode === "email_signup" && !name) {
      setError("Full Name is required to sign up.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authMode === "email_signup" ? "signup" : "login",
          email,
          password,
          name: authMode === "email_signup" ? name : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      router.refresh();
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
            {authMode === "otp"
              ? step === "phone"
                ? "Sign in or create an account with your phone number"
                : `Enter the verification code sent to ${phone}`
              : authMode === "email_login"
              ? "Sign in with your email and password"
              : "Create a new account with your email and password"}
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

        {authMode === "otp" ? (
          step === "phone" ? (
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
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-center text-lg tracking-[0.5em] font-bold text-[#dee4e0] placeholder-[#86948f] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                  maxLength={6}
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
          )
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {authMode === "email_signup" && (
              <div>
                <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] placeholder-[#86948f] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] placeholder-[#86948f] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#bccac4] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-[#1b211f] border border-[#3d4946] rounded-xl text-sm text-[#dee4e0] placeholder-[#86948f] focus:outline-none focus:border-[#5cdbc2] focus:ring-1 focus:ring-[#5cdbc2] transition-all"
                required
              />
            </div>

            <button
              id="email-submit-btn"
              type="submit"
              disabled={loading || !email || !password || (authMode === "email_signup" && !name)}
              className="w-full h-12 bg-[#5cdbc2] hover:bg-[#5cdbc2]/90 disabled:bg-[#5cdbc2]/30 text-[#00201a] font-semibold rounded-xl flex items-center justify-center transition-all hover:shadow-lg hover:shadow-[#5cdbc2]/10 active:scale-[0.98]"
            >
              {loading
                ? authMode === "email_signup"
                  ? "Creating Account..."
                  : "Logging In..."
                : authMode === "email_signup"
                ? "Create Account"
                : "Log In"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#3d4946]/50 flex flex-col items-center gap-3 text-sm">
          {authMode === "otp" ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthMode("email_login");
              }}
              className="text-[#5cdbc2] hover:underline font-medium"
            >
              Sign in with Email & Password
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode("otp");
                }}
                className="text-[#5cdbc2] hover:underline font-medium"
              >
                Sign in with Phone OTP
              </button>

              {authMode === "email_login" ? (
                <p className="text-xs text-[#bccac4]">
                  New to Mediverse?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthMode("email_signup");
                    }}
                    className="text-[#5cdbc2] hover:underline font-medium ml-1"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-[#bccac4]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthMode("email_login");
                    }}
                    className="text-[#5cdbc2] hover:underline font-medium ml-1"
                  >
                    Sign in instead
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
