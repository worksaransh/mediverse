"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@mediverse/ui";

interface Mentor {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  bio: string | null;
  yearsExperience: number;
  sessionCount: number;
  averageRating: number | null;
}

interface MentorshipSession {
  id: string;
  mentorId: string;
  studentId: string;
  topic: string | null;
  message: string | null;
  status: string;
  scheduledAt: string | null;
  studentRating: number | null;
  myRole: "student" | "mentor";
  mentorName: string;
  studentName: string;
}

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [asStudent, setAsStudent] = useState<MentorshipSession[]>([]);
  const [asMentor, setAsMentor] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Become-a-mentor form
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [applying, setApplying] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [mentorsRes, sessionsRes] = await Promise.all([
        fetch("/api/mentors"),
        fetch("/api/mentorship"),
      ]);
      if (mentorsRes.ok) setMentors((await mentorsRes.json()).mentors || []);
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setAsStudent(data.asStudent || []);
        setAsMentor(data.asMentor || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function requestSession(mentorId: string) {
    const res = await fetch("/api/mentorship/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, message }),
    });
    if (res.ok) {
      setNotice("Session requested!");
      setRequestingId(null);
      setMessage("");
      await loadAll();
    } else {
      const data = await res.json().catch(() => ({}));
      setNotice(data.error || "Failed to request session.");
    }
  }

  async function respond(sessionId: string, action: string, extra?: Record<string, unknown>) {
    const res = await fetch(`/api/mentorship/${sessionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    if (res.ok) {
      await loadAll();
    } else {
      const data = await res.json().catch(() => ({}));
      setNotice(data.error || "Action failed.");
    }
  }

  async function applyAsMentor(e: React.FormEvent) {
    e.preventDefault();
    if (!specialization.trim()) return;
    setApplying(true);
    try {
      const res = await fetch("/api/mentors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization, bio }),
      });
      if (res.ok) {
        setNotice("You're now listed as a mentor!");
        setSpecialization("");
        setBio("");
        await loadAll();
      }
    } finally {
      setApplying(false);
    }
  }

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

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Mentorship</h1>
          <p className="text-sm text-[#bccac4] mt-1">
            Connect with mentors for guidance, or become one yourself.
          </p>
        </div>

        {notice && (
          <div className="p-3 bg-[#5cdbc2]/10 border border-[#5cdbc2]/20 rounded-lg text-xs text-[#5cdbc2]">
            {notice}
          </div>
        )}

        {/* Become a mentor */}
        <Card className="border-[#3d4946] bg-[#171d1b] p-6">
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Become a Mentor</h2>
          <form onSubmit={applyAsMentor} className="grid gap-4 md:grid-cols-3 items-end">
            <label className="flex flex-col gap-1 text-xs text-[#86948f]">
              Specialization
              <input
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                placeholder="e.g. NEET Biology Coaching"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#86948f] md:col-span-2">
              Short Bio
              <input
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>
            <div className="md:col-span-3">
              <Button type="submit" variant="secondary" disabled={applying}>
                {applying ? "Submitting…" : "Apply as Mentor"}
              </Button>
            </div>
          </form>
        </Card>

        {/* My sessions as student */}
        {asStudent.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">My Requested Sessions</h2>
            <div className="grid gap-3">
              {asStudent.map((s) => (
                <Card key={s.id} className="border-[#3d4946] bg-[#171d1b]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{s.mentorName}</p>
                      <p className="text-xs text-[#86948f]">{s.topic || "General mentorship"} · {s.status}</p>
                    </div>
                    {s.status === "completed" && s.studentRating === null && (
                      <Button size="sm" variant="secondary" onClick={() => respond(s.id, "rate", { rating: 5 })}>
                        Rate 5★
                      </Button>
                    )}
                    {(s.status === "requested" || s.status === "confirmed") && (
                      <Button size="sm" variant="ghost" onClick={() => respond(s.id, "cancel")}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My sessions as mentor */}
        {asMentor.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Requests to Me (as Mentor)</h2>
            <div className="grid gap-3">
              {asMentor.map((s) => (
                <Card key={s.id} className="border-[#3d4946] bg-[#171d1b]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{s.studentName}</p>
                      <p className="text-xs text-[#86948f]">{s.topic || "General mentorship"} · {s.status}</p>
                      {s.message && <p className="text-xs text-[#bccac4] mt-1">&ldquo;{s.message}&rdquo;</p>}
                    </div>
                    <div className="flex gap-2">
                      {s.status === "requested" && (
                        <>
                          <Button size="sm" variant="primary" onClick={() => respond(s.id, "confirm")}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => respond(s.id, "decline")}>
                            Decline
                          </Button>
                        </>
                      )}
                      {s.status === "confirmed" && (
                        <Button size="sm" variant="primary" onClick={() => respond(s.id, "complete")}>
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Browse mentors */}
        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Browse Mentors</h2>
          {loading ? (
            <p className="text-sm text-[#bccac4]">Loading…</p>
          ) : mentors.length === 0 ? (
            <p className="text-sm text-[#bccac4]">No mentors yet — be the first to apply above.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mentors.map((m) => (
                <Card key={m.id} className="border-[#3d4946] bg-[#171d1b]">
                  <p className="font-bold text-white text-sm">{m.name}</p>
                  <p className="text-xs text-[#5cdbc2] mt-1">{m.specialization}</p>
                  {m.bio && <p className="text-xs text-[#bccac4] mt-2">{m.bio}</p>}
                  <p className="text-xs text-[#86948f] mt-2">
                    {m.yearsExperience} yrs experience · {m.sessionCount} sessions
                    {m.averageRating !== null ? ` · ${m.averageRating}★` : ""}
                  </p>

                  {requestingId === m.id ? (
                    <div className="mt-3 space-y-2">
                      <input
                        className="w-full bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-xs text-white"
                        placeholder="What would you like help with?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => requestSession(m.id)}>
                          Send Request
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRequestingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Button size="sm" variant="secondary" onClick={() => setRequestingId(m.id)}>
                        Request Session
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
