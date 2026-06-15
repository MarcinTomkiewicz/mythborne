import type { PrivateReportDetailPage } from '../domain/reports/report-detail.model';
import type {
  ReportDetailPreviewExplorationSourceKind,
} from '../domain/reports/report-detail-preview.model';

export function explorationParentContextReportId(
  detail: PrivateReportDetailPage,
  currentReportId: string,
): string | null {
  if (!isCombatResultReport(detail)) {
    return null;
  }

  const expectedKind = expectedExplorationParentKind(detail);

  if (!expectedKind) {
    return null;
  }

  return detail.report.relatedReportsJson.find(
    (candidate) =>
      candidate.reportId &&
      candidate.relationKind === 'parent_context_report' &&
      isExpectedExplorationParentContextReport(
        expectedKind,
        candidate.reportTypeKey,
        candidate.sourceEntityType,
      ) &&
      candidate.reportId !== currentReportId,
  )?.reportId ?? null;
}

function isCombatResultReport(detail: PrivateReportDetailPage): boolean {
  return (
    detail.report.reportTypeKey === 'combat' &&
    detail.report.sourceEntityType === 'combat_result'
  );
}

function expectedExplorationParentKind(
  detail: PrivateReportDetailPage,
): ReportDetailPreviewExplorationSourceKind | null {
  return (
    normalizeExplorationParentKind(
      detail.domainContextJson.exploration?.challengeKind ?? null,
    ) ??
    normalizeExplorationParentKind(
      detail.domainContextJson.combat?.sourceType ?? null,
    )
  );
}

function normalizeExplorationParentKind(
  value: string | null,
): ReportDetailPreviewExplorationSourceKind | null {
  if (value === 'trial' || value === 'encounter') {
    return value;
  }

  return null;
}

function isExpectedExplorationParentContextReport(
  expectedKind: ReportDetailPreviewExplorationSourceKind,
  reportTypeKey: string,
  sourceEntityType: string,
): boolean {
  return expectedKind === 'encounter'
    ? reportTypeKey === 'encounter' && sourceEntityType === 'encounter_result'
    : reportTypeKey === 'trial' && sourceEntityType === 'trial_result';
}
