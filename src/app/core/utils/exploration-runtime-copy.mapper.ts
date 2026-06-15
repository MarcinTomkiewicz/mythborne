import {
  ExplorationActiveChallengeCopy,
  ExplorationCombatEffectCopy,
  ExplorationCombatEffectTemplateCopy,
  ExplorationCombatSourcePresentationKeysCopy,
  ExplorationCombatSourcePresentationsCopy,
  ExplorationMovementCopy,
  ExplorationPendingStepCopy,
  ExplorationRuntimeActionsCopy,
  ExplorationRuntimeCopy,
  ExplorationRuntimeCopyLocale,
  ExplorationRuntimeCopyTitleText,
  ExplorationRuntimeFeedbackCopy,
} from '../domain/exploration/exploration-runtime-copy.model';
import { Database } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredRecord,
  requiredText,
  requireLiteral,
} from './json-read';
import { mapCombatSourcePresentationCopy } from './combat-source-presentation-copy.mapper';

export function mapExplorationRuntimeCopy(
  raw: Database['public']['Functions']['get_player_exploration_runtime_copy']['Returns'],
): ExplorationRuntimeCopy {
  const root = requiredRecord(raw, 'get_player_exploration_runtime_copy');
  const locale = requiredText(read(root, 'locale'), 'exploration runtime locale');

  return {
    contractKey: requireLiteral(
      requiredText(read(root, 'contractKey'), 'exploration runtime contractKey'),
      'exploration_runtime_copy',
      'exploration runtime contractKey',
    ),
    contractVersion: requireLiteral(
      requiredText(
        read(root, 'contractVersion'),
        'exploration runtime contractVersion',
      ),
      'exploration_runtime_copy_v1',
      'exploration runtime contractVersion',
    ),
    requestedLocale: requiredText(
      read(root, 'requestedLocale'),
      'exploration runtime requestedLocale',
    ),
    locale: requireLocale(locale, 'exploration runtime locale'),
    fallbackLocale: requireLiteral(
      requiredText(read(root, 'fallbackLocale'), 'exploration runtime fallbackLocale'),
      'en',
      'exploration runtime fallbackLocale',
    ),
    pendingStep: mapPendingStep(
      requiredRecord(read(root, 'pendingStep'), 'exploration runtime pendingStep'),
    ),
    movement: mapMovement(
      requiredRecord(read(root, 'movement'), 'exploration runtime movement'),
    ),
    runtimeActions: mapRuntimeActions(
      requiredRecord(
        read(root, 'runtimeActions'),
        'exploration runtime runtimeActions',
      ),
    ),
    activeChallenge: mapActiveChallenge(
      requiredRecord(
        read(root, 'activeChallenge'),
        'exploration runtime activeChallenge',
      ),
    ),
    combatSourcePresentationKeys: mapCombatSourcePresentationKeys(
      requiredRecord(
        read(root, 'combatSourcePresentationKeys'),
        'exploration runtime combatSourcePresentationKeys',
      ),
    ),
    combatSourcePresentations: mapCombatSourcePresentations(
      requiredRecord(
        read(root, 'combatSourcePresentations'),
        'exploration runtime combatSourcePresentations',
      ),
    ),
    combatEffect: mapCombatEffect(
      requiredRecord(read(root, 'combatEffect'), 'exploration runtime combatEffect'),
    ),
    feedback: mapFeedback(
      requiredRecord(read(root, 'feedback'), 'exploration runtime feedback'),
    ),
  };
}

function requireLocale(
  value: string,
  field: string,
): ExplorationRuntimeCopyLocale {
  if (value !== 'pl' && value !== 'en') {
    throw new Error(`${field} must be pl or en.`);
  }

  return value;
}

function mapTitleText(
  record: JsonRecord,
  field: string,
): ExplorationRuntimeCopyTitleText {
  return {
    title: requiredText(read(record, 'title'), `${field}.title`),
    text: requiredText(read(record, 'text'), `${field}.text`),
  };
}

