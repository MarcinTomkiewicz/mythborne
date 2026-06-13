import {
  CombatSourceEmptyParticipantsPresentation,
  CombatSourcePanelPresentation,
  CombatSourceParticipantEmptyStatePresentation,
  CombatSourcePresentation,
} from '../domain/combat/combat-source-presentation.model';
import {
  JsonRecord,
  read,
  requiredNullableText,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapCombatSourcePresentationCopy(
  record: JsonRecord,
  field: string,
): CombatSourcePresentation {
  const decision = requiredRecord(read(record, 'decision'), `${field}.decision`);

  return {
    decision: {
      eyebrow: requiredText(read(decision, 'eyebrow'), `${field}.decision.eyebrow`),
      title: requiredText(read(decision, 'title'), `${field}.decision.title`),
      description: requiredText(
        read(decision, 'description'),
        `${field}.decision.description`,
      ),
      manualActionLabel: requiredText(
        read(decision, 'manualActionLabel'),
        `${field}.decision.manualActionLabel`,
      ),
      manualActionTooltip: requiredNullableText(
        read(decision, 'manualActionTooltip'),
        `${field}.decision.manualActionTooltip`,
      ),
      autoActionLabel: requiredText(
        read(decision, 'autoActionLabel'),
        `${field}.decision.autoActionLabel`,
      ),
      autoActionTooltip: requiredNullableText(
        read(decision, 'autoActionTooltip'),
        `${field}.decision.autoActionTooltip`,
      ),
      waitingForDecision: requiredText(
        read(decision, 'waitingForDecision'),
        `${field}.decision.waitingForDecision`,
      ),
    },
    loadingPreview: mapPanel(
      requiredRecord(read(record, 'loadingPreview'), `${field}.loadingPreview`),
      `${field}.loadingPreview`,
    ),
    unavailablePreview: mapPanel(
      requiredRecord(read(record, 'unavailablePreview'), `${field}.unavailablePreview`),
      `${field}.unavailablePreview`,
    ),
    emptyLog: mapPanel(
      requiredRecord(read(record, 'emptyLog'), `${field}.emptyLog`),
      `${field}.emptyLog`,
    ),
    emptyParticipants: mapEmptyParticipants(
      requiredRecord(read(record, 'emptyParticipants'), `${field}.emptyParticipants`),
      `${field}.emptyParticipants`,
    ),
    live: mapLive(
      requiredRecord(read(record, 'live'), `${field}.live`),
      `${field}.live`,
    ),
    workflow: mapWorkflow(
      requiredRecord(read(record, 'workflow'), `${field}.workflow`),
      `${field}.workflow`,
    ),
  };
}

function mapPanel(
  record: JsonRecord,
  field: string,
): CombatSourcePanelPresentation {
  return {
    title: requiredText(read(record, 'title'), `${field}.title`),
    text: requiredText(read(record, 'text'), `${field}.text`),
  };
}

function mapEmptyParticipants(
  record: JsonRecord,
  field: string,
): CombatSourceEmptyParticipantsPresentation {
  return {
    loading: read(record, 'loading') === null
      ? null
      : mapParticipantEmptyState(
          requiredRecord(read(record, 'loading'), `${field}.loading`),
          `${field}.loading`,
        ),
    unavailable: mapParticipantEmptyState(
      requiredRecord(read(record, 'unavailable'), `${field}.unavailable`),
      `${field}.unavailable`,
    ),
  };
}

function mapParticipantEmptyState(
  record: JsonRecord,
  field: string,
): CombatSourceParticipantEmptyStatePresentation {
  return {
    leftTitle: requiredText(read(record, 'leftTitle'), `${field}.leftTitle`),
    leftText: requiredText(read(record, 'leftText'), `${field}.leftText`),
    rightTitle: requiredText(read(record, 'rightTitle'), `${field}.rightTitle`),
    rightText: requiredText(read(record, 'rightText'), `${field}.rightText`),
  };
}

function mapLive(
  record: JsonRecord,
  field: string,
): CombatSourcePresentation['live'] {
  return {
    contextLabel: requiredNullableText(read(record, 'contextLabel'), `${field}.contextLabel`),
    title: requiredNullableText(read(record, 'title'), `${field}.title`),
    helperText: requiredNullableText(read(record, 'helperText'), `${field}.helperText`),
    submittingHelperText: requiredNullableText(
      read(record, 'submittingHelperText'),
      `${field}.submittingHelperText`,
    ),
    preparingHelperText: requiredNullableText(
      read(record, 'preparingHelperText'),
      `${field}.preparingHelperText`,
    ),
    completedHelperText: requiredNullableText(
      read(record, 'completedHelperText'),
      `${field}.completedHelperText`,
    ),
    timingActionLabel: requiredNullableText(
      read(record, 'timingActionLabel'),
      `${field}.timingActionLabel`,
    ),
    meterTitle: requiredNullableText(read(record, 'meterTitle'), `${field}.meterTitle`),
    meterHelperText: requiredNullableText(
      read(record, 'meterHelperText'),
      `${field}.meterHelperText`,
    ),
    meterEarlyLabel: requiredNullableText(
      read(record, 'meterEarlyLabel'),
      `${field}.meterEarlyLabel`,
    ),
    meterHitZoneLabel: requiredNullableText(
      read(record, 'meterHitZoneLabel'),
      `${field}.meterHitZoneLabel`,
    ),
    meterLateLabel: requiredNullableText(
      read(record, 'meterLateLabel'),
      `${field}.meterLateLabel`,
    ),
  };
}

function mapWorkflow(
  record: JsonRecord,
  field: string,
): CombatSourcePresentation['workflow'] {
  return {
    finalizingResult: read(record, 'finalizingResult') === null
      ? null
      : mapPanel(
          requiredRecord(read(record, 'finalizingResult'), `${field}.finalizingResult`),
          `${field}.finalizingResult`,
        ),
    finalizeUnavailable: read(record, 'finalizeUnavailable') === null
      ? null
      : mapPanel(
          requiredRecord(read(record, 'finalizeUnavailable'), `${field}.finalizeUnavailable`),
          `${field}.finalizeUnavailable`,
        ),
    actionUnavailable: read(record, 'actionUnavailable') === null
      ? null
      : mapPanel(
          requiredRecord(read(record, 'actionUnavailable'), `${field}.actionUnavailable`),
          `${field}.actionUnavailable`,
        ),
  };
}
