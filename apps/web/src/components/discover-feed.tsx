"use client";

import React, { useEffect, useState, useRef } from "react";

interface ContentItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  summary: string | null;
  sourceUrl: string | null;
  audienceTags: string[];
  specialtyTags: string[];
  topicTags: string[];
  metadata: any;
  publishedAt: string | null;
}

// Map subject names to colors to fit the Stitch style system
const getSubjectColor = (subject: string): string => {
  const s = subject.toLowerCase();
  if (s.includes("pharmacology")) return "text-[#5cdbc2]";
  if (s.includes("cardiology") || s.includes("medicine")) return "text-primary";
  return "text-[#ffb4a1]"; // tertiary tint
};

export function DiscoverFeed() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch a page of feed items
  async function fetchFeed(pageNum: number) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?page=${pageNum}&limit=5`);
      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();
      
      setItems((prev) => {
        // filter duplicates
        const existingIds = new Set(prev.map(i => i.id));
        const uniqueNew = data.items.filter((item: ContentItem) => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });
      setHasMore(data.hasMore);
    } catch (e) {
      console.error("[Feed UI] Error loading feed:", e);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchFeed(1);
  }, []);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(nextPage);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, page]);

  return (
    <div className="space-y-6">
      {/* Feed list */}
      <div className="space-y-6">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>

      {/* Loading & End Indicators */}
      <div ref={observerTarget} className="py-8 flex justify-center text-center">
        {loading && (
          <div className="w-8 h-8 border-2 border-[#5cdbc2] border-t-transparent rounded-full animate-spin" />
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-xs font-label-caps text-[#86948f] tracking-widest uppercase">
            🎉 You are all caught up for today
          </p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-sm text-[#bccac4] italic">
            No recommendations matches yet. Add weak subjects in onboarding.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Individual Feed Card with Visibility & Dwell Tracking ───

function FeedCard({ item }: { item: ContentItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dwellStart = useRef<number | null>(null);
  const [impressed, setImpressed] = useState(false);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          // 1. Impression logging (trigger once per lifecycle)
          if (!impressed) {
            setImpressed(true);
            fetch("/api/feed/event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contentItemId: item.id,
                eventType: "content_viewed",
                metadata: { impression: true },
              }),
            }).catch(() => {});
          }

          // 2. Start dwell tracking
          dwellStart.current = Date.now();
        } else {
          // 3. Log dwell time on exit
          if (dwellStart.current !== null) {
            const dwellTime = Date.now() - dwellStart.current;
            dwellStart.current = null;

            // Only report dwell if student stayed longer than 1.5 seconds
            if (dwellTime > 1500) {
              fetch("/api/feed/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contentItemId: item.id,
                  eventType: "content_viewed",
                  metadata: { dwellTimeMs: dwellTime },
                }),
              }).catch(() => {});
            }
          }
        }
      },
      { threshold: 0.5 } // Trigger when at least 50% card is visible
    );

    observer.observe(cardEl);

    return () => {
      observer.disconnect();
      // Safe cleanup dwell tracking if unmounted while visible
      if (dwellStart.current !== null) {
        const dwellTime = Date.now() - dwellStart.current;
        if (dwellTime > 1500) {
          navigator.sendBeacon(
            "/api/feed/event",
            JSON.stringify({
              contentItemId: item.id,
              eventType: "content_viewed",
              metadata: { dwellTimeMs: dwellTime },
            })
          );
        }
      }
    };
  }, [impressed, item.id]);

  // Determine card design based on source/type
  const isVideo = item.type === "video";
  const isPubMed = item.type === "article" && item.metadata?.source?.toLowerCase() === "pubmed";

  // 1. Render Video Card
  if (isVideo) {
    const subject = item.specialtyTags[0] || "Pharmacology";
    return (
      <div
        ref={cardRef}
        data-testid={`feed-card-video-${item.id}`}
        className="feed-card bg-[#171d1b] border border-[#3d4946] rounded-2xl overflow-hidden hover:border-[#5cdbc2]/40 transition-all duration-300 shadow-sm"
      >
        <div className="relative h-48 w-full group cursor-pointer">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${item.metadata?.thumbnailUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"})`,
            }}
          />
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 bg-[#5cdbc2]/20 border border-[#5cdbc2] text-[#5cdbc2] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 bg-[#090f0e]/80 backdrop-blur text-white font-mono text-xs px-2 py-0.5 rounded">
            {item.metadata?.duration || "10:15"}
          </div>
        </div>
        <div className="p-5">
          <p className={`font-mono text-xs uppercase tracking-wider ${getSubjectColor(subject)} mb-1`}>
            {subject}
          </p>
          <h3 className="font-semibold text-lg text-white mb-2 leading-snug">
            {item.title}
          </h3>
          <p className="text-sm text-[#bccac4] line-clamp-2">
            {item.summary || item.body}
          </p>
        </div>
      </div>
    );
  }

  // 2. Render AI Summary / PubMed Card
  if (isPubMed) {
    return (
      <div
        ref={cardRef}
        data-testid={`feed-card-summary-${item.id}`}
        className="feed-card bg-[#171d1b] border border-[#3d4946] rounded-2xl overflow-hidden hover:border-[#5cdbc2]/40 transition-all duration-300 shadow-sm flex flex-col md:flex-row"
      >
        <div className="p-5 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#0fa891]/20 text-[#5cdbc2] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <span>✨</span> AI SUMMARY
            </span>
            <span className="border border-[#3d4946] text-[#bccac4] text-[10px] font-bold px-1.5 py-0.5 rounded">
              PUBMED
            </span>
            <span className="border border-[#3d4946] text-[#5cdbc2] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
              {item.specialtyTags[0]}
            </span>
          </div>
          <h3 className="font-semibold text-lg text-white mb-2 leading-snug">
            {item.title}
          </h3>
          <p className="text-sm text-[#bccac4] line-clamp-2">
            {item.summary || item.body}
          </p>
          <div className="mt-4 flex items-center gap-4 text-[#bccac4] font-mono text-[10px] uppercase tracking-wide">
            <span className="flex items-center gap-1">⏱ {item.metadata?.readTime || "5 min"} read</span>
            <span className="flex items-center gap-1">✔ Peer Reviewed</span>
          </div>
        </div>
        <div
          className="h-32 md:h-auto md:w-44 shrink-0 bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${item.metadata?.coverUrl || "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=400"})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#171d1b]/60 to-transparent md:hidden" />
        </div>
      </div>
    );
  }

  // 3. Render General Medical News Card
  return (
    <div
      ref={cardRef}
      data-testid={`feed-card-news-${item.id}`}
      className="feed-card bg-[#171d1b] border border-[#3d4946] rounded-2xl p-5 hover:border-[#5cdbc2]/40 transition-all duration-300 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="pr-4">
          <p className="font-mono text-xs uppercase tracking-wider text-[#ffb4a1] mb-1">
            {item.specialtyTags[0] || "Global Health"}
          </p>
          <h3 className="font-semibold text-lg text-white mb-2 leading-snug">
            {item.title}
          </h3>
          <p className="text-sm text-[#bccac4] line-clamp-2">
            {item.summary || item.body}
          </p>
        </div>
        <div
          className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-[#3d4946]"
          style={{
            backgroundImage: `url(${item.metadata?.coverUrl || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300"})`,
          }}
        />
      </div>
      <div className="mt-4 pt-4 border-t border-[#3d4946]/50 flex justify-between items-center">
        <span className="text-[#86948f] font-mono text-[10px] uppercase tracking-wider">
          {item.metadata?.publisher || "The Lancet"} • {item.metadata?.publishedAgo || "1h ago"}
        </span>
        <button className="text-[#5cdbc2] hover:bg-white/5 transition-colors p-1.5 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 10.742l4.63-2.316a3 3 0 10-.263-1.806l-4.63 2.316a3 3 0 110 3.611l4.63 2.316a3 3 0 10.263-1.806l-4.63-2.316a3 3 0 00-.381-.172z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
