import {
  EXPLORATION_DIFFICULTY_COPY_KEYS,
  EXPLORATION_DIFFICULTY_TRIAL_KEYS,
  ExplorationDifficultyCopyKey,
  ExplorationDifficultyTrialKey,
} from '../domain/game-copy/exploration-difficulty-copy.model';
import { cardBackgroundClass } from './card-backgrounds.config';

const EXPLORATION_DIFFICULTY_BACKGROUND_KEYS = {
  easy: 'difficulty-peloponese-hills',
  medium: 'difficulty-heracles-pillars',
  hard: 'difficulty-near-styx',
} as const satisfies Record<ExplorationDifficultyCopyKey, string>;

const EXPLORATION_TRIAL_BACKGROUND_KEYS = {
  strength: 'trial-ares',
  dexterity: 'trial-artemis',
  agility: 'trial-apollo',
  endurance: 'trial-hephaestus',
  cunning: 'trial-hermes',
  charisma: 'trial-aphrodite',
  wisdom: 'trial-athena',
  intelligence: 'trial-hera',
  spirituality: 'trial-zeus',
} as const satisfies Record<ExplorationDifficultyTrialKey, string>;

export function explorationDifficultyCardBackgroundClass(difficultyKey: string): string {
  return cardBackgroundClass(
    EXPLORATION_DIFFICULTY_BACKGROUND_KEYS[
      requireExplorationDifficultyKey(difficultyKey)
    ],
  );
}

export function explorationTrialCardBackgroundClass(statKey: string): string {
  return cardBackgroundClass(
    EXPLORATION_TRIAL_BACKGROUND_KEYS[
      requireExplorationTrialKey(statKey)
    ],
  );
}

function requireExplorationDifficultyKey(
  difficultyKey: string,
): ExplorationDifficultyCopyKey {
  if (EXPLORATION_DIFFICULTY_COPY_KEYS.includes(difficultyKey as ExplorationDifficultyCopyKey)) {
    return difficultyKey as ExplorationDifficultyCopyKey;
  }

  throw new Error(`Unsupported exploration difficulty background key: ${difficultyKey}.`);
}

function requireExplorationTrialKey(statKey: string): ExplorationDifficultyTrialKey {
  if (EXPLORATION_DIFFICULTY_TRIAL_KEYS.includes(statKey as ExplorationDifficultyTrialKey)) {
    return statKey as ExplorationDifficultyTrialKey;
  }

  throw new Error(`Unsupported exploration trial background key: ${statKey}.`);
}
