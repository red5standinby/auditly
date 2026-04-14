/**
 * Audit Service Abstraction Layer
 *
 * This module defines the interface and registration mechanism for audit
 * services. Swap out `mockAuditService` for a real implementation
 * (Lighthouse CI, custom crawler, third-party API) without touching any UI
 * component.
 *
 * Usage:
 *   import { getAuditService } from "@/lib/audit-service";
 *   const report = await getAuditService().runAudit({ url });
 */

import type { AuditOptions, AuditProgressCallback, AuditReport, AuditService } from "@/types/audit";
import { generateMockReport, AUDIT_STAGES } from "./mock-data";

// ─── Mock Implementation ──────────────────────────────────────────────────────

const mockAuditService: AuditService = {
  async runAudit(
    options: AuditOptions,
    onProgress?: AuditProgressCallback
  ): Promise<AuditReport> {
    const totalDuration = AUDIT_STAGES.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;

    for (let i = 0; i < AUDIT_STAGES.length; i++) {
      const stage = AUDIT_STAGES[i];
      onProgress?.({
        stage: stage.label,
        percent: Math.round((elapsed / totalDuration) * 100),
        detail: stage.detail,
      });
      await new Promise((res) => setTimeout(res, stage.duration));
      elapsed += stage.duration;
    }

    onProgress?.({ stage: "Complete", percent: 100 });

    return generateMockReport(options.url);
  },
};

// ─── Service Registry ─────────────────────────────────────────────────────────

type ServiceName = "mock" | "lighthouse" | "custom";

const registry: Partial<Record<ServiceName, AuditService>> = {
  mock: mockAuditService,
};

/** Register a custom audit service implementation. */
export function registerAuditService(name: ServiceName, service: AuditService) {
  registry[name] = service;
}

/** Returns the active audit service. Override AUDIT_SERVICE env var to switch. */
export function getAuditService(): AuditService {
  const name = (process.env.NEXT_PUBLIC_AUDIT_SERVICE ?? "mock") as ServiceName;
  const service = registry[name];
  if (!service) {
    console.warn(`Audit service "${name}" not registered — falling back to mock.`);
    return mockAuditService;
  }
  return service;
}
