import { Injectable } from '@angular/core';
import {
  ItemAffixDefinition,
  ItemBaseDefinition,
  ItemGenerationCatalog,
  ItemGenerationStep,
} from '../../domain/item/item-generation.model';
import {
  rollWeighted,
  upgradeWeight,
} from '../../utils/item-generation-rules';
import { UpgradeCandidate } from '../../types/item-generation-rules.types';

@Injectable({ providedIn: 'root' })
export class ItemGenerationUpgradeFactory {
  tryUpgradeToBucket(params: {
    catalog: ItemGenerationCatalog;
    base: ItemBaseDefinition;
    prefix: ItemAffixDefinition | null;
    suffix: ItemAffixDefinition | null;
    remainingBudget: number;
    luck: number;
    process: ItemGenerationStep[];
  }) {
    const { catalog, luck, process } = params;
    let { base, prefix, suffix, remainingBudget } = params;

    if (remainingBudget <= 0) {
      process.push({
        title: 'Upgrade pass',
        detail: 'No spare budget remained after the base and affix rolls.',
      });
      return { base, prefix, suffix, remainingBudget };
    }

    const currentValue = base.baseValue + (prefix?.goldValue ?? 0) + (suffix?.goldValue ?? 0);
    const pressureBonus = Math.min((remainingBudget / Math.max(currentValue, 1)) * 0.08, 0.16);
    const upgradeChance = Math.min(
      0.05 +
        luck * 0.0018 +
        (prefix ? 0 : 0.07) +
        (suffix ? 0 : 0.1) +
        (prefix || suffix ? 0 : 0.05) +
        pressureBonus,
      0.58
    );
    const upgradeRoll = Math.random();

    if (upgradeRoll > upgradeChance) {
      process.push({
        title: 'Upgrade pass',
        detail: `Roll ${upgradeRoll.toFixed(2)} missed ${Math.round(upgradeChance * 100)}% chance. The spare ${remainingBudget} drachms were not used.`,
      });
      return { base, prefix, suffix, remainingBudget };
    }

    const candidates = this.getUpgradeCandidates({ catalog, base, prefix, suffix, remainingBudget });

    if (candidates.length === 0) {
      process.push({
        title: 'Upgrade pass',
        detail: `Roll ${upgradeRoll.toFixed(2)} passed, but there was no legal way to improve one part within the remaining ${remainingBudget} drachms.`,
      });
      return { base, prefix, suffix, remainingBudget };
    }

    const picked = rollWeighted(
      candidates,
      candidates.map((candidate) => upgradeWeight(candidate, remainingBudget, luck))
    ).value;

    base = picked.base ?? base;
    prefix = picked.prefix ?? prefix;
    suffix = picked.suffix ?? suffix;
    remainingBudget = Math.max(0, remainingBudget - picked.deltaValue);
    process.push({
      title: 'Upgrade pass',
      detail: `Roll ${upgradeRoll.toFixed(2)} passed ${Math.round(upgradeChance * 100)}% chance. ${picked.label} used ${picked.deltaValue} extra drachms. Remaining spare budget: ${remainingBudget}.`,
    });

    return { base, prefix, suffix, remainingBudget };
  }

  private getUpgradeCandidates(params: {
    catalog: ItemGenerationCatalog;
    base: ItemBaseDefinition;
    prefix: ItemAffixDefinition | null;
    suffix: ItemAffixDefinition | null;
    remainingBudget: number;
  }): UpgradeCandidate[] {
    const { catalog, base, prefix, suffix, remainingBudget } = params;
    const baseCandidates = catalog.bases
      .filter(
        (candidate) =>
          candidate.baseTypeKey === base.baseTypeKey &&
          candidate.baseValue > base.baseValue &&
          candidate.baseValue - base.baseValue <= remainingBudget
      )
      .map((candidate) => ({
        target: 'base' as const,
        label: `Base upgraded from ${base.name} to ${candidate.name}.`,
        deltaValue: candidate.baseValue - base.baseValue,
        base: candidate,
      }));

    return [
      ...baseCandidates,
      ...this.getAffixUpgradeCandidates(catalog.prefixes, prefix, remainingBudget, 'prefix'),
      ...this.getAffixUpgradeCandidates(catalog.suffixes, suffix, remainingBudget, 'suffix'),
    ];
  }

  private getAffixUpgradeCandidates(
    affixes: ItemAffixDefinition[],
    currentAffix: ItemAffixDefinition | null,
    remainingBudget: number,
    target: 'prefix' | 'suffix'
  ): UpgradeCandidate[] {
    return affixes
      .filter((candidate) =>
        currentAffix
          ? candidate.goldValue > currentAffix.goldValue &&
            candidate.goldValue - currentAffix.goldValue <= remainingBudget
          : candidate.goldValue <= remainingBudget
      )
      .map((candidate) => ({
        target,
        label: currentAffix
          ? `${target === 'prefix' ? 'Prefix' : 'Suffix'} upgraded to ${candidate.name}.`
          : `${target === 'prefix' ? 'Prefix' : 'Suffix'} added during upgrade pass: ${candidate.name}.`,
        deltaValue: currentAffix ? candidate.goldValue - currentAffix.goldValue : candidate.goldValue,
        prefix: target === 'prefix' ? candidate : undefined,
        suffix: target === 'suffix' ? candidate : undefined,
      }));
  }
}
