import {
  isExplorationRuntimeLocale,
  type ExplorationCombatEffectTemplateCopy,
  type ExplorationRuntimeCopy,
  type ExplorationRuntimeCopyTitleText,
} from '../domain/exploration/exploration-runtime-copy.model';
import type { Database } from '../types/database.types';
import {
  type JsonRecord,
  requiredRecord,
  requiredRecordField,
  requiredTextFields,
  requireLiteral,
} from './json-read';
import { mapCombatSourcePresentationCopy } from './combat-source-presentation-copy.mapper';

export function mapExplorationRuntimeCopy(
  raw: Database['public']['Functions']['get_player_exploration_runtime_copy']['Returns'],
): ExplorationRuntimeCopy {
  const path = 'exploration runtime';
  const root = requiredRecord(raw, 'get_player_exploration_runtime_copy');
  const contract = requiredTextFields(root, path, ['contractKey', 'contractVersion', 'requestedLocale', 'locale', 'fallbackLocale']);

  if (!isExplorationRuntimeLocale(contract.locale)) {
    throw new Error(`${path}.locale must be pl or en.`);
  }

  const pendingPath = `${path}.pendingStep`;
  const pending = requiredRecordField(root, 'pendingStep', path);
  const keysPath = `${path}.combatSourcePresentationKeys`;
  const keys = requiredTextFields(requiredRecordField(root, 'combatSourcePresentationKeys', path), keysPath, ['default', 'trial', 'combatEncounter']);
  const presentationsPath = `${path}.combatSourcePresentations`;
  const presentations = requiredRecordField(root, 'combatSourcePresentations', path);
  const effectPath = `${path}.combatEffect`;
  const effect = requiredRecordField(root, 'combatEffect', path);

  return {
    contractKey: requireLiteral(contract.contractKey, 'exploration_runtime_copy', `${path}.contractKey`),
    contractVersion: requireLiteral(
      contract.contractVersion, 'exploration_runtime_copy_v1', `${path}.contractVersion`,
    ),
    requestedLocale: contract.requestedLocale,
    locale: contract.locale,
    fallbackLocale: requireLiteral(contract.fallbackLocale, 'en', `${path}.fallbackLocale`),
    pendingStep: {
      inProgress: mapExplorationTitleText(requiredRecordField(pending, 'inProgress', pendingPath), `${pendingPath}.inProgress`),
      ready: mapExplorationTitleText(requiredRecordField(pending, 'ready', pendingPath), `${pendingPath}.ready`),
      ...requiredTextFields(pending, pendingPath, [
        'readyActionLabel', 'progressAriaLabel', 'timeAriaLabel',
      ]),
      loading: mapExplorationTitleText(requiredRecordField(pending, 'loading', pendingPath), `${pendingPath}.loading`),
      unavailable: mapExplorationTitleText(requiredRecordField(pending, 'unavailable', pendingPath), `${pendingPath}.unavailable`),
    },
    movement: requiredTextFields(
      requiredRecordField(root, 'movement', path), `${path}.movement`, [
        'title', 'summary', 'destinationLabel', 'travelDurationLabel', 'selectedLabel',
        'backtrackLabel', 'unavailableLabel', 'emptyTitle', 'emptyText',
        'startActionLabel', 'startingLabel', 'startedFeedback',
      ],
    ),
    runtimeActions: requiredTextFields(
      requiredRecordField(root, 'runtimeActions', path), `${path}.runtimeActions`,
      ['changeDifficultyLabel', 'changeDifficultyTooltip'],
    ),
    activeChallenge: requiredTextFields(
      requiredRecordField(root, 'activeChallenge', path), `${path}.activeChallenge`,
      ['awaitingActionLabel', 'inProgressLabel', 'readyLabel', 'completedLabel',
        'unavailableTitle', 'unavailableText'],
    ),
    combatSourcePresentationKeys: {
      default: requireLiteral(keys.default, 'default', `${keysPath}.default`),
      trial: requireLiteral(keys.trial, 'trial', `${keysPath}.trial`),
      combatEncounter: requireLiteral(
        keys.combatEncounter, 'combatEncounter', `${keysPath}.combatEncounter`,
      ),
    },
    combatSourcePresentations: {
      default: mapCombatSourcePresentationCopy(requiredRecordField(presentations, 'default', presentationsPath), `${presentationsPath}.default`),
      trial: mapCombatSourcePresentationCopy(requiredRecordField(presentations, 'trial', presentationsPath), `${presentationsPath}.trial`),
      combatEncounter: mapCombatSourcePresentationCopy(requiredRecordField(presentations, 'combatEncounter', presentationsPath), `${presentationsPath}.combatEncounter`),
    },
    combatEffect: {
      buff: mapCombatEffectTemplate(
        requiredRecordField(effect, 'buff', effectPath), 'success', `${effectPath}.buff`,
      ),
      debuff: mapCombatEffectTemplate(
        requiredRecordField(effect, 'debuff', effectPath), 'danger', `${effectPath}.debuff`,
      ),
    },
    feedback: requiredTextFields(
      requiredRecordField(root, 'feedback', path), `${path}.feedback`, [
        'refreshing', 'refreshed', 'movementStarting', 'movementStarted',
        'resolveStepStarting', 'resolveStepReady', 'actionUnavailable', 'genericError',
      ],
    ),
  };
}

export function mapExplorationTitleText(
  record: JsonRecord,
  path: string,
): ExplorationRuntimeCopyTitleText {
  return requiredTextFields(record, path, ['title', 'text']);
}

export function mapCombatEffectTemplate(
  record: JsonRecord,
  tone: ExplorationCombatEffectTemplateCopy['tone'],
  path: string,
): ExplorationCombatEffectTemplateCopy {
  const fields = requiredTextFields(record, path, ['title', 'textTemplate', 'tone']);

  return {
    title: fields.title,
    textTemplate: fields.textTemplate,
    tone: requireLiteral(fields.tone, tone, `${path}.tone`),
  };
}
