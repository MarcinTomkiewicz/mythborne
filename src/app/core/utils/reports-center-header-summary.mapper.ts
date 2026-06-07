import { ReportsCenterSummaryV1 } from '../domain/reports/reports-center.model';
import { GamePageSummaryRow } from '../interfaces/game-page-summary-row.interface';

export function mapReportsCenterHeaderSummaryRows(
  summary: ReportsCenterSummaryV1 | null | undefined,
): readonly GamePageSummaryRow[] {
  if (!summary) {
    return [];
  }

  return [
    {
      key: 'totalReports',
      label: summary.totalReports.label,
      value: summary.totalReports.value,
    },
    {
      key: 'unreadReports',
      label: summary.unreadReports.label,
      value: summary.unreadReports.value,
    },
    {
      key: 'latestReport',
      label: summary.latestReport.label,
      value: summary.latestReport.title ?? summary.latestReport.fallbackLabel,
      route: summary.latestReport.privatePath ?? undefined,
    },
  ];
}
