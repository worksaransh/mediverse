"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@mediverse/ui";

interface ResearchProject {
  id: string;
  title: string;
  abstract: string;
  status: string;
  tags: string[];
  maxCollaborators: number;
  collaboratorCount: number;
  ownerName: string;
  isJoined: boolean;
}

export default function ResearchPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/research");
      if (res.ok) setProjects((await res.json()).projects || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, abstract }),
      });
      if (res.ok) {
        setTitle("");
        setAbstract("");
        await loadProjects();
      } else {
        const data = await res.json().catch(() => ({}));
        setNotice(data.error || "Failed to create project.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function joinProject(projectId: string) {
    const res = await fetch(`/api/research/${projectId}/join`, { method: "POST" });
    if (res.ok) {
      setNotice("You've joined the project!");
      await loadProjects();
    } else {
      const data = await res.json().catch(() => ({}));
      setNotice(data.error || "Failed to join project.");
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

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Research Collaboration</h1>
          <p className="text-sm text-[#bccac4] mt-1">Start or join student/faculty research projects.</p>
        </div>

        {notice && (
          <div className="p-3 bg-[#5cdbc2]/10 border border-[#5cdbc2]/20 rounded-lg text-xs text-[#5cdbc2]">
            {notice}
          </div>
        )}

        <Card className="border-[#3d4946] bg-[#171d1b] p-6">
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Start a Research Project</h2>
          <form onSubmit={createProject} className="grid gap-4">
            <label className="flex flex-col gap-1 text-xs text-[#86948f]">
              Title
              <input
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#86948f]">
              Abstract
              <textarea
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white min-h-[80px]"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
              />
            </label>
            <div>
              <Button type="submit" variant="primary" disabled={creating}>
                {creating ? "Creating…" : "Create Project"}
              </Button>
            </div>
          </form>
        </Card>

        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Open Projects</h2>
          {loading ? (
            <p className="text-sm text-[#bccac4]">Loading…</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-[#bccac4]">No projects yet — create the first one above.</p>
          ) : (
            <div className="grid gap-4">
              {projects.map((p) => (
                <Card key={p.id} className="border-[#3d4946] bg-[#171d1b]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-white text-sm">{p.title}</p>
                      <p className="text-xs text-[#86948f]">by {p.ownerName} · {p.status}</p>
                      <p className="text-xs text-[#bccac4] mt-2">{p.abstract}</p>
                      <p className="text-xs text-[#86948f] mt-2">
                        {p.collaboratorCount}/{p.maxCollaborators} collaborators
                      </p>
                    </div>
                    <div className="shrink-0">
                      {p.isJoined ? (
                        <span className="text-xs text-[#86948f]">Joined</span>
                      ) : p.status === "recruiting" ? (
                        <Button size="sm" variant="primary" onClick={() => joinProject(p.id)}>
                          Join
                        </Button>
                      ) : (
                        <span className="text-xs text-[#86948f]">Closed</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
