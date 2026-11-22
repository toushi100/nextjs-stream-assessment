"use client";

import { memo, useRef } from "react";
import type { SystemEvent } from "@/lib/mockData";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#7f1d1d",
  warning: "#78350f",
  info: "#1e3a8a",
};

const EventRow = memo(function EventRow({
  evt,
  selected,
  onSelect,
}: {
  evt: SystemEvent;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(evt.id)}
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
        background: selected ? "#1e293b" : "transparent",
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
          background: SEVERITY_COLORS[evt.severity] ?? "#1e3a8a",
          color: "#f8fafc",
        }}
      >
        {evt.severity}
      </span>
    </div>
  );
});

export const EventList = memo(function EventList({
  events,
  selectedId,
  onSelect,
}: {
  events: SystemEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const renders = useRef(0);
  renders.current += 1;

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      <div style={{ padding: "4px 16px", fontSize: "12px", color: "#64748b" }}>
        List renders: {renders.current}
      </div>
      {events.length === 0 && (
        <div style={{ padding: "12px 16px", color: "#94a3b8" }}>No events match the current filters.</div>
      )}
      {events.map((evt) => (
        <EventRow key={evt.id} evt={evt} selected={evt.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
});
