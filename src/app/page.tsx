import { filterEvents } from "@/lib/events";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; severity?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const severity = params.severity ?? "all";
  const events = filterEvents(search, severity);

  return <DashboardClient events={events} search={search} severity={severity} />;
}
