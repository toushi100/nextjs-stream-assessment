
import { headers } from "next/headers";
import { DashboardClient } from "@/components/DashboardClient";
import type { SystemEvent } from "@/lib/mockData";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; severity?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const severity = params.severity ?? "all";

  // Server Components need an absolute URL; derive it from the incoming request.
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (severity !== "all") qs.set("severity", severity);

  const res = await fetch(`${proto}://${host}/api/events?${qs.toString()}`, {
    cache: "no-store",
  });
  console.debug("res", res);
  const data = (await res.json()) as { events: SystemEvent[]; total: number };

  return <DashboardClient events={data.events} search={search} severity={severity} />;
}
