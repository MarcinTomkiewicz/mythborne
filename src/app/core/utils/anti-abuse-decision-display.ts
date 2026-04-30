import {
  ANTI_ABUSE_CASE_STATUS_FALLBACK_LABELS,
  ANTI_ABUSE_CASE_SOURCE_FALLBACK_LABELS,
  ANTI_ABUSE_CASE_VERDICT_FALLBACK_LABELS,
  ANTI_ABUSE_SANCTION_STATUS_FALLBACK_LABELS,
  PLAYER_ABUSE_REPORT_STATUS_FALLBACK_LABELS,
  PLAYER_RELATIONSHIP_DECLARATION_STATUS_FALLBACK_LABELS,
} from '../constants/anti-abuse-display.const';
import {
  AntiAbuseDictionaryData,
  AntiAbuseDictionaryEntry,
} from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  AntiAbuseCaseSource,
} from '../domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseDecision,
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionItemDecision,
  AntiAbuseSanctionStatus,
  PlayerAbuseReportDecision,
  PlayerAbuseReportStatus,
  PlayerRelationshipDeclarationDecision,
  PlayerRelationshipDeclarationStatus,
} from '../domain/anti-abuse/anti-abuse-decision.model';
import {
  AntiAbuseDisplayMetadata,
  AntiAbuseSanctionItemLinkDisplay,
  PlayerAntiAbuseDecisionDisplay,
  StaffAntiAbuseDecisionDisplay,
} from '../domain/anti-abuse/anti-abuse-decision-display.model';

export function sanctionTypeMetadata(
  sanctionTypeKey: string,
  dictionaries: Pick<AntiAbuseDictionaryData, 'sanctionTypes'>,
): AntiAbuseDisplayMetadata {
  return toMetadata(
    dictionaries.sanctionTypes.find((entry) => entry.key === sanctionTypeKey),
    sanctionTypeKey,
  );
}

export function reportTypeMetadata(
  reportTypeKey: string,
  dictionaries: Pick<AntiAbuseDictionaryData, 'reportTypes'>,
): AntiAbuseDisplayMetadata {
  return toMetadata(
    dictionaries.reportTypes.find((entry) => entry.key === reportTypeKey),
    reportTypeKey,
  );
}

export function declarationTypeMetadata(
  declarationTypeKey: string,
  dictionaries: Pick<AntiAbuseDictionaryData, 'declarationTypes'>,
): AntiAbuseDisplayMetadata {
  return toMetadata(
    dictionaries.declarationTypes.find((entry) => entry.key === declarationTypeKey),
    declarationTypeKey,
  );
}

export function antiAbuseCaseStatusLabel(status: AntiAbuseCaseStatus): string {
  return ANTI_ABUSE_CASE_STATUS_FALLBACK_LABELS[status] ?? status;
}

export function antiAbuseCaseSourceLabel(source: AntiAbuseCaseSource): string {
  return ANTI_ABUSE_CASE_SOURCE_FALLBACK_LABELS[source] ?? source;
}

export function antiAbuseCaseVerdictLabel(verdict: AntiAbuseCaseVerdict): string {
  return ANTI_ABUSE_CASE_VERDICT_FALLBACK_LABELS[verdict] ?? verdict;
}

export function antiAbuseSanctionStatusLabel(
  status: AntiAbuseSanctionStatus,
): string {
  return ANTI_ABUSE_SANCTION_STATUS_FALLBACK_LABELS[status] ?? status;
}

export function playerAbuseReportStatusLabel(
  status: PlayerAbuseReportStatus,
): string {
  return PLAYER_ABUSE_REPORT_STATUS_FALLBACK_LABELS[status] ?? status;
}

export function relationshipDeclarationStatusLabel(
  status: PlayerRelationshipDeclarationStatus,
): string {
  return PLAYER_RELATIONSHIP_DECLARATION_STATUS_FALLBACK_LABELS[status] ?? status;
}

export function sanctionItemLinkDisplay(
  item: Pick<AntiAbuseSanctionItemDecision, 'itemId' | 'reason'>,
): AntiAbuseSanctionItemLinkDisplay {
  return {
    label: 'Linked item evidence/context',
    description:
      'This link records an item as evidence or decision context. It does not confiscate, transfer, or otherwise mutate the item by itself.',
    helperText: item.reason
      ? `Recorded reason: ${item.reason}`
      : `Linked item id: ${item.itemId}`,
  };
}

