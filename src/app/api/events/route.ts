import { NextRequest, NextResponse } from "next/server";
import { ALL_EVENTS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const severity = searchParams.get("severity") || "all";

  // Simulate realistic network jitter (150ms - 550ms) so out-of-order responses happen naturally
  const delay = 150 + Math.floor(Math.random() * 400);
  await new Promise((r) => setTimeout(r, delay));

  const filtered = ALL_EVENTS.filter((evt) => {
    const matchesSeverity = severity === "all" || evt.severity === severity;
    const matchesSearch =
      !search ||
      evt.title.toLowerCase().includes(search) ||
      evt.service.toLowerCase().includes(search) ||
      evt.id.toLowerCase().includes(search);
    return matchesSeverity && matchesSearch;
  });

  return NextResponse.json({
    events: filtered,
    total: filtered.length,
  });
}
