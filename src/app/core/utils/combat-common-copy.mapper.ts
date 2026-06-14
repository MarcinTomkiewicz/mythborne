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
      'get_player_combat_common_copy.emptyLog',
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
    helperText: requiredText(read(record, 'helperText'), 'get_player_combat_common_copy.live.helperText'),
    submittingHelperText: requiredText(
      read(record, 'submittingHelperText'),
      'get_player_combat_common_copy.live.submittingHelperText',
    ),
    preparingHelperText: requiredText(
      read(record, 'preparingHelperText'),
      'get_player_combat_common_copy.live.preparingHelperText',
    ),
    completedHelperText: requiredText(
      read(record, 'completedHelperText'),
      'get_player_combat_common_copy.live.completedHelperText',
    ),
    timingActionLabel: requiredText(
      read(record, 'timingActionLabel'),
      'get_player_combat_common_copy.live.timingActionLabel',
    ),
    meterTitle: requiredText(read(record, 'meterTitle'), 'get_player_combat_common_copy.live.meterTitle'),
    meterHelperText: requiredText(
      read(record, 'meterHelperText'),
      'get_player_combat_common_copy.live.meterHelperText',
    ),
    meterEarlyLabel: requiredText(
      read(record, 'meterEarlyLabel'),
      'get_player_combat_common_copy.live.meterEarlyLabel',
    ),
    meterHitZoneLabel: requiredText(
      read(record, 'meterHitZoneLabel'),
      'get_player_combat_common_copy.live.meterHitZoneLabel',
    ),
    meterLateLabel: requiredText(
      read(record, 'meterLateLabel'),
      'get_player_combat_common_copy.live.meterLateLabel',
    ),
  };
}

function mapEmptyParticipants(record: JsonRecord): CombatCommonEmptyParticipantsCopy {
  return {
    loading: mapParticipantPlaceholder(
      requiredRecord(read(record, 'loading'), 'get_player_combat_common_copy.emptyParticipants.loading'),
      'get_player_combat_common_copy.emptyParticipants.loading',
    ),
    unavailable: mapParticipantPlaceholder(
      requiredRecord(
        read(record, 'unavailable'),
        'get_player_combat_common_copy.emptyParticipants.unavailable',
      ),
      'get_player_combat_common_copy.emptyParticipants.unavailable',
    ),
  };
}

function mapParticipantPlaceholder(
  record: JsonRecord,
  field: string,
): CombatCommonEmptyParticipantsCopy['loading'] {
  return {
    leftTitle: requiredText(read(record, 'leftTitle'), `${field}.leftTitle`),
    leftText: requiredText(read(record, 'leftText'), `${field}.leftText`),
    rightTitle: requiredText(read(record, 'rightTitle'), `${field}.rightTitle`),
    rightText: requiredText(read(record, 'rightText'), `${field}.rightText`),
  };
}

function mapWorkflow(record: JsonRecord): CombatCommonWorkflowCopy {
  return {
    finalizingResult: mapMessage(
      requiredRecord(read(record, 'finalizingResult'), 'get_player_combat_common_copy.workflow.finalizingResult'),
      'get_player_combat_common_copy.workflow.finalizingResult',
    ),
    finalizeUnavailable: mapMessage(
      requiredRecord(
        read(record, 'finalizeUnavailable'),
        'get_player_combat_common_copy.workflow.finalizeUnavailable',
      ),
      'get_player_combat_common_copy.workflow.finalizeUnavailable',
    ),
    actionUnavailable: mapMessage(
      requiredRecord(read(record, 'actionUnavailable'), 'get_player_combat_common_copy.workflow.actionUnavailable'),
      'get_player_combat_common_copy.workflow.actionUnavailable',
    ),
  };
}

function mapMessage(record: JsonRecord, field: string): CombatCommonMessageCopy {
  return {
    title: requiredText(read(record, 'title'), `${field}.title`),
    text: requiredText(read(record, 'text'), `${field}.text`),
  };
}

function requireLocale(value: string): CombatCommonCopyLocale {
  if (COMBAT_COMMON_LOCALES.includes(value as CombatCommonCopyLocale)) {
    return value as CombatCommonCopyLocale;
  }

  throw new Error(`get_player_combat_common_copy.locale has unsupported value: ${value}.`);
}
