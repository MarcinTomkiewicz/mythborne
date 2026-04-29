import {
  AntiAbuseDictionaryEntry,
  AntiAbuseSanctionTypeEntry,
  AntiAbuseSignalTypeEntry,
  PlayerAbuseReportTypeEntry,
  PlayerRelationshipDeclarationTypeEntry,
} from '../domain/anti-abuse/anti-abuse-dictionary.model';
import { Row } from '../types/supabase.types';

export function mapAntiAbuseSanctionType(
  row: Row<'anti_abuse_sanction_types'>,
): AntiAbuseSanctionTypeEntry {
  return {
    ...mapBaseDictionaryEntry(row),
    requiresReason: row.requires_reason,
    requiresTargetHero: row.requires_target_hero,
    requiresSourceHero: row.requires_source_hero,
    requiresDurationDays: row.requires_duration_days,
    requiresItemSelection: row.requires_item_selection,
    requiresCharacterPointsAmount: row.requires_character_points_amount,
  };
}

export function mapPlayerAbuseReportType(
  row: Row<'player_abuse_report_types'>,
): PlayerAbuseReportTypeEntry {
  return {
    ...mapBaseDictionaryEntry(row),
    requiresAccusedHero: row.requires_accused_hero,
    requiresDescription: row.requires_description,
    requiresTradeSelection: row.requires_trade_selection,
    requiresItemSelection: row.requires_item_selection,
  };
}

export function mapPlayerRelationshipDeclarationType(
  row: Row<'player_relationship_declaration_types'>,
): PlayerRelationshipDeclarationTypeEntry {
  return {
    ...mapBaseDictionaryEntry(row),
    minParticipants: row.min_participants,
    maxParticipants: row.max_participants,
    requiresAmount: row.requires_amount,
    requiresExpiration: row.requires_expiration,
    requiresTradeSelection: row.requires_trade_selection,
    requiresItemSelection: row.requires_item_selection,
  };
}

export function mapAntiAbuseSignalType(
  row: Row<'anti_abuse_signal_types'>,
): AntiAbuseSignalTypeEntry {
  return {
    ...mapBaseDictionaryEntry(row),
    defaultSeverity: row.default_severity,
    defaultScore: row.default_score,
    defaultConfidence: row.default_confidence,
  };
}

function mapBaseDictionaryEntry(row: {
  key: string;
  label: string;
  description: string;
  helper_text: string | null;
  admin_description: string | null;
  category: string;
  sort_order: number;
  is_active: boolean;
}): AntiAbuseDictionaryEntry {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    category: row.category,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}