export function staffCaseDecisionDisplay(
  decision: AntiAbuseCaseDecision,
): StaffAntiAbuseDecisionDisplay {
  return {
    label: decision.title,
    statusLabel: antiAbuseCaseStatusLabel(decision.status),
    technicalKey: decision.status,
    reason: decision.verdictReason ?? decision.noSanctionReason ?? decision.statusReason,
    statusReason: decision.statusReason,
    operatorNotes: decision.operatorNotes,
    adminDescription: decision.summary,
  };
}

export function staffSanctionDecisionDisplay(
  decision: AntiAbuseSanctionDecision,
  dictionaries: Pick<AntiAbuseDictionaryData, 'sanctionTypes'>,
): StaffAntiAbuseDecisionDisplay {
  const type = sanctionTypeMetadata(decision.sanctionTypeKey, dictionaries);

  return {
    label: type.label,
    statusLabel: antiAbuseSanctionStatusLabel(decision.status),
    technicalKey: type.technicalKey,
    reason: decision.reason,
    statusReason: decision.statusReason,
    operatorNotes: decision.operatorNotes,
    adminDescription: type.adminDescription,
  };
}

export function playerSanctionDecisionDisplay(
  decision: AntiAbuseSanctionDecision,
  dictionaries: Pick<AntiAbuseDictionaryData, 'sanctionTypes'>,
): PlayerAntiAbuseDecisionDisplay {
  const type = sanctionTypeMetadata(decision.sanctionTypeKey, dictionaries);

  return {
    label: type.label,
    statusLabel: antiAbuseSanctionStatusLabel(decision.status),
    reason: decision.reason,
    statusReason: null,
    playerNotes: null,
  };
}

export function staffReportDecisionDisplay(
  decision: PlayerAbuseReportDecision,
  dictionaries: Pick<AntiAbuseDictionaryData, 'reportTypes'>,
): StaffAntiAbuseDecisionDisplay {
  const type = reportTypeMetadata(decision.reportTypeKey, dictionaries);

  return {
    label: type.label,
    statusLabel: playerAbuseReportStatusLabel(decision.status),
    technicalKey: type.technicalKey,
    reason: decision.statusReason,
    statusReason: decision.statusReason,
    operatorNotes: decision.adminNotes,
    adminDescription: type.adminDescription,
  };
}

export function playerReportDecisionDisplay(
  decision: PlayerAbuseReportDecision,
  dictionaries: Pick<AntiAbuseDictionaryData, 'reportTypes'>,
): PlayerAntiAbuseDecisionDisplay {
  const type = reportTypeMetadata(decision.reportTypeKey, dictionaries);

  return {
    label: type.label,
    statusLabel: playerAbuseReportStatusLabel(decision.status),
    reason: null,
    statusReason: null,
    playerNotes: decision.playerNotes,
  };
}

export function staffDeclarationDecisionDisplay(
  decision: PlayerRelationshipDeclarationDecision,
  dictionaries: Pick<AntiAbuseDictionaryData, 'declarationTypes'>,
): StaffAntiAbuseDecisionDisplay {
  const type = declarationTypeMetadata(decision.declarationTypeKey, dictionaries);

  return {
    label: type.label,
    statusLabel: relationshipDeclarationStatusLabel(decision.status),
    technicalKey: type.technicalKey,
    reason: decision.statusReason,
    statusReason: decision.statusReason,
    operatorNotes: decision.adminNotes,
    adminDescription: type.adminDescription,
  };
}

export function playerDeclarationDecisionDisplay(
  decision: PlayerRelationshipDeclarationDecision,
  dictionaries: Pick<AntiAbuseDictionaryData, 'declarationTypes'>,
): PlayerAntiAbuseDecisionDisplay {
  const type = declarationTypeMetadata(decision.declarationTypeKey, dictionaries);

  return {
    label: type.label,
    statusLabel: relationshipDeclarationStatusLabel(decision.status),
    reason: null,
    statusReason: null,
    playerNotes: decision.playerNotes,
  };
}

function toMetadata(
  entry: AntiAbuseDictionaryEntry | undefined,
  technicalKey: string,
): AntiAbuseDisplayMetadata {
  return {
    key: entry?.key ?? technicalKey,
    technicalKey,
    label: entry?.label ?? technicalKey,
    description: entry?.description ?? '',
    helperText: entry?.helperText ?? null,
    adminDescription: entry?.adminDescription ?? null,
    category: entry?.category ?? 'unknown',
    sortOrder: entry?.sortOrder ?? 0,
    isActive: entry?.isActive ?? false,
  };
}
