import { CombatTimingManifestReadModel } from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { mapCombatLuckRng } from './combat-luck-rng.mapper';
import { trimToNull } from './normalize-text';
import { clampPercent } from './number';

export function mapTimingManifest(value: Json): CombatTimingManifestReadModel | null {
  const record = jsonRecord(value);

  if (!record) {
    return null;
  }

  const manifestId = trimToNull(optionalText(read(record, 'manifestId', 'manifest_id')));
  const actorParticipantId = trimToNull(optionalText(read(
    record,
    'actorParticipantId',
    'actor_participant_id',
  )));
  const targetParticipantId = trimToNull(optionalText(read(
    record,
    'targetParticipantId',
    'target_participant_id',
  )));
  const greenZonePercent = optionalNumber(read(record, 'greenZonePercent', 'green_zone_percent'));
  const speedMultiplier = optionalNumber(read(record, 'speedMultiplier', 'speed_multiplier'));
  const requiresManualInput = optionalBoolean(read(
    record,
    'requiresManualInput',
    'requires_manual_input',
  )) === true;
  const isPlayerControlled = optionalBoolean(read(
    record,
    'isPlayerControlled',
    'is_player_controlled',
  )) === true;

  if (
    !manifestId ||
    !actorParticipantId ||
    !targetParticipantId ||
    greenZonePercent === null ||
    speedMultiplier === null ||
    !requiresManualInput ||
    !isPlayerControlled
  ) {
    return null;
  }

  const zoneWidthPercent = clampPercent(greenZonePercent);
  const backendZoneStartPercent = optionalNumber(read(record, 'zoneStartPercent', 'zone_start_percent'));
  const backendZoneEndPercent = optionalNumber(read(record, 'zoneEndPercent', 'zone_end_percent'));
  const fallbackZoneStartPercent = clampPercent((100 - zoneWidthPercent) / 2);
  const zoneStartPercent = backendZoneStartPercent === null
    ? fallbackZoneStartPercent
    : clampPercent(backendZoneStartPercent);
  const zoneEndPercent = backendZoneEndPercent === null
    ? clampPercent(zoneStartPercent + zoneWidthPercent)
    : clampPercent(backendZoneEndPercent);

  return {
    manifestId,
    actorParticipantId,
    targetParticipantId,
    greenZonePercent: zoneWidthPercent,
    hitChancePercent: optionalNumber(read(record, 'hitChancePercent', 'hit_chance_percent')),
    speedMultiplier: Math.max(0, speedMultiplier),
    streakBefore: optionalNumber(read(record, 'streakBefore', 'streak_before')),
    roundNumber: optionalNumber(read(record, 'roundNumber', 'round_number')),
    actionIndex: optionalNumber(read(record, 'actionIndex', 'action_index')),
    attackIndex: optionalNumber(read(record, 'attackIndex', 'attack_index')),
    requiresManualInput,
    isPlayerControlled,
    zoneStartPercent,
    zoneEndPercent,
    zoneWidthPercent,
    speed: Math.max(0, speedMultiplier),
    label: trimToNull(optionalText(read(record, 'label'))),
    luckRng: mapCombatLuckRng(record, zoneWidthPercent),
    rawJson: value,
  };
}
