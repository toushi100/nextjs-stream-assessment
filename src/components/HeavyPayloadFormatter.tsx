"use client";

import React, { memo } from "react";

/**
 * Simulates an expensive markdown / syntax highlighting component.
 * Memoized so the ~12ms of synchronous formatting work only runs when
 * the payload actually changes — streamed token updates never reach it.
 */
export const HeavyPayloadFormatter = memo(function HeavyPayloadFormatter({ rawPayload }: { rawPayload: string }) {
  // Simulate ~12ms of synchronous formatting work per render
  const start = performance.now();
  let checksum = 0;
  while (performance.now() - start < 12) {
    checksum = (checksum + 1) % 1000;
  }

  return (
    <details open data-checksum={checksum}>
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
  );
});
