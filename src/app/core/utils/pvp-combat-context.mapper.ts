import {
  PvpCombatContextEffectKey,
  PvpCombatContextEffectTone,
  PvpCombatContextParticipantRole,
  PvpCombatContextPresentation,
  PvpCombatContextSourceKey,
  PvpCombatParticipantContext,
  PvpCombatParticipantEffect,
} from '../domain/pvp/pvp-combat-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalRecordArray,
  read,
  requireLiteral,
  requiredBoolean,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';
import {
  mapRichTextFragments,
  requireRichTextTone,
} from './rich-text.mapper';

export function mapOptionalPvpCombatContextPresentation(
  value: Json | undefined,
  field: string,
): PvpCombatContextPresentation | null {
  if (value === undefined || value === null) {
    return null;
  }

  return mapPvpCombatContextPresentation(requiredRecord(value, field), field);
}

export function mapPvpCombatParticipantEffects(
  value: Json | undefined,
  field: string,
): PvpCombatParticipantEffect[] {
  return optionalRecordArray(value, field)
    .map((record, index) => mapPvpCombatParticipantEffect(record, `${field}[${index}]`))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapPvpCombatContextPresentation(
  record: JsonRecord,
  field: string,
): PvpCombatContextPresentation {
  requireLiteral(requiredText(read(record, 'contractKey'), `${field}.contractKey`), 'pvp_combat_context_presentation', `${field}.contractKey`);
  requireLiteral(requiredText(read(record, 'contractVersion'), `${field}.contractVersion`), 'pvp_combat_context_presentation_v1', `${field}.contractVersion`);
  requireLiteral(requiredText(read(record, 'sourceOwner'), `${field}.sourceOwner`), 'pvp.combat', `${field}.sourceOwner`);

  if (requiredBoolean(read(record, 'publicSafe'), `${field}.publicSafe`) !== true) {
    throw new Error(`${field}.publicSafe must be true.`);
  }

  return {
    contractKey: 'pvp_combat_context_presentation',
    contractVersion: 'pvp_combat_context_presentation_v1',
    sourceOwner: 'pvp.combat',
    publicSafe: true,
    emptyLabel: requiredText(read(record, 'emptyLabel'), `${field}.emptyLabel`),
    participantEffects: mapPvpCombatParticipantEffects(
      read(record, 'participantEffects'),
      `${field}.participantEffects`,
    ),
    participants: optionalRecordArray(read(record, 'participants'), `${field}.participants`)
      .map((participant, index) => mapPvpCombatParticipantContext(participant, `${field}.participants[${index}]`)),
  };
}

function mapPvpCombatParticipantContext(
  record: JsonRecord,
  field: string,
): PvpCombatParticipantContext {
  return {
    participantRole: requireParticipantRole(
      requiredText(read(record, 'participantRole'), `${field}.participantRole`),
      `${field}.participantRole`,
    ),
    displayName: requiredText(read(record, 'displayName'), `${field}.displayName`),
    participantEffects: mapPvpCombatParticipantEffects(
      read(record, 'participantEffects'),
      `${field}.participantEffects`,
    ),
  };
}

function mapPvpCombatParticipantEffect(
  record: JsonRecord,
  field: string,
): PvpCombatParticipantEffect {
  return {
    key: requireEffectKey(requiredText(read(record, 'key'), `${field}.key`), `${field}.key`),
    sourceKey: requireSourceKey(requiredText(read(record, 'sourceKey'), `${field}.sourceKey`), `${field}.sourceKey`),
    participantRole: requireParticipantRole(
      requiredText(read(record, 'participantRole'), `${field}.participantRole`),
      `${field}.participantRole`,
    ),
    heroName: requiredText(read(record, 'heroName'), `${field}.heroName`),
    valueDisplay: requiredText(read(record, 'valueDisplay'), `${field}.valueDisplay`),
    summaryPlain: requiredText(read(record, 'summaryPlain'), `${field}.summaryPlain`),
    summaryRichText: mapRichTextFragments(
      read(record, 'summaryRichText'),
      `${field}.summaryRichText`,
      requireTextOrValueKind,
    ),
    tone: requireEffectTone(requiredText(read(record, 'tone'), `${field}.tone`), `${field}.tone`),
    sortOrder: requiredNumber(read(record, 'sortOrder'), `${field}.sortOrder`),
  };
}

function requireParticipantRole(value: string, field: string): PvpCombatContextParticipantRole {
  if (value === 'attacker' || value === 'defender') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireSourceKey(value: string, field: string): PvpCombatContextSourceKey {
  if (value === 'barracks' || value === 'fortress' || value === 'blessing' || value === 'curse') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireEffectKey(value: string, field: string): PvpCombatContextEffectKey {
  if (
    value === 'attacker_barracks_health' ||
    value === 'defender_fortress_health' ||
    value === 'blessing' ||
    value === 'curse'
  ) {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireEffectTone(value: string, field: string): PvpCombatContextEffectTone {
  const tone = requireRichTextTone(value, field);

  if (tone === 'info' || tone === 'success' || tone === 'danger') {
    return tone;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireTextOrValueKind(value: string, field: string): 'text' | 'value' {
  if (value === 'text' || value === 'value') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}
