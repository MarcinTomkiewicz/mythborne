import { CombatSourcePresentation } from '../combat/combat-source-presentation.model';

export type ExplorationRuntimeCopyLocale = 'pl' | 'en';

export type ExplorationCombatSourcePresentationKey =
  | 'default'
  | 'trial'
  | 'combatEncounter';

export type ExplorationCombatEffectTone = 'success' | 'danger';

export interface ExplorationRuntimeCopy {
  contractKey: 'exploration_runtime_copy';
  contractVersion: 'exploration_runtime_copy_v1';
  requestedLocale: string;
  locale: ExplorationRuntimeCopyLocale;
  fallbackLocale: 'en';
  pendingStep: ExplorationPendingStepCopy;
  movement: ExplorationMovementCopy;
  runtimeActions: ExplorationRuntimeActionsCopy;
  activeChallenge: ExplorationActiveChallengeCopy;
  combatSourcePresentationKeys: ExplorationCombatSourcePresentationKeysCopy;
  combatSourcePresentations: ExplorationCombatSourcePresentationsCopy;
  combatEffect: ExplorationCombatEffectCopy;
  feedback: ExplorationRuntimeFeedbackCopy;
}

export interface ExplorationRuntimeCopyTitleText {
  title: string;
  text: string;
}

export interface ExplorationPendingStepCopy {
  inProgress: ExplorationRuntimeCopyTitleText;
  ready: ExplorationRuntimeCopyTitleText;
  readyActionLabel: string;
  progressAriaLabel: string;
  timeAriaLabel: string;
  loading: ExplorationRuntimeCopyTitleText;
  unavailable: ExplorationRuntimeCopyTitleText;
}

export interface ExplorationMovementCopy {
  title: string;
  summary: string;
  destinationLabel: string;
  travelDurationLabel: string;
  selectedLabel: string;
  backtrackLabel: string;
  unavailableLabel: string;
  emptyTitle: string;
  emptyText: string;
  startActionLabel: string;
  startingLabel: string;
  startedFeedback: string;
}

export interface ExplorationRuntimeActionsCopy {
  changeDifficultyLabel: string;
  changeDifficultyTooltip: string;
}

export interface ExplorationActiveChallengeCopy {
  awaitingActionLabel: string;
  inProgressLabel: string;
  readyLabel: string;
  completedLabel: string;
  unavailableTitle: string;
  unavailableText: string;
}

export interface ExplorationCombatSourcePresentationKeysCopy {
  default: 'default';
  trial: 'trial';
  combatEncounter: 'combatEncounter';
}

export interface ExplorationCombatSourcePresentationsCopy {
  default: CombatSourcePresentation;
  trial: CombatSourcePresentation;
  combatEncounter: CombatSourcePresentation;
}

export interface ExplorationCombatEffectCopy {
  buff: ExplorationCombatEffectTemplateCopy;
  debuff: ExplorationCombatEffectTemplateCopy;
}

export interface ExplorationCombatEffectTemplateCopy {
  title: string;
  textTemplate: string;
  tone: ExplorationCombatEffectTone;
}

export interface ExplorationRuntimeFeedbackCopy {
  refreshing: string;
  refreshed: string;
  movementStarting: string;
  movementStarted: string;
  resolveStepStarting: string;
  resolveStepReady: string;
  actionUnavailable: string;
  genericError: string;
}
