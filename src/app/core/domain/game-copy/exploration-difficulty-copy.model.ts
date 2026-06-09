import { RichTextFragment, RichTextTone } from '../rich-text/rich-text.model';

export const EXPLORATION_DIFFICULTY_COPY_CONTRACT_VERSION =
  'exploration_difficulty_copy_v1';

export const EXPLORATION_DIFFICULTY_COPY_ARTICLE_KEY = 'difficulty_selection';

export const EXPLORATION_DIFFICULTY_COPY_KEYS = [
  'easy',
  'medium',
  'hard',
] as const;

export const EXPLORATION_DIFFICULTY_TRIAL_KEYS = [
  'strength',
  'dexterity',
  'endurance',
  'agility',
  'cunning',
  'charisma',
  'wisdom',
  'intelligence',
  'spirituality',
] as const;

export type ExplorationDifficultyCopyContractVersion =
  typeof EXPLORATION_DIFFICULTY_COPY_CONTRACT_VERSION;
export type ExplorationDifficultyCopyArticleKey =
  typeof EXPLORATION_DIFFICULTY_COPY_ARTICLE_KEY;
export type ExplorationDifficultyCopyLocale = 'pl';
export type ExplorationDifficultyCopyKey =
  (typeof EXPLORATION_DIFFICULTY_COPY_KEYS)[number];
export type ExplorationDifficultyTrialKey =
  (typeof EXPLORATION_DIFFICULTY_TRIAL_KEYS)[number];
export type ExplorationDifficultyRichTextTone = RichTextTone;

export interface ExplorationDifficultyCopy {
  contractVersion: ExplorationDifficultyCopyContractVersion;
  locale: ExplorationDifficultyCopyLocale;
  articleKey: ExplorationDifficultyCopyArticleKey;
  header: ExplorationDifficultyHeaderCopy;
  statusPanel: ExplorationDifficultyStatusPanelCopy;
  difficulty: ExplorationDifficultySectionCopy;
  trialDetails: ExplorationDifficultyTrialDetailsCopy;
}

export interface ExplorationDifficultyHeaderCopy {
  eyebrow: string;
  title: string;
  intro: string;
}

export interface ExplorationDifficultyStatusPanelCopy {
  labels: ExplorationDifficultyStatusLabelsCopy;
  emptyValues: ExplorationDifficultyStatusEmptyValuesCopy;
}

export interface ExplorationDifficultyStatusLabelsCopy {
  difficulty: string;
  estimatedAutoResult: string;
  trialsToday: string;
  activeEffect: string;
}

export interface ExplorationDifficultyStatusEmptyValuesCopy {
  noDifficulty: string;
  noAutoResult: string;
  noTrials: string;
  noEffect: string;
}

export interface ExplorationDifficultySectionCopy {
  section: ExplorationDifficultySectionIntroCopy;
  cards: Record<ExplorationDifficultyCopyKey, ExplorationDifficultyCardCopy>;
  metrics: ExplorationDifficultyMetricLabelsCopy;
  actions: ExplorationDifficultyActionCopy;
}

export interface ExplorationDifficultySectionIntroCopy {
  title: string;
  description: string;
}

export interface ExplorationDifficultyCardCopy {
  title: string;
  subtitle: string;
  description: string;
}

export interface ExplorationDifficultyMetricLabelsCopy {
  duration: string;
  trialChance: string;
  manifestationChance: string;
  autoResolveChance: string;
  rewardItems: string;
}

export interface ExplorationDifficultyActionCopy {
  startExploration: string;
  continueExploration: string;
  changeDifficulty: string;
}

export interface ExplorationDifficultyTrialDetailsCopy {
  section: ExplorationDifficultyTrialDetailsSectionCopy;
  labels: ExplorationDifficultyTrialDetailsLabelsCopy;
  trials: Record<ExplorationDifficultyTrialKey, string>;
}

export interface ExplorationDifficultyTrialDetailsSectionCopy {
  title: string;
  descriptionPlainText: string;
  descriptionRichText: ExplorationDifficultyRichTextFragment[];
}

export interface ExplorationDifficultyRichTextFragment extends RichTextFragment {
  kind: 'text';
  tone?: ExplorationDifficultyRichTextTone;
}

export interface ExplorationDifficultyTrialDetailsLabelsCopy {
  selectedDifficulty: string;
  manifestation: string;
  autoResult: string;
}

export function explorationDifficultyCardCopy(
  copy: ExplorationDifficultyCopy,
  difficultyKey: string,
): ExplorationDifficultyCardCopy {
  return copy.difficulty.cards[explorationDifficultyCopyKey(difficultyKey)];
}

export function explorationDifficultyTrialLabel(
  copy: ExplorationDifficultyCopy,
  statKey: string,
): string {
  return copy.trialDetails.trials[explorationDifficultyTrialKey(statKey)];
}

function explorationDifficultyCopyKey(
  difficultyKey: string,
): ExplorationDifficultyCopyKey {
  if (isExplorationDifficultyCopyKey(difficultyKey)) {
    return difficultyKey;
  }

  throw new Error(`Unsupported exploration difficulty copy key: ${difficultyKey}.`);
}

function explorationDifficultyTrialKey(
  statKey: string,
): ExplorationDifficultyTrialKey {
  if (isExplorationDifficultyTrialKey(statKey)) {
    return statKey;
  }

  throw new Error(`Unsupported exploration difficulty trial key: ${statKey}.`);
}

function isExplorationDifficultyCopyKey(
  difficultyKey: string,
): difficultyKey is ExplorationDifficultyCopyKey {
  return EXPLORATION_DIFFICULTY_COPY_KEYS.includes(
    difficultyKey as ExplorationDifficultyCopyKey,
  );
}

function isExplorationDifficultyTrialKey(
  statKey: string,
): statKey is ExplorationDifficultyTrialKey {
  return EXPLORATION_DIFFICULTY_TRIAL_KEYS.includes(
    statKey as ExplorationDifficultyTrialKey,
  );
}
