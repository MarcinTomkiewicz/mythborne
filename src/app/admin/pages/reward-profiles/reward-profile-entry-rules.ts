import {
  REWARD_AMOUNT_MODE,
  REWARD_AMOUNT_MODE_NON_NUMERIC_FALLBACKS,
  REWARD_AMOUNT_MODE_NUMERIC_FALLBACKS,
  REWARD_ENTRY_KIND,
} from '../../../core/constants/reward-runtime-keys.const';
import { RewardDictionaryReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { dictionaryOptions } from '../../../core/utils/dictionary-options';

export function isNumericRewardEntryKind(entryKind: string | null): boolean {
  return entryKind === REWARD_ENTRY_KIND.experience ||
    entryKind === REWARD_ENTRY_KIND.characterPoints ||
    entryKind === REWARD_ENTRY_KIND.resource;
}

export function rewardAmountModeOptionsForEntryKind(input: {
  amountModes: RewardDictionaryReadModel[];
  entryKind: string | null;
}) {
  const modes = input.amountModes.filter(
    (mode) => mode.key !== REWARD_AMOUNT_MODE.transferFormula,
  );

  return isNumericRewardEntryKind(input.entryKind)
    ? dictionaryOptions(
      modes.filter((mode) => mode.key !== REWARD_AMOUNT_MODE.none),
      REWARD_AMOUNT_MODE_NUMERIC_FALLBACKS,
    )
    : dictionaryOptions(
      modes.filter((mode) => mode.key === REWARD_AMOUNT_MODE.none),
      REWARD_AMOUNT_MODE_NON_NUMERIC_FALLBACKS,
    );
}
