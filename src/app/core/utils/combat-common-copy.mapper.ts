import {
  CombatCommonCopy,
  CombatCommonCopyLocale,
  CombatCommonEmptyParticipantsCopy,
  CombatCommonLiveCopy,
  CombatCommonMessageCopy,
  CombatCommonWorkflowCopy,
} from '../domain/combat/combat-common-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requireLiteral,
  requiredRecord,
  requiredText,
} from './json-read';
import { copyTextOrKey } from './game-copy-key-fallback';

const COMBAT_COMMON_LOCALES: readonly CombatCommonCopyLocale[] = ['pl', 'en'];

export function mapCombatCommonCopy(raw: Json): CombatCommonCopy {
  const root = requiredRecord(raw, 'get_player_combat_common_copy');

  requireLiteral(
    requiredText(read(root, 'contractKey'), 'get_player_combat_common_copy.contractKey'),
    'combat_common_copy',
    'get_player_combat_common_copy.contractKey',
  );
  requireLiteral(
    requiredText(read(root, 'contractVersion'), 'get_player_combat_common_copy.contractVersion'),
    'combat_common_copy_v1',
    'get_player_combat_common_copy.contractVersion',
  );
  requireLiteral(
    requiredText(read(root, 'gameCopyKind'), 'get_player_combat_common_copy.gameCopyKind'),
    'player.combat.common',
    'get_player_combat_common_copy.gameCopyKind',
  );

  return {
    contractKey: 'combat_common_copy',
    contractVersion: 'combat_common_copy_v1',
    gameCopyKind: 'player.combat.common',
    requestedLocale: requiredText(read(root, 'requestedLocale'), 'get_player_combat_common_copy.requestedLocale'),
    locale: requireLocale(requiredText(read(root, 'locale'), 'get_player_combat_common_copy.locale')),
    fallbackLocale: 'en',
    live: mapLive(requiredRecord(read(root, 'live'), 'get_player_combat_common_copy.live')),
    emptyLog: mapMessage(
      requiredRecord(read(root, 'emptyLog'), 'get_player_combat_common_copy.emptyLog'),
      'combat.common.emptyLog',
    ),
    emptyParticipants: mapEmptyParticipants(
      requiredRecord(
        read(root, 'emptyParticipants'),
        'get_player_combat_common_copy.emptyParticipants',
      ),
    ),
    workflow: mapWorkflow(
      requiredRecord(read(root, 'workflow'), 'get_player_combat_common_copy.workflow'),
    ),
  };
}

function mapLive(record: JsonRecord): CombatCommonLiveCopy {
  return {
    helperText: copyTextOrKey(read(record, 'helperText'), 'combat.common.live.helperText'),
    submittingHelperText: copyTextOrKey(
      read(record, 'submittingHelperText'),
      'combat.common.live.submittingHelperText',
    ),
    preparingHelperText: copyTextOrKey(
      read(record, 'preparingHelperText'),
      'combat.common.live.preparingHelperText',
    ),
    completedHelperText: copyTextOrKey(
      read(record, 'completedHelperText'),
      'combat.common.live.completedHelperText',
    ),
    timingActionLabel: copyTextOrKey(
      read(record, 'timingActionLabel'),
      'combat.common.live.timingActionLabel',
    ),
    meterTitle: copyTextOrKey(read(record, 'meterTitle'), 'combat.common.live.meterTitle'),
    meterHelperText: copyTextOrKey(
      read(record, 'meterHelperText'),
      'combat.common.live.meterHelperText',
    ),
    meterEarlyLabel: copyTextOrKey(
      read(record, 'meterEarlyLabel'),
      'combat.common.live.meterEarlyLabel',
    ),
    meterHitZoneLabel: copyTextOrKey(
      read(record, 'meterHitZoneLabel'),
      'combat.common.live.meterHitZoneLabel',
    ),
    meterLateLabel: copyTextOrKey(
      read(record, 'meterLateLabel'),
      'combat.common.live.meterLateLabel',
    ),
  };
}

function mapEmptyParticipants(record: JsonRecord): CombatCommonEmptyParticipantsCopy {
  return {
    loading: mapParticipantPlaceholder(
      requiredRecord(read(record, 'loading'), 'get_player_combat_common_copy.emptyParticipants.loading'),
      'combat.common.emptyParticipants.loading',
    ),
    unavailable: mapParticipantPlaceholder(
      requiredRecord(
        read(record, 'unavailable'),
        'get_player_combat_common_copy.emptyParticipants.unavailable',
      ),
      'combat.common.emptyParticipants.unavailable',
    ),
  };
}

function mapParticipantPlaceholder(
  record: JsonRecord,
  field: string,
): CombatCommonEmptyParticipantsCopy['loading'] {
  return {
    leftTitle: copyTextOrKey(read(record, 'leftTitle'), `${field}.leftTitle`),
    leftText: copyTextOrKey(read(record, 'leftText'), `${field}.leftText`),
    rightTitle: copyTextOrKey(read(record, 'rightTitle'), `${field}.rightTitle`),
    rightText: copyTextOrKey(read(record, 'rightText'), `${field}.rightText`),
  };
}

function mapWorkflow(record: JsonRecord): CombatCommonWorkflowCopy {
  return {
    finalizingResult: mapMessage(
      requiredRecord(read(record, 'finalizingResult'), 'get_player_combat_common_copy.workflow.finalizingResult'),
      'combat.common.workflow.finalizingResult',
    ),
    finalizeUnavailable: mapMessage(
      requiredRecord(
        read(record, 'finalizeUnavailable'),
        'get_player_combat_common_copy.workflow.finalizeUnavailable',
      ),
      'combat.common.workflow.finalizeUnavailable',
    ),
    actionUnavailable: mapMessage(
      requiredRecord(read(record, 'actionUnavailable'), 'get_player_combat_common_copy.workflow.actionUnavailable'),
      'combat.common.workflow.actionUnavailable',
    ),
  };
}

function mapMessage(record: JsonRecord, field: string): CombatCommonMessageCopy {
  return {
    title: copyTextOrKey(read(record, 'title'), `${field}.title`),
    text: copyTextOrKey(read(record, 'text'), `${field}.text`),
  };
}

function requireLocale(value: string): CombatCommonCopyLocale {
  if (COMBAT_COMMON_LOCALES.includes(value as CombatCommonCopyLocale)) {
    return value as CombatCommonCopyLocale;
  }

  throw new Error(`get_player_combat_common_copy.locale has unsupported value: ${value}.`);
}
