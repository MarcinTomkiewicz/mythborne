import {
  PrivateReportDetailPage,
  PublicReportDetailAvailable,
  ReportDetail,
} from '../domain/reports/report-detail.model';

export function isPrivatePvpReportDetail(
  detail: ReportDetail,
): detail is PrivateReportDetailPage {
  const context = detail.domainContextJson;

  return detail.access.visibility === 'private' &&
    context.reportDomainKey === 'pvp' &&
    context.frontendUsage.canUsePrivateDomainReads &&
    !context.frontendUsage.sourceIdsRedacted &&
    context.missingContextReason === null;
}

export function isPvpReportDomainDetail(detail: ReportDetail): boolean {
  return detail.domainContextJson.reportDomainKey === 'pvp';
}

export function isPrivatePvpAttackReportDetail(
  detail: ReportDetail,
): detail is PrivateReportDetailPage {
  const context = detail.domainContextJson;
  const pvp = context.pvp;

  return isPrivatePvpReportDetail(detail) &&
    context.contentKind === 'pvp_combat' &&
    pvp?.sourceKind === 'pvp_attack' &&
    !!pvp.pvpAttackResultId;
}

export function isPrivatePvpSpyReportDetail(
  detail: ReportDetail,
): detail is PrivateReportDetailPage {
  const context = detail.domainContextJson;
  const pvp = context.pvp;

  return isPrivatePvpReportDetail(detail) &&
    context.contentKind === 'pvp_spy' &&
    pvp?.sourceKind === 'pvp_spy';
}

export function isPublicPvpReportDetail(
  detail: ReportDetail,
): detail is PublicReportDetailAvailable {
  const context = detail.domainContextJson;

  return detail.access.visibility === 'public' &&
    context.reportDomainKey === 'pvp' &&
    context.missingContextReason === null;
}
