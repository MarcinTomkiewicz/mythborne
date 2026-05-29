export const MINIGAME_KEY = {
  combat: 'combat',
} as const;

export const MINIGAME_SOURCE_ENTITY_TYPE = {
  explorationChallengeAttempt: 'exploration_challenge_attempt',
  pvpAction: 'pvp_action',
} as const;

export type MinigameKey = typeof MINIGAME_KEY[keyof typeof MINIGAME_KEY];
export type MinigameSourceEntityType =
  typeof MINIGAME_SOURCE_ENTITY_TYPE[keyof typeof MINIGAME_SOURCE_ENTITY_TYPE];

export interface MinigameSourceRef {
  sourceEntityType: MinigameSourceEntityType;
  sourceEntityId: string;
}

export interface MinigameCompletionEvent {
  minigameKey: string;
  sourceEntityId: string;
  resultId?: string | null;
  reportId?: string | null;
  rewardGrantId?: string | null;
}
