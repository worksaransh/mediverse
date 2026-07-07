"use client";

import React, { useEffect, useState } from "react";

interface ContentItem {
  id: string;
  type: string;
  title: string;
  body: string;
  summary?: string;
  specialtyTags?: string[];
  topicTags?: string[];
  status: string;
  createdAt: string;
  publishedAt?: string;
}

interface UserRecord {
  id: string;
  email: string;
  phoneNumber: string;
  examTarget: string;
  careerStage: string;
  streak: number;
  lastActivity: string;
}

interface FlaggedMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface IngestionSource {
  source: string;
  lastRun: string;
  status: string;
  successCount: number;
  failureCount: number;
}

interface DashboardData {
  contentItems: ContentItem[];
  users: UserRecord[];
  flaggedMessages: FlaggedMessage[];
  stats: {
    draftCount: number;
    publishedCount: number;
    totalUsers: number;
    flaggedCount: number;
  };
  ingestionSources: IngestionSource[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Ingestion Form State
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestBody, setIngestBody] = useState("");
  const [ingestSpecialty, setIngestSpecialty] = useState("Pharmacology");

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // Fetch admin dashboard parameters
  async function loadDashboardData() {
    try {
      const res = await fetch("/api/admin-data");
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (e) {
      console.error("Error loading admin parameters:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Operations
  async function handleAction(action: string, id?: string, extraData?: any) {
    try {
      const res = await fetch("/api/content/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, ...extraData }),
      });
      if (res.ok) {
        loadDashboardData(); // reload
        if (editingId) setEditingId(null);
      }
    } catch (e) {
      console.error(`Error performing admin action ${action}:`, e);
    }
  }

  // Handle Ingest Mock Submit
  async function handleIngestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ingestTitle.trim() || !ingestBody.trim()) return;

    await handleAction("ingest_mock", undefined, {
      title: ingestTitle,
      body: ingestBody,
      specialtyTags: [ingestSpecialty],
      topicTags: [ingestSpecialty, "Ingestion"],
    });

    setIngestTitle("");
    setIngestBody("");
  }

  // Open Edit panel
  function startEdit(item: ContentItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditBody(item.body);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c100e] text-[#dee4e0] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#5cdbc2] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#bccac4]">Loading Admin Console...</p>
      </div>
    );
  }

  const drafts = data?.contentItems.filter((i) => i.status === "draft") || [];
  const published = data?.contentItems.filter((i) => i.status === "published") || [];

