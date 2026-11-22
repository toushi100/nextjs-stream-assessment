"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface FilterBarProps {
  search: string;
  severity: string;
}

function buildQuery(search: string, severity: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (severity !== "all") params.set("severity", severity);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export const FilterBar = memo(function FilterBar({ search, severity }: FilterBarProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(search);
  const renders = useRef(0);
  renders.current += 1;

  // URL is the source of truth: mirror committed params back into the draft
  // (covers mount, debounce completion, and Back/Forward navigation).
  useEffect(() => {
    setDraft(search);
  }, [search]);

  // Push the draft to the URL, debounced. The guard prevents navigating on
  // mount or when the draft already matches the committed param.
  useEffect(() => {
    if (draft === search) return;
    const timer = setTimeout(() => {
      router.push(buildQuery(draft, severity), { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, search, severity, router]);

  function handleSeverity(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (next === severity) return;
    router.push(buildQuery(draft, next), { scroll: false });
  }

  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
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
        onChange={handleSeverity}
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
      <span style={{ fontSize: "12px", color: "#64748b" }}>Filter renders: {renders.current}</span>
    </div>
  );
});
