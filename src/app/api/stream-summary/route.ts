import { NextRequest } from "next/server";
import { ALL_EVENTS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || "evt_0001";
  const event = ALL_EVENTS.find((e) => e.id === eventId) || ALL_EVENTS[0];

  const report = [
    `### Incident Analysis for ${event.id} (${event.service})\n\n`,
    `**Severity:** ${event.severity.toUpperCase()} | **Detected:** ${event.timestamp}\n\n`,
    `**Root Cause Assessment:** Telemetry from \`${event.service}\` indicates elevated tail latency correlated with connection pool saturation. `,
    `Automatic retries amplified downstream concurrency by 3.2x during the observation window.\n\n`,
    `**Recommended Remediation:**\n`,
    `1. Enforce bounded concurrency semaphore on outbound worker tasks.\n`,
    `2. Verify idempotency keys before replaying failed webhook deliveries.\n`,
    `3. Check node memory pressure on \`eu-south-1a\` cluster.\n`,
  ].join("");

  const tokens = report.split(" ");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Initial model cold-start delay
      await new Promise((r) => setTimeout(r, 250));

      for (const word of tokens) {
        if (request.signal.aborted) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(word + " "));
        await new Promise((r) => setTimeout(r, 45));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
