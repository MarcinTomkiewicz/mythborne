import {
  GameReportReadState,
  GameReportTypeEntry,
  PrivateGameReportDetail,
  PrivateGameReportListItem,
  PublicGameReport,
} from '../domain/reports/game-report.model';
import {
  GameReportTypeRow,
  GetHeroGameReportDetailRpcRow,
  GetHeroGameReportsRpcRow,
  GetPublicGameReportByTokenRpcRow,
} from '../types/game-report-rpc.types';
import { resolveGameReportContextualReadiness } from './game-report-contextual-readiness';
import { parseGameReportCombatSectionJson } from './game-report-combat-mappers';
import {
  parseGameReportItemReferencesJson,
  parseGameReportParticipantsJson,
  parsePublicGameReportItemReferencesJson,
} from './game-report-content-mappers';
import { nullableText } from './game-report-json-reader';

export {
  mapGameReportItemReferenceRow,
  mapGameReportParticipantRow,
} from './game-report-content-mappers';

export function mapGameReportType(row: GameReportTypeRow): GameReportTypeEntry {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapPrivateGameReportListItem(
  row: GetHeroGameReportsRpcRow,
): PrivateGameReportListItem {
  const readState = mapGameReportReadState(row);

  return {
    reportId: row.report_id,
    publicToken: row.public_token,
    reportTypeKey: row.report_type_key,
    reportTypeLabel: row.report_type_label,
    title: row.title,
    summary: nullableText(row.summary),
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    createdAt: row.created_at,
    readState,
    participants: parseGameReportParticipantsJson(row.participants_json),
    itemReferencesCount: row.item_references_count,
  };
}

export function mapPrivateGameReportDetail(
  row: GetHeroGameReportDetailRpcRow,
): PrivateGameReportDetail {
  const readState = mapGameReportReadState(row);

  return {
    reportId: row.report_id,
    publicToken: row.public_token,
    reportTypeKey: row.report_type_key,
    reportTypeLabel: row.report_type_label,
    reportTypeDescription: row.report_type_description,
    title: row.title,
    summary: nullableText(row.summary),
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    createdAt: row.created_at,
    readState,
    participants: parseGameReportParticipantsJson(row.participants_json),
    itemReferences: parseGameReportItemReferencesJson(row.item_references_json),
    combatSection: parseGameReportCombatSectionJson(row.combat_section_json),
    contextualReadiness: resolveGameReportContextualReadiness({
      reportTypeKey: row.report_type_key,
      sourceEntityType: row.source_entity_type,
    }),
  };
}

export function mapPublicGameReport(
  row: GetPublicGameReportByTokenRpcRow,
): PublicGameReport {
  return {
    publicToken: row.public_token,
    reportTypeKey: row.report_type_key,
    reportTypeLabel: row.report_type_label,
    reportTypeDescription: row.report_type_description,
    title: row.title,
    summary: nullableText(row.summary),
    sourceEntityType: row.source_entity_type,
    createdAt: row.created_at,
    participants: parseGameReportParticipantsJson(row.participants_json),
    itemReferences: parsePublicGameReportItemReferencesJson(row.item_references_json),
    combatSection: parseGameReportCombatSectionJson(row.combat_section_json),
    contextualReadiness: resolveGameReportContextualReadiness({
      reportTypeKey: row.report_type_key,
      sourceEntityType: row.source_entity_type,
    }),
  };
}

function mapGameReportReadState(
  row: Pick<GetHeroGameReportsRpcRow, 'access_role' | 'read_at'>,
): GameReportReadState {
  const readAt = nullableText(row.read_at);

  return {
    accessRole: row.access_role,
    readAt,
    isUnread: readAt === null,
  };
}
