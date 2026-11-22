"use client";

import React from "react";

/**
 * Simulates an expensive markdown / syntax highlighting component.
 * Intentionally un-memoized in starter code so parent re-renders cause noticeable lag.
 */
export function HeavyPayloadFormatter({ rawPayload, summaryText }: { rawPayload: string; summaryText: string }) {
  // Simulate ~12ms of synchronous formatting work per render
  const start = performance.now();
  let checksum = 0;
  while (performance.now() - start < 12) {
    checksum = (checksum + 1) % 1000;
  }

  return (
    <div data-checksum={checksum} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          background: "#1e293b",
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #334155",
          whiteSpace: "pre-wrap",
          lineHeight: 1.55,
          minHeight: "180px",
        }}
      >
        {summaryText || "Select an event to generate an AI incident analysis..."}
      </div>
      <details open>
        <summary style={{ cursor: "pointer", color: "#94a3b8", fontSize: "13px" }}>Raw Telemetry Payload</summary>
        <pre
          style={{
            background: "#020617",
            padding: "12px",
            borderRadius: "6px",
            fontSize: "12px",
            overflowX: "auto",
          }}
        >
          {rawPayload}
        </pre>
      </details>
    </div>
  );
}
