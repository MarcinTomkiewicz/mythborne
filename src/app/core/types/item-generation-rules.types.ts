import {
  ItemAffixDefinition,
  ItemBaseDefinition,
} from './item-generation.types';

export type UpgradeTarget = 'base' | 'prefix' | 'suffix';

export interface UpgradeCandidate {
  target: UpgradeTarget;
  label: string;
  deltaValue: number;
  base?: ItemBaseDefinition;
  prefix?: ItemAffixDefinition | null;
  suffix?: ItemAffixDefinition | null;
}