function mapPendingStep(record: JsonRecord): ExplorationPendingStepCopy {
  return {
    inProgress: mapTitleText(
      requiredRecord(
        read(record, 'inProgress'),
        'exploration runtime pendingStep.inProgress',
      ),
      'exploration runtime pendingStep.inProgress',
    ),
    ready: mapTitleText(
      requiredRecord(read(record, 'ready'), 'exploration runtime pendingStep.ready'),
      'exploration runtime pendingStep.ready',
    ),
    readyActionLabel: requiredText(
      read(record, 'readyActionLabel'),
      'exploration runtime pendingStep.readyActionLabel',
    ),
    progressAriaLabel: requiredText(
      read(record, 'progressAriaLabel'),
      'exploration runtime pendingStep.progressAriaLabel',
    ),
    timeAriaLabel: requiredText(
      read(record, 'timeAriaLabel'),
      'exploration runtime pendingStep.timeAriaLabel',
    ),
    loading: mapTitleText(
      requiredRecord(
        read(record, 'loading'),
        'exploration runtime pendingStep.loading',
      ),
      'exploration runtime pendingStep.loading',
    ),
    unavailable: mapTitleText(
      requiredRecord(
        read(record, 'unavailable'),
        'exploration runtime pendingStep.unavailable',
      ),
      'exploration runtime pendingStep.unavailable',
    ),
  };
}

function mapMovement(record: JsonRecord): ExplorationMovementCopy {
  return {
    title: requiredText(read(record, 'title'), 'exploration runtime movement.title'),
    summary: requiredText(read(record, 'summary'), 'exploration runtime movement.summary'),
    destinationLabel: requiredText(
      read(record, 'destinationLabel'),
      'exploration runtime movement.destinationLabel',
    ),
    travelDurationLabel: requiredText(
      read(record, 'travelDurationLabel'),
      'exploration runtime movement.travelDurationLabel',
    ),
    selectedLabel: requiredText(
      read(record, 'selectedLabel'),
      'exploration runtime movement.selectedLabel',
    ),
    backtrackLabel: requiredText(
      read(record, 'backtrackLabel'),
      'exploration runtime movement.backtrackLabel',
    ),
    unavailableLabel: requiredText(
      read(record, 'unavailableLabel'),
      'exploration runtime movement.unavailableLabel',
    ),
    emptyTitle: requiredText(
      read(record, 'emptyTitle'),
      'exploration runtime movement.emptyTitle',
    ),
    emptyText: requiredText(
      read(record, 'emptyText'),
      'exploration runtime movement.emptyText',
    ),
    startActionLabel: requiredText(
      read(record, 'startActionLabel'),
      'exploration runtime movement.startActionLabel',
    ),
    startingLabel: requiredText(
      read(record, 'startingLabel'),
      'exploration runtime movement.startingLabel',
    ),
    startedFeedback: requiredText(
      read(record, 'startedFeedback'),
      'exploration runtime movement.startedFeedback',
    ),
  };
}

function mapRuntimeActions(record: JsonRecord): ExplorationRuntimeActionsCopy {
  return {
    changeDifficultyLabel: requiredText(
      read(record, 'changeDifficultyLabel'),
      'exploration runtime runtimeActions.changeDifficultyLabel',
    ),
    changeDifficultyTooltip: requiredText(
      read(record, 'changeDifficultyTooltip'),
      'exploration runtime runtimeActions.changeDifficultyTooltip',
    ),
  };
}

function mapActiveChallenge(record: JsonRecord): ExplorationActiveChallengeCopy {
  return {
    awaitingActionLabel: requiredText(
      read(record, 'awaitingActionLabel'),
      'exploration runtime activeChallenge.awaitingActionLabel',
    ),
    inProgressLabel: requiredText(
      read(record, 'inProgressLabel'),
      'exploration runtime activeChallenge.inProgressLabel',
    ),
    readyLabel: requiredText(
      read(record, 'readyLabel'),
      'exploration runtime activeChallenge.readyLabel',
    ),
    completedLabel: requiredText(
      read(record, 'completedLabel'),
      'exploration runtime activeChallenge.completedLabel',
    ),
    unavailableTitle: requiredText(
      read(record, 'unavailableTitle'),
      'exploration runtime activeChallenge.unavailableTitle',
    ),
    unavailableText: requiredText(
      read(record, 'unavailableText'),
      'exploration runtime activeChallenge.unavailableText',
    ),
  };
}

