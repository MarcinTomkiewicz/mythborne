import { ReportHandoffActionsViewModel } from '../domain/reports/report-handoff.model';
import { resolvePublicReportPath } from './public-report-path';

export function mapReportHandoffActions(input: {
  reportId: string;
  publicToken?: string | null;
  publicReportPath?: string | null;
}): ReportHandoffActionsViewModel {
  const publicReportPath = resolvePublicReportPath(input);
  const directReportLink = `/game/reports/${input.reportId}`;

  return {
    directReportId: input.reportId,
    directReportLink,
    directReportLabel: null,
    directReportUnavailableMessage: null,
    publicToken: input.publicToken ?? null,
    publicReportPath,
    publicReportCopyLabel: null,
    publicReportUnavailableMessage: null,
  };
}
