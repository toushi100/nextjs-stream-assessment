"use client";

import { useEffect, useRef, useState } from "react";
import type { SystemEvent } from "@/lib/mockData";
import { HeavyPayloadFormatter } from "@/components/HeavyPayloadFormatter";

function SummaryOutput({ text }: { text: string }) {
  return (
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
      {text || "Select an event to generate an AI incident analysis..."}
    </div>
  );
}

export function SummaryPanel({ event, filtersKey }: { event: SystemEvent | null; filtersKey: string }) {
  const [summaryText, setSummaryText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!event) {
      setSummaryText("");
      setIsStreaming(false);
      return;
    }

    const reqId = ++reqIdRef.current;
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    setSummaryText("");
    setIsStreaming(true);

    (async () => {
      try {
        const res = await fetch(`/api/stream-summary?eventId=${event.id}`, {
          signal: controller.signal,
        });
        if (!res.body) return;
        reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done || reqIdRef.current !== reqId || controller.signal.aborted) break;
          const chunk = decoder.decode(value, { stream: true });
          setSummaryText((prev) => prev + chunk);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      } finally {
        if (reqIdRef.current === reqId) setIsStreaming(false);
      }
    })();

    return () => {
      controller.abort();
      reader?.cancel().catch(() => {});
    };
  }, [event?.id, filtersKey]);

  return (
    <div style={{ padding: "20px", overflowY: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          {event ? `Analysis: ${event.id}` : "Incident Summary"}
        </h2>
        {isStreaming && <span style={{ fontSize: "12px", color: "#38bdf8" }}>Streaming tokens...</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SummaryOutput text={summaryText} />
        <HeavyPayloadFormatter rawPayload={event?.rawPayload ?? "{}"} />
      </div>
    </div>
  );
}
