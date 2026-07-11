export interface ManualTrialCompletionPresentation {
  kind: 'manual_trial';
  failureReasonKey: string | null;
}

export const MINIGAME_KEY = {
  combat: 'combat',
} as const;

export const MINIGAME_IMPLEMENTATION_KEY = {
  combat: 'combat',
} as const;

export type MinigameKey = typeof MINIGAME_KEY[keyof typeof MINIGAME_KEY];

export const MINIGAME_SOURCE_ENTITY_TYPE = {
  explorationChallengeAttempt: 'exploration_challenge_attempt',
  pvpAction: 'pvp_action',
} as const;

export type MinigameSourceEntityType =
  typeof MINIGAME_SOURCE_ENTITY_TYPE[keyof typeof MINIGAME_SOURCE_ENTITY_TYPE];

export interface MinigameSourceRef {
  sourceEntityType: MinigameSourceEntityType;
  sourceEntityId: string;
}

export interface MinigameCompletionEvent {
  minigameKey: MinigameKey;
  sourceEntityId: string;
  resultId?: string | null;
  reportId?: string | null;
  rewardGrantId?: string | null;
  presentationSource?: ManualTrialCompletionPresentation | null;
}

export function isMinigameKey(value: string): value is MinigameKey {
  return Object.values(MINIGAME_KEY).some((key) => key === value);
}
