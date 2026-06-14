import type {
  CombatCommonMessageCopy,
} from '../combat/combat-common-copy.model';
import type {
  RichTextFragment,
  RichTextTone,
} from '../rich-text/rich-text.model';

export type PvpCombatCopyLocale = 'pl' | 'en';
export type PvpCombatParticipantEffectSourceKey =
  | 'barracks'
  | 'fortress'
  | 'blessing'
  | 'curse';

export interface PvpCombatCopy {
  contractKey: 'pvp_combat_copy';
  contractVersion: 'pvp_combat_copy_v2';
  requestedLocale: string;
  locale: PvpCombatCopyLocale;
  fallbackLocale: string;
  sourcePresentation: PvpCombatSourcePresentationCopy;
  context: PvpCombatContextCopy;
  legacy?: PvpCombatLegacyMarkerCopy;
}

export interface PvpCombatSourcePresentationCopy {
  contractKey: 'pvp_combat_source_presentation';
  contractVersion: 'pvp_combat_source_presentation_v1';
  header: PvpCombatHeaderCopy;
  live: PvpCombatLiveCopy;
  emptyLog: CombatCommonMessageCopy;
  workflow: PvpCombatWorkflowCopy | null;
}

export interface PvpCombatHeaderCopy {
  eyebrow: string;
  title: string;
  text: string;
}

export interface PvpCombatLiveCopy {
  title: string;
  text: string;
  helperText: string;
}

export interface PvpCombatWorkflowCopy {
  finalizingResult: CombatCommonMessageCopy;
  finalizeUnavailable: CombatCommonMessageCopy;
  actionUnavailable: CombatCommonMessageCopy;
}

export interface PvpCombatContextCopy {
  contractKey: string | null;
  contractVersion: string | null;
  emptyLabel: string | null;
  participantEffectTemplates: PvpCombatParticipantEffectTemplatesCopy;
}

export interface PvpCombatParticipantEffectTemplatesCopy {
  attackerBarracksHealth: PvpCombatParticipantEffectTemplateCopy;
  defenderFortressHealth: PvpCombatParticipantEffectTemplateCopy;
  blessing: PvpCombatParticipantEffectTemplateCopy;
  curse: PvpCombatParticipantEffectTemplateCopy;
}

export interface PvpCombatParticipantEffectTemplateCopy {
  key: string;
  participantRole: string;
  sourceKey: PvpCombatParticipantEffectSourceKey;
  summaryPlainTemplate: string;
  summaryRichTextTemplate: RichTextFragment[];
  valueDisplay: string | null;
  requiredPlaceholders: string[];
  tone: RichTextTone | null;
  sortOrder: number | null;
}

export interface PvpCombatLegacyMarkerCopy {
  removedPlayerFacingEffectTitles?: boolean;
  removedReportSection?: boolean;
  legacySourceFunction?: 'get_pvp_combat_copy_legacy_v1';
  targetOwner?: 'pvp.combat';
  resultOwner?: 'pvp.result';
}
