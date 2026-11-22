"use client";

/**
 * PLANTED TRAPS IN THIS FILE:
 * 1. Entire page is a single 'use client' component (no RSC usage).
 * 2. Cascading useEffect hooks sync search/severity with URL searchParams,
 *    causing duplicate fetches, missing debouncing, and broken browser Back button.
 * 3. Streaming fetch loop lacks AbortController / request-ID guards: rapidly clicking
 *    Event A then Event B interleaves tokens from both streams into `summaryText`.
 * 4. `summaryText` state lives at the top-level page component, forcing all 500
 *    event rows and HeavyPayloadFormatter to re-render on every single streamed token.
 */

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SystemEvent } from "@/lib/mockData";
import { HeavyPayloadFormatter } from "@/components/HeavyPayloadFormatter";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [severity, setSeverity] = useState(searchParams.get("severity") || "all");
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const renderCount = useRef(0);
  renderCount.current += 1;

  // Trap A: Effect 1 pushes local state into URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (severity !== "all") params.set("severity", severity);
    router.push(`/?${params.toString()}`);
  }, [search, severity, router]);

  // Trap B: Effect 2 also listens to searchParams and overwrites state (feedback loop)
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSeverity(searchParams.get("severity") || "all");
  }, [searchParams]);

  // Trap C: Un-debounced fetch with no race-condition cancellation
  useEffect(() => {
    setLoadingEvents(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (severity !== "all") params.set("severity", severity);

    fetch(`/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoadingEvents(false);
      });
  }, [search, severity]);

  // Trap D: Uncancelled streaming reader causes cross-event token bleed
  async function handleSelectEvent(evt: SystemEvent) {
    setSelectedEvent(evt);
    setSummaryText("");
    setIsStreaming(true);

    const res = await fetch(`/api/stream-summary?eventId=${evt.id}`);
    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setSummaryText((prev) => prev + chunk);
    }

    setIsStreaming(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", height: "100vh", overflow: "hidden" }}>
      {/* Left Pane: Filters & 500-Row Event Feed */}
      <div style={{ borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #1e293b", display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by service, title, or ID..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f8fafc",
            }}
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f8fafc",
            }}
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Page renders: {renderCount.current}</span>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {loadingEvents && <div style={{ padding: "12px", color: "#94a3b8" }}>Loading events...</div>}
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => handleSelectEvent(evt)}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #1e293b",
                cursor: "pointer",
                background: selectedEvent?.id === evt.id ? "#1e293b" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{evt.title}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  {evt.id} · {evt.timestamp}
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background:
                    evt.severity === "critical" ? "#7f1d1d" : evt.severity === "warning" ? "#78350f" : "#1e3a8a",
                  color: "#f8fafc",
                }}
              >
                {evt.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Streaming AI Incident Drawer */}
      <div style={{ padding: "20px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>
            {selectedEvent ? `Analysis: ${selectedEvent.id}` : "Incident Summary"}
          </h2>
          {isStreaming && <span style={{ fontSize: "12px", color: "#38bdf8" }}>Streaming tokens...</span>}
        </div>

        <HeavyPayloadFormatter
          rawPayload={selectedEvent?.rawPayload || "{}"}
          summaryText={summaryText}
        />
      </div>
    </div>
  );
}
