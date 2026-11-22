export type Severity = "info" | "warning" | "critical";

export interface SystemEvent {
  id: string;
  timestamp: string;
  service: string;
  severity: Severity;
  title: string;
  rawPayload: string;
}

const SERVICES = ["auth-gateway", "webhook-worker", "billing-api", "vector-indexer", "edge-proxy"];
const SEVERITIES: Severity[] = ["info", "warning", "critical"];

export const ALL_EVENTS: SystemEvent[] = Array.from({ length: 500 }, (_, i) => {
  const severity = SEVERITIES[i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0];
  const service = SERVICES[i % SERVICES.length];
  return {
    id: `evt_${String(i + 1).padStart(4, "0")}`,
    timestamp: new Date(Date.now() - i * 45_000).toISOString(),
    service,
    severity,
    title: `[${service}] ${severity === "critical" ? "Upstream timeout spike" : severity === "warning" ? "Retry queue saturation" : "Batch checkpoint completed"} #${i + 1}`,
    rawPayload: JSON.stringify(
      {
        trace_id: `tr_${90000 + i}`,
        service,
        latency_ms: severity === "critical" ? 4820 : severity === "warning" ? 940 : 42,
        retries: severity === "critical" ? 4 : 0,
        node: `eu-south-1a-node-${(i % 6) + 1}`,
      },
      null,
      2
    ),
  };
});
