import {
  PrivateReportDetailPage,
  PublicReportDetailV2Available,
  ReportDetailV2,
} from '../domain/reports/report-detail.model';

export function isPrivatePvpReportDetail(
  detail: ReportDetailV2,
): detail is PrivateReportDetailPage {
  const context = detail.domainContextJson;

  return detail.access.visibility === 'private' &&
    context.reportDomainKey === 'pvp' &&
    context.frontendUsage.canUsePrivateDomainReads &&
    !context.frontendUsage.sourceIdsRedacted &&
    context.missingContextReason === null;
}

export function isPvpReportDomainDetail(detail: ReportDetailV2): boolean {
  return detail.domainContextJson.reportDomainKey === 'pvp';
}

export function isPrivatePvpAttackReportDetail(
  detail: ReportDetailV2,
): detail is PrivateReportDetailPage {
  const context = detail.domainContextJson;
  const pvp = context.pvp;

  return isPrivatePvpReportDetail(detail) &&
    context.contentKind === 'pvp_combat' &&
    pvp?.sourceKind === 'pvp_attack' &&
    !!pvp.pvpAttackResultId;
}

export function isPrivatePvpSpyReportDetail(
  detail: ReportDetailV2,
): detail is PrivateReportDetailPage {
  const context = detail.domainContextJson;
  const pvp = context.pvp;

  return isPrivatePvpReportDetail(detail) &&
    context.contentKind === 'pvp_spy' &&
    pvp?.sourceKind === 'pvp_spy';
}

export function isPublicPvpReportDetail(
  detail: ReportDetailV2,
): detail is PublicReportDetailV2Available {
  const context = detail.domainContextJson;

  return detail.access.visibility === 'public' &&
    context.reportDomainKey === 'pvp' &&
    context.missingContextReason === null;
}
