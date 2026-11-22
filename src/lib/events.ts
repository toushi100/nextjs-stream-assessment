import { ALL_EVENTS, type SystemEvent } from "@/lib/mockData";

export function filterEvents(search: string, severity: string): SystemEvent[] {
  const query = search.toLowerCase().trim();
  return ALL_EVENTS.filter((evt) => {
    const matchesSeverity = severity === "all" || evt.severity === severity;
    const matchesSearch =
      !query ||
      evt.title.toLowerCase().includes(query) ||
      evt.service.toLowerCase().includes(query) ||
      evt.id.toLowerCase().includes(query);
    return matchesSeverity && matchesSearch;
  });
}
