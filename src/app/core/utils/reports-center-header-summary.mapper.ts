import { ReportsCenterSummaryCopy } from '../domain/reports/reports-center-copy.model';
import { ReportsCenterSummary } from '../domain/reports/reports-center.model';
import { GamePageSummaryRow } from '../interfaces/game-page-summary-row.interface';

export function mapReportsCenterHeaderSummaryRows(
  copy: ReportsCenterSummaryCopy,
  summary: ReportsCenterSummary,
): readonly GamePageSummaryRow[] {
  return [
    {
      key: 'totalReports',
      label: copy.totalReportsLabel,
      value: summary.totalReports.value,
    },
    {
      key: 'unreadReports',
      label: copy.unreadReportsLabel,
      value: summary.unreadReports.value,
    },
    {
      key: 'latestReport',
      label: copy.latestReportLabel,
      value: summary.latestReport.title ?? copy.latestReportFallback,
      route: summary.latestReport.privatePath ?? undefined,
    },
  ];
}
