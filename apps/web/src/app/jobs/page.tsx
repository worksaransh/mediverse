"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@mediverse/ui";

interface JobListing {
  id: string;
  title: string;
  organization: string;
  location: string | null;
  listingType: string;
  description: string;
  requirements: string | null;
  applicationUrl: string | null;
}

interface Application {
  id: string;
  jobId: string;
  status: string;
  listing: JobListing | null;
}

const TYPE_LABELS: Record<string, string> = {
  internship: "Internship",
  job: "Job",
  research_assistantship: "Research Assistantship",
};

export default function JobsPage() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [listingsRes, appsRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/jobs/applications"),
      ]);
      if (listingsRes.ok) setListings((await listingsRes.json()).listings || []);
      if (appsRes.ok) setApplications((await appsRes.json()).applications || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  async function apply(jobId: string) {
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      setNotice("Application submitted!");
      await loadAll();
    } else {
      const data = await res.json().catch(() => ({}));
      setNotice(data.error || "Failed to apply.");
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
          <h1 className="text-2xl font-bold text-white">Career Marketplace</h1>
          <p className="text-sm text-[#bccac4] mt-1">Jobs, internships, and research assistantships for medical & science students.</p>
        </div>

        {notice && (
          <div className="p-3 bg-[#5cdbc2]/10 border border-[#5cdbc2]/20 rounded-lg text-xs text-[#5cdbc2]">
            {notice}
          </div>
        )}

        {applications.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Your Applications</h2>
            <div className="grid gap-3">
              {applications.map((a) => (
                <Card key={a.id} className="border-[#3d4946] bg-[#171d1b]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{a.listing?.title || "Listing removed"}</p>
                      <p className="text-xs text-[#86948f]">{a.listing?.organization}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#5cdbc2] uppercase">{a.status}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Open Listings</h2>
          {loading ? (
            <p className="text-sm text-[#bccac4]">Loading…</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-[#bccac4]">No listings available right now.</p>
          ) : (
            <div className="grid gap-4">
              {listings.map((job) => (
                <Card key={job.id} className="border-[#3d4946] bg-[#171d1b]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#5cdbc2] uppercase">
                        {TYPE_LABELS[job.listingType] || job.listingType}
                      </p>
                      <p className="font-bold text-white text-sm mt-1">{job.title}</p>
                      <p className="text-xs text-[#86948f]">
                        {job.organization}
                        {job.location ? ` · ${job.location}` : ""}
                      </p>
                      <p className="text-xs text-[#bccac4] mt-2">{job.description}</p>
                    </div>
                    <div className="shrink-0">
                      {appliedJobIds.has(job.id) ? (
                        <span className="text-xs text-[#86948f]">Applied</span>
                      ) : (
                        <Button size="sm" variant="primary" onClick={() => apply(job.id)}>
                          Apply
                        </Button>
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
