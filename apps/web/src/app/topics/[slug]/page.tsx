import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { createDb } from "@mediverse/db";

// Helper to map dynamic slugs to uppercase subjects in DB
function mapSlugToSubject(slug: string): string {
  const lower = slug.toLowerCase();
  if (lower === "pharmacology") return "Pharmacology";
  if (lower === "pathology") return "Pathology";
  if (lower === "anatomy") return "Anatomy";
  if (lower === "biochemistry") return "Biochemistry";
  if (lower === "surgery") return "General Surgery";
  return "Pharmacology"; // Fallback default
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = mapSlugToSubject(slug);
  return {
    title: `Master ${subject}: NEET PG & MBBS Preparation - MedStudy OS`,
    description: `High-yield ${subject} study guides, adaptive practice questions, and AI mentor sessions designed to boost your medical exam preparation.`,
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const subject = mapSlugToSubject(slug);
  
  const db = createDb();
  
  // 1. Fetch all literature articles and filter by subject
  const allItems = await db.query.contentItems.findMany() || [];
  const filteredItems = allItems.filter(
    (item: any) =>
      item.status === "published" &&
      item.specialtyTags?.some((tag: string) => tag.toLowerCase() === subject.toLowerCase())
  );

  // 2. Fetch all MCQs and filter by subject
  const allMcqs = await db.query.mcqs.findMany() || [];
  const filteredMcqs = allMcqs.filter(
    (m: any) => m.subject.toLowerCase() === subject.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans selection:bg-[#5cdbc2] selection:text-black">
      {/* Dynamic Header */}
      <header className="bg-[#0f1513] w-full top-0 sticky z-[100] border-b border-[#3d4946]/30 backdrop-blur-md">
        <nav className="flex items-center justify-between px-6 h-14 w-full max-w-[1024px] mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5cdbc2]" style={{ fontVariationSettings: "'FILL' 1" }}>
              clinical_notes
            </span>
            <Link href="/" className="font-bold text-lg text-[#5cdbc2] tracking-tight">Mediverse OS</Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm text-[#bccac4] hover:text-[#5cdbc2] transition-colors" href="/">Home</Link>
            <Link className="text-sm font-semibold text-[#5cdbc2]" href={`/topics/${slug}`}>{subject}</Link>
            <Link className="bg-[#5cdbc2] text-[#00382f] text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#7bf8dd] transition-all" href="/login">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content container */}
      <main className="max-w-[1024px] mx-auto px-6 py-12 space-y-12">
        {/* Dynamic Heading Hero section */}
        <section className="space-y-4 text-center md:text-left py-6">
          <div className="inline-flex items-center gap-2 bg-[#5cdbc2]/10 text-[#5cdbc2] px-3 py-1 rounded-full text-xs font-semibold">
            PROGRAMMATIC SEO CURRICULUM
          </div>
          <h1 id="topic-header" className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Master {subject} with Precision
          </h1>
          <p className="text-[#bccac4] text-md max-w-2xl">
            Access expert-verified clinical guidelines, recent research summaries, and adaptive {subject} multiple choice questions updated for NEET PG 2027 and final MBBS exams.
          </p>
        </section>

        {/* Practice Q-Bank Preview list */}
        <section id="mcq-preview-section" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#3d4946]/30 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5cdbc2]">quiz</span>
              Sample NEET PG Practice Questions ({filteredMcqs.length})
            </h2>
            <Link href="/login" className="text-xs text-[#5cdbc2] hover:underline font-semibold">
              Unlock All Qs →
            </Link>
          </div>

          <div className="grid gap-4">
            {filteredMcqs.length > 0 ? (
              filteredMcqs.map((q: any) => (
                <div key={q.id} className="p-6 bg-[#171d1b] border border-[#3d4946]/20 rounded-2xl space-y-4 dynamic-mcq-card">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5cdbc2] bg-[#5cdbc2]/10 px-2 py-0.5 rounded">
                      Level {q.difficulty || 3}
                    </span>
                    <span className="text-[10px] text-[#bccac4]">{q.subject}</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-relaxed">{q.question}</p>
                  
                  {/* Options List */}
                  <div className="grid gap-2">
                    {q.options?.map((opt: any) => (
                      <div key={opt.key} className="px-4 py-2.5 bg-[#0f1513] border border-[#3d4946] rounded-xl text-xs flex gap-2">
                        <span className="font-bold text-[#5cdbc2]">{opt.key}.</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#5cdbc2]/5 border border-[#5cdbc2]/10 rounded-xl text-xs text-[#bccac4] leading-relaxed">
                    <span className="font-bold text-white">Explanation Preview:</span> {q.explanation}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#bccac4]">No preview questions found for this topic.</p>
            )}
          </div>
        </section>

        {/* High Yield Literature Summaries */}
        <section id="literature-preview-section" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#3d4946]/30 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5cdbc2]">article</span>
              High-Yield Literature & Guidelines ({filteredItems.length})
            </h2>
            <Link href="/login" className="text-xs text-[#5cdbc2] hover:underline font-semibold">
              Unlock Summaries →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item: any) => (
                <div key={item.id} className="p-6 bg-[#171d1b] border border-[#3d4946]/20 rounded-2xl flex flex-col justify-between h-48 dynamic-article-card">
                  <div>
                    <h3 className="text-md font-bold text-white line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-[#bccac4] mt-2 line-clamp-3">{item.body}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[#3d4946]/20 mt-4 text-[10px]">
                    <span className="text-[#5cdbc2] font-semibold">{item.specialtyTags?.join(", ")}</span>
                    <span className="text-[#bccac4]">Source: PubMed</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#bccac4]">No current publications indexed for this topic.</p>
            )}
          </div>
        </section>

        {/* Call to Action banner */}
        <section className="bg-gradient-to-r from-[#171d1b] to-[#252b29] border border-[#3d4946]/30 rounded-3xl p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">Reclaim Your Study Hours</h2>
          <p className="text-sm text-[#bccac4] max-w-lg mx-auto">
            Get personalized study paths, full RAG citation answers, streak achievements, and adaptive practice sets built exactly to target your weaknesses.
          </p>
          <Link
            id="cta-join-now"
            href="/login"
            className="inline-block bg-[#5cdbc2] text-[#00382f] px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#7bf8dd] transition-all"
          >
            Join Mediverse Free
          </Link>
        </section>
      </main>

      {/* Dynamic Footer */}
      <footer className="bg-[#090f0e] text-[#bccac4] py-12 border-t border-[#3d4946]/10">
        <div className="max-w-[1024px] mx-auto px-6 text-center space-y-4">
          <div className="flex justify-center gap-6 text-xs font-bold text-[#bccac4]">
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/pharmacology">Pharmacology</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/pathology">Pathology</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/anatomy">Anatomy</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/biochemistry">Biochemistry</Link>
            <Link className="hover:text-[#5cdbc2] transition-colors" href="/topics/surgery">General Surgery</Link>
          </div>
          <p className="text-xs">
            © 2026 Mediverse. Precision Operating System for Medical Prep in India.
          </p>
        </div>
      </footer>
    </div>
  );
}
