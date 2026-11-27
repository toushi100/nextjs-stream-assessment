"use client";

import { useCallback, useRef, useState } from "react";
import type { SystemEvent } from "@/lib/mockData";
import { FilterBar } from "@/components/FilterBar";
import { EventList } from "@/components/EventList";
import { SummaryPanel } from "@/components/SummaryPanel";

interface DashboardClientProps {
  events: SystemEvent[];
  search: string;
  severity: string;

}

export function DashboardClient({ events, search, severity }: DashboardClientProps) {
  const renders = useRef(0);
  renders.current += 1;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const selectedEvent = events.find((e) => e.id === selectedId) ?? null;
  const filtersKey = `${search}|${severity}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          borderRight: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <FilterBar search={search} severity={severity} renders={renders} />
        <EventList events={events} selectedId={selectedId} onSelect={handleSelect} />
      </div>
      <SummaryPanel event={selectedEvent} filtersKey={filtersKey} />
    </div>
  );
}
