import {
  REWARD_ENTRY_KIND,
  REWARD_SOURCE_KIND,
} from '../../../core/constants/reward-runtime-keys.const';
import {
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';

export const LEVEL_UP_REWARD_EXPERIENCE_ENTRY_ERROR =
  'Level-up reward profiles cannot contain active experience entries; this would create XP reward recursion.';

export interface RewardLevelUpRoutingAwareness {
  isLevelUpProfile: boolean;
  hasActiveExperienceEntry: boolean;
  selectedProfilePolicy: 'single_best_match';
  recursionError: string | null;
}

export function toRewardLevelUpRoutingAwareness(input: {
  profile: RewardProfileReadModel | null;
  entries: readonly RewardProfileEntryReadModel[];
}): RewardLevelUpRoutingAwareness {
  const isLevelUpProfile = input.profile?.category === REWARD_SOURCE_KIND.levelUp;
  const hasActiveExperienceEntry = isLevelUpProfile &&
    rewardProfileHasActiveExperienceEntry({
      profileId: input.profile?.id ?? null,
      entries: input.entries,
    });

  return {
    isLevelUpProfile,
    hasActiveExperienceEntry,
    selectedProfilePolicy: 'single_best_match',
    recursionError: hasActiveExperienceEntry
      ? LEVEL_UP_REWARD_EXPERIENCE_ENTRY_ERROR
      : null,
  };
}

export function blocksLevelUpExperienceEntry(input: {
  profile: RewardProfileReadModel | null;
  entryKind: string;
  isActive: boolean;
}): boolean {
  return input.profile?.category === REWARD_SOURCE_KIND.levelUp &&
    input.entryKind === REWARD_ENTRY_KIND.experience &&
    input.isActive;
}

function rewardProfileHasActiveExperienceEntry(input: {
  profileId: string | null;
  entries: readonly RewardProfileEntryReadModel[];
}): boolean {
  return Boolean(input.profileId) && input.entries.some(
    (entry) =>
      entry.rewardProfileId === input.profileId &&
      entry.isActive &&
      entry.entryKind === REWARD_ENTRY_KIND.experience,
  );
}
