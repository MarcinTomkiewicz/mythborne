import { ReportHandoffActionsViewModel } from '../domain/reports/report-handoff.model';

export function mapReportHandoffActions(input: {
  reportId: string;
  publicToken?: string | null;
  publicReportPath?: string | null;
}): ReportHandoffActionsViewModel {
  const publicReportPath = input.publicReportPath ??
    (input.publicToken ? `/report/${input.publicToken}` : null);

  return {
    directReportId: input.reportId,
    directReportLink: `/game/reports/${input.reportId}`,
    directReportLabel: 'Otwórz pełny raport',
    directReportUnavailableMessage: null,
    publicReportPath,
    publicReportCopyLabel: publicReportPath
      ? 'Kopiuj link do raportu'
      : 'Link publiczny niedostępny',
    publicReportCopyDisabled: publicReportPath === null,
    publicReportUnavailableMessage: publicReportPath === null
      ? 'Publiczny link raportu nie jest dostępny w bieżącym odczycie raportu.'
      : null,
  };
}
