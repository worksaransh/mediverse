"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@mediverse/ui";

interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  examTarget: string | null;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  isJoined: boolean;
  role: string | null;
}

interface GroupMessage {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export default function CommunityPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  async function loadGroups() {
    setLoading(true);
    try {
      const res = await fetch("/api/study-groups");
      if (res.ok) setGroups((await res.json()).groups || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isPublic: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create group");
      }
      setName("");
      setDescription("");
      await loadGroups();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function joinGroup(groupId: string) {
    const res = await fetch(`/api/study-groups/${groupId}/join`, { method: "POST" });
    if (res.ok) {
      await loadGroups();
      openGroup(groupId);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to join group");
    }
  }

  async function openGroup(groupId: string) {
    setActiveGroupId(groupId);
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/study-groups/${groupId}/messages`);
      if (res.ok) {
        setMessages((await res.json()).messages || []);
      } else {
        setMessages([]);
      }
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendMessage() {
    if (!activeGroupId || !newMessage.trim()) return;
    const res = await fetch(`/api/study-groups/${activeGroupId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    });
    if (res.ok) {
      setNewMessage("");
      openGroup(activeGroupId);
    }
  }

  const activeGroup = groups.find((g) => g.id === activeGroupId);

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
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-sm text-[#bccac4] mt-1">Join study groups and discuss with peers preparing for the same exams.</p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Card className="border-[#3d4946] bg-[#171d1b] p-6">
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Create a Study Group</h2>
          <form onSubmit={createGroup} className="grid gap-4 md:grid-cols-3 items-end">
            <label className="flex flex-col gap-1 text-xs text-[#86948f]">
              Name
              <input
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#86948f] md:col-span-2">
              Description
              <input
                className="bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className="md:col-span-3">
              <Button type="submit" variant="primary" disabled={creating}>
                {creating ? "Creating…" : "Create Group"}
              </Button>
            </div>
          </form>
        </Card>

        {activeGroup && (
          <Card className="border-[#3d4946] bg-[#171d1b] p-6">
            <h2 className="text-sm font-bold text-white mb-4">{activeGroup.name}</h2>
            {loadingMessages ? (
              <p className="text-sm text-[#bccac4]">Loading messages…</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <p className="text-xs text-[#86948f]">No messages yet — start the conversation.</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="p-3 bg-[#0f1513] border border-[#3d4946] rounded-lg">
                      <p className="text-xs font-bold text-[#5cdbc2]">{m.authorName}</p>
                      <p className="text-sm text-[#dee4e0]">{m.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#0f1513] border border-[#3d4946] rounded-lg px-3 py-2 text-sm text-white"
                placeholder="Write a message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <Button variant="primary" onClick={sendMessage}>
                Send
              </Button>
            </div>
          </Card>
        )}

        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Study Groups</h2>
          {loading ? (
            <p className="text-sm text-[#bccac4]">Loading…</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-[#bccac4]">No groups yet — create the first one above.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((g) => (
                <Card key={g.id} className="border-[#3d4946] bg-[#171d1b]">
                  <p className="font-bold text-white text-sm">{g.name}</p>
                  {g.description && <p className="text-xs text-[#bccac4] mt-1">{g.description}</p>}
                  <p className="text-xs text-[#86948f] mt-2">
                    {g.memberCount}/{g.maxMembers} members
                  </p>
                  <div className="mt-3">
                    {g.isJoined ? (
                      <Button size="sm" variant="secondary" onClick={() => openGroup(g.id)}>
                        Open Chat
                      </Button>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => joinGroup(g.id)}>
                        Join Group
                      </Button>
                    )}
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