  return (
    <div className="min-h-screen bg-[#0c100e] text-[#dee4e0] font-sans pb-20">
      {/* ─── Top Navigation Bar ─── */}
      <nav className="bg-[#131916] border-b border-[#3d4946]/40 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#5cdbc2] text-2xl font-bold">🛡</span>
            <span className="text-white font-bold text-lg tracking-tight font-headline-md">
              Mediverse Medical OS Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#bccac4]">
            <span>Active Session:</span>
            <span className="text-[#5cdbc2] font-semibold">Tutor Console</span>
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
        </div>
      </nav>

      {/* ─── Dashboard Content ─── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold text-white font-headline-md">System Moderation & Publishing Console</h1>
          <p className="text-sm text-[#bccac4]">Approve ingested medical clinical literature, moderate safety flags, and view active users.</p>
        </div>

        {/* ─── Metrics Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
          <div className="p-5 rounded-2xl bg-[#131916] border border-[#3d4946] shadow-sm">
            <div className="text-xl mb-1">📝</div>
            <p className="text-2xl font-bold text-white font-headline-lg">{data?.stats?.draftCount}</p>
            <p className="text-xs text-[#bccac4] uppercase tracking-wider font-semibold">Pending Drafts</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#131916] border border-[#3d4946] shadow-sm">
            <div className="text-xl mb-1">📚</div>
            <p className="text-2xl font-bold text-white font-headline-lg">{data?.stats?.publishedCount}</p>
            <p className="text-xs text-[#bccac4] uppercase tracking-wider font-semibold">Published Items</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#131916] border border-[#3d4946] shadow-sm">
            <div className="text-xl mb-1">👥</div>
            <p className="text-2xl font-bold text-white font-headline-lg">{data?.stats?.totalUsers}</p>
            <p className="text-xs text-[#bccac4] uppercase tracking-wider font-semibold">Total Students</p>
          </div>
          <div className={`p-5 rounded-2xl border shadow-sm transition-colors ${
            data?.stats?.flaggedCount && data?.stats?.flaggedCount > 0
              ? "bg-red-950/20 border-red-500/30 text-red-200 animate-pulse"
              : "bg-[#131916] border-[#3d4946]"
          }`}>
            <div className="text-xl mb-1">🚨</div>
            <p className="text-2xl font-bold text-white font-headline-lg">{data?.stats?.flaggedCount}</p>
            <p className="text-xs uppercase tracking-wider font-semibold">Flagged Moderation Alerts</p>
          </div>
        </div>

        {/* ─── Admin Split Dashboard Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: Ingest & Content queue */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ingest Simulation Form */}
            <div className="p-6 rounded-2xl bg-[#131916] border border-[#3d4946] space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                📥 Simulate Clinical Ingestion Task
              </h2>
              <p className="text-xs text-[#bccac4]">Simulates automatic literature imports. Submitting creates a draft in the review queue below.</p>
              
              <form onSubmit={handleIngestSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Title of clinical trial/guidelines..."
                      value={ingestTitle}
                      onChange={(e) => setIngestTitle(e.target.value)}
                      className="w-full bg-[#0c100e] border border-[#3d4946] text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                      id="ingest-title"
                    />
                  </div>
                  <div>
                    <select
                      value={ingestSpecialty}
                      onChange={(e) => setIngestSpecialty(e.target.value)}
                      className="w-full bg-[#0c100e] border border-[#3d4946] text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                      id="ingest-specialty"
                    >
                      <option value="Pharmacology">Pharmacology</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Anatomy">Anatomy</option>
                      <option value="General Surgery">General Surgery</option>
                    </select>
                  </div>
                </div>
                <div>
                  <textarea
                    placeholder="Body text of medical article..."
                    value={ingestBody}
                    onChange={(e) => setIngestBody(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0c100e] border border-[#3d4946] text-white text-xs p-3 rounded-xl outline-none"
                    id="ingest-body"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0fa891] hover:bg-[#5cdbc2] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  id="ingest-submit-btn"
                >
                  Ingest Draft Item
                </button>
              </form>
            </div>

            {/* Content Review Queue (Drafts) */}
            <div className="p-6 rounded-2xl bg-[#131916] border border-[#3d4946] space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                ✍ Content Review Queue (Drafts)
              </h2>
              
              {editingId && (
                <div className="p-4 bg-[#0c100e] border border-[#5cdbc2]/30 rounded-xl space-y-3" id="edit-draft-panel">
                  <h3 className="text-xs uppercase text-[#5cdbc2] font-bold">Edit Draft Details</h3>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#131916] border border-[#3d4946] text-white text-xs p-2.5 rounded-xl outline-none"
                    id="edit-title-input"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={3}
                    className="w-full bg-[#131916] border border-[#3d4946] text-white text-xs p-2.5 rounded-xl outline-none"
                    id="edit-body-input"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction("edit", editingId, { title: editTitle, body: editBody })}
                      className="px-4 py-2 bg-[#0fa891] text-black font-bold text-xs rounded-lg hover:bg-[#5cdbc2] transition-colors"
                      id="save-edit-btn"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4" id="drafts-list">
                {drafts.map((item) => (
                  <div key={item.id} className="p-4 bg-[#0c100e] border border-[#3d4946] rounded-xl flex flex-col sm:flex-row justify-between gap-4 data-draft-item">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#131916] border border-[#3d4946] text-[#bccac4] text-[9px] font-bold rounded uppercase">
                          {item.specialtyTags?.join(", ") || "General"}
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold uppercase">Pending Draft</span>
                      </div>
                      <h4 className="text-sm font-bold text-white draft-title">{item.title}</h4>
                      <p className="text-xs text-[#bccac4] line-clamp-2">{item.body}</p>
                    </div>

                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                      <button
                        onClick={() => handleAction("approve", item.id)}
                        className="px-4 py-2 bg-[#0fa891] hover:bg-[#5cdbc2] text-black font-semibold text-xs rounded-lg transition-colors btn-approve"
                      >
                        Approve & Publish
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleAction("reject", item.id)}
                          className="flex-1 px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-[#ffb4ab] border border-red-500/20 font-semibold text-xs rounded-lg transition-colors btn-reject"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {drafts.length === 0 && (
                  <p className="text-center text-xs text-[#bccac4] italic py-6">No pending drafts in the review queue.</p>
                )}
              </div>
            </div>

            {/* Published Content Feed */}
            <div className="p-6 rounded-2xl bg-[#131916] border border-[#3d4946] space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                📖 Published Literature Feed
              </h2>
              
              <div className="space-y-3" id="published-list">
                {published.map((item) => (
                  <div key={item.id} className="p-4 bg-[#0c100e]/50 border border-[#3d4946]/50 rounded-xl flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-[#131916] border border-[#3d4946]/30 text-[#bccac4] text-[9px] font-bold rounded uppercase">
                        {item.specialtyTags?.join(", ") || "General"}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-[11px] text-[#bccac4]/60">Published on {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "—"}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-[#5cdbc2] text-[10px] font-bold uppercase rounded border border-emerald-500/20 shrink-0">
                      Live in Feed
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Moderation alerts, streaks, logs */}
          <div className="space-y-6">
            
            {/* Moderation Flags Queue */}
            <div className="p-6 rounded-2xl bg-[#131916] border border-[#3d4946] space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                🚨 Moderation Flags Queue
              </h2>
              
              <div className="space-y-3" id="flagged-messages-list">
                {data?.flaggedMessages?.map((msg) => (
                  <div key={msg.id} className="p-4 bg-red-950/10 border border-red-500/20 rounded-xl space-y-2 data-flagged-message">
                    <div className="flex justify-between items-center text-[10px] text-[#ffb4ab] font-bold uppercase tracking-wider">
                      <span>⚠ Unsafe Clinical Request</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-white italic">"{msg.content}"</p>
                    <button
                      onClick={() => handleAction("clear_flag", msg.id)}
                      className="w-full py-1.5 bg-[#0fa891]/20 hover:bg-[#5cdbc2]/30 border border-[#0fa891]/30 text-[#5cdbc2] font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors"
                      data-testid="resolve-flag-btn"
                    >
                      Resolve & Clear Flag
                    </button>
                  </div>
                ))}

                {data?.flaggedMessages.length === 0 && (
                  <p className="text-center text-xs text-[#bccac4] italic py-4">No moderation flags active.</p>
                )}
              </div>
            </div>

            {/* Ingestion Monitor Logs */}
            <div className="p-6 rounded-2xl bg-[#131916] border border-[#3d4946] space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                ⚙ Ingestion Task Monitor
              </h2>
              
              <div className="space-y-3" id="ingestion-sources-list">
                {data?.ingestionSources?.map((source, idx) => (
                  <div key={idx} className="p-3 bg-[#0c100e] border border-[#3d4946]/50 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{source.source}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-[#5cdbc2] text-[9px] font-bold uppercase rounded border border-emerald-500/20">
                        Success
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#bccac4]">
                      <span>Imported: <strong className="text-white">{source.successCount} items</strong></span>
                      <span>Last: {new Date(source.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student User Directory */}
            <div className="p-6 rounded-2xl bg-[#131916] border border-[#3d4946] space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                👥 Registered Student Directory
              </h2>
              
              <div className="space-y-3" id="students-list">
                {data?.users?.map((student) => (
                  <div key={student.id} className="p-3 bg-[#0c100e] border border-[#3d4946]/50 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white truncate max-w-[150px]">{student.email}</span>
                      <span className="text-[10px] text-[#5cdbc2] font-mono font-bold">🔥 {student.streak} Streak</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-[#bccac4]">
                      <span>Exam: <strong className="text-[#dee4e0]">{student.examTarget.toUpperCase()}</strong></span>
                      <span>Last Active: {student.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