function mapCombatSourcePresentationKeys(
  record: JsonRecord,
): ExplorationCombatSourcePresentationKeysCopy {
  return {
    default: requireLiteral(
      requiredText(
        read(record, 'default'),
        'exploration runtime combatSourcePresentationKeys.default',
      ),
      'default',
      'exploration runtime combatSourcePresentationKeys.default',
    ),
    trial: requireLiteral(
      requiredText(
        read(record, 'trial'),
        'exploration runtime combatSourcePresentationKeys.trial',
      ),
      'trial',
      'exploration runtime combatSourcePresentationKeys.trial',
    ),
    combatEncounter: requireLiteral(
      requiredText(
        read(record, 'combatEncounter'),
        'exploration runtime combatSourcePresentationKeys.combatEncounter',
      ),
      'combatEncounter',
      'exploration runtime combatSourcePresentationKeys.combatEncounter',
    ),
  };
}

function mapCombatSourcePresentations(
  record: JsonRecord,
): ExplorationCombatSourcePresentationsCopy {
  return {
    default: mapCombatSourcePresentationCopy(
      requiredRecord(
        read(record, 'default'),
        'exploration runtime combatSourcePresentations.default',
      ),
      'exploration runtime combatSourcePresentations.default',
    ),
    trial: mapCombatSourcePresentationCopy(
      requiredRecord(
        read(record, 'trial'),
        'exploration runtime combatSourcePresentations.trial',
      ),
      'exploration runtime combatSourcePresentations.trial',
    ),
    combatEncounter: mapCombatSourcePresentationCopy(
      requiredRecord(
        read(record, 'combatEncounter'),
        'exploration runtime combatSourcePresentations.combatEncounter',
      ),
      'exploration runtime combatSourcePresentations.combatEncounter',
    ),
  };
}

function mapCombatEffect(record: JsonRecord): ExplorationCombatEffectCopy {
  return {
    buff: mapCombatEffectTemplate(
      requiredRecord(read(record, 'buff'), 'exploration runtime combatEffect.buff'),
      'success',
      'exploration runtime combatEffect.buff',
    ),
    debuff: mapCombatEffectTemplate(
      requiredRecord(read(record, 'debuff'), 'exploration runtime combatEffect.debuff'),
      'danger',
      'exploration runtime combatEffect.debuff',
    ),
  };
}

function mapCombatEffectTemplate(
  record: JsonRecord,
  tone: ExplorationCombatEffectTemplateCopy['tone'],
  field: string,
): ExplorationCombatEffectTemplateCopy {
  return {
    title: requiredText(read(record, 'title'), `${field}.title`),
    textTemplate: requiredText(read(record, 'textTemplate'), `${field}.textTemplate`),
    tone: requireLiteral(
      requiredText(read(record, 'tone'), `${field}.tone`),
      tone,
      `${field}.tone`,
    ),
  };
}

function mapFeedback(record: JsonRecord): ExplorationRuntimeFeedbackCopy {
  return {
    refreshing: requiredText(
      read(record, 'refreshing'),
      'exploration runtime feedback.refreshing',
    ),
    refreshed: requiredText(
      read(record, 'refreshed'),
      'exploration runtime feedback.refreshed',
    ),
    movementStarting: requiredText(
      read(record, 'movementStarting'),
      'exploration runtime feedback.movementStarting',
    ),
    movementStarted: requiredText(
      read(record, 'movementStarted'),
      'exploration runtime feedback.movementStarted',
    ),
    resolveStepStarting: requiredText(
      read(record, 'resolveStepStarting'),
      'exploration runtime feedback.resolveStepStarting',
    ),
    resolveStepReady: requiredText(
      read(record, 'resolveStepReady'),
      'exploration runtime feedback.resolveStepReady',
    ),
    actionUnavailable: requiredText(
      read(record, 'actionUnavailable'),
      'exploration runtime feedback.actionUnavailable',
    ),
    genericError: requiredText(
      read(record, 'genericError'),
      'exploration runtime feedback.genericError',
    ),
  };
}
