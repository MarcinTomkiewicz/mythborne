import type { RichTextFragment, RichTextTone } from '../rich-text/rich-text.model';

export type PvpCombatContextParticipantRole = 'attacker' | 'defender';
export type PvpCombatContextSourceKey =
  | 'barracks'
  | 'fortress'
  | 'blessing'
  | 'curse';
export type PvpCombatContextEffectKey =
  | 'attacker_barracks_health'
  | 'defender_fortress_health'
  | 'blessing'
  | 'curse';
export type PvpCombatContextEffectTone = Extract<RichTextTone, 'info' | 'success' | 'danger'>;

export interface PvpCombatContextPresentation {
  contractKey: 'pvp_combat_context_presentation';
  contractVersion: 'pvp_combat_context_presentation_v1';
  sourceOwner: 'pvp.combat';
  publicSafe: true;
  emptyLabel: string;
  participantEffects: PvpCombatParticipantEffect[];
  participants: PvpCombatParticipantContext[];
}

export interface PvpCombatParticipantContext {
  participantRole: PvpCombatContextParticipantRole;
  displayName: string;
  participantEffects: PvpCombatParticipantEffect[];
}

export interface PvpCombatParticipantEffect {
  key: PvpCombatContextEffectKey;
  sourceKey: PvpCombatContextSourceKey;
  participantRole: PvpCombatContextParticipantRole;
  heroName: string;
  valueDisplay: string;
  summaryPlain: string;
  summaryRichText: RichTextFragment[];
  tone: PvpCombatContextEffectTone;
  sortOrder: number;
}
