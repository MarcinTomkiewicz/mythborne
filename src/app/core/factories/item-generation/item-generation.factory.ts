import { Injectable, inject } from '@angular/core';
import {
  GeneratedItemPart,
  GeneratedItemResult,
  ItemAffixDefinition,
  ItemGenerationCatalog,
  ItemGenerationStep,
} from '../../domain/item/item-generation.model';
import { applyQualityScaledBonuses } from '../../utils/item-generation-catalog-mappers';
import {
  affixWeight,
  aggregateBonuses,
  baseWeight,
  bucketWeight,
  composeItemName,
  qualityWeight,
  rollWeighted,
} from '../../utils/item-generation-rules';
import { ItemGenerationUpgradeFactory } from './item-generation-upgrade.factory';

@Injectable({ providedIn: 'root' })
export class ItemGenerationFactory {
  private readonly upgradeFactory = inject(ItemGenerationUpgradeFactory);

  generate(luck: number, catalog: ItemGenerationCatalog): GeneratedItemResult {
    const sanitizedLuck = Math.max(0, Math.min(100, Math.round(luck)));
    const process: ItemGenerationStep[] = [];
    const bucketValue = this.rollBudgetBucket(catalog, sanitizedLuck, process);
    const quality = rollWeighted(
      catalog.qualities,
      catalog.qualities.map((entry) => qualityWeight(entry, sanitizedLuck))
    ).value;

    process.push({
      title: 'Quality roll',
      detail: `${quality.label} selected with multiplier x${quality.multiplier.toFixed(1)}.`,
    });

    const baseBudget = Math.max(1, Math.floor(bucketValue / quality.multiplier));
    const basePool = catalog.bases.filter((item) => item.baseValue <= baseBudget);
    const selectedBasePool = basePool.length > 0 ? basePool : [catalog.bases[0]];
    let base = rollWeighted(
      selectedBasePool,
      selectedBasePool.map((entry) => baseWeight(entry, baseBudget, sanitizedLuck))
    ).value;
    let remainingBudget = Math.max(0, baseBudget - base.baseValue);

    process.push(
      {
        title: 'Base budget',
        detail: `Bucket ${bucketValue} / quality x${quality.multiplier.toFixed(1)} = ${baseBudget} drachms available before quality.`,
      },
      {
        title: 'Base item',
        detail: `${base.name} selected for ${base.baseValue} drachms. Remaining pre-quality budget: ${remainingBudget}.`,
      }
    );

    let prefix = this.rollAffix('Prefix', catalog.prefixes, remainingBudget, sanitizedLuck, process);
    remainingBudget = Math.max(0, remainingBudget - (prefix?.goldValue ?? 0));
    let suffix = this.rollAffix('Suffix', catalog.suffixes, remainingBudget, sanitizedLuck, process);
    remainingBudget = Math.max(0, remainingBudget - (suffix?.goldValue ?? 0));

    ({ base, prefix, suffix, remainingBudget } = this.upgradeFactory.tryUpgradeToBucket({
      catalog,
      base,
      prefix,
      suffix,
      remainingBudget,
      luck: sanitizedLuck,
      process,
    }));

    const preQualityValue = base.baseValue + (prefix?.goldValue ?? 0) + (suffix?.goldValue ?? 0);
    const finalValue = Math.round(preQualityValue * quality.multiplier);
    const parts: GeneratedItemPart[] = [
      {
        label: 'Base item',
        bonuses: applyQualityScaledBonuses(base.bonuses, quality.multiplier),
      },
      ...(prefix
        ? [
            {
              label: `Prefix: ${prefix.name}`,
              bonuses: applyQualityScaledBonuses(prefix.bonuses, quality.multiplier),
            },
          ]
        : []),
      ...(suffix
        ? [
            {
              label: `Suffix: ${suffix.name}`,
              bonuses: applyQualityScaledBonuses(suffix.bonuses, quality.multiplier),
            },
          ]
        : []),
    ];

    process.push({
      title: 'Final value',
      detail: `(${base.baseValue} + ${prefix?.goldValue ?? 0} + ${suffix?.goldValue ?? 0}) x ${quality.multiplier.toFixed(1)} = ${finalValue} drachms.`,
    });

    return {
      displayName: composeItemName(quality, base, prefix, suffix),
      bucketValue,
      luck: sanitizedLuck,
      quality,
      base,
      prefix,
      suffix,
      baseBudget,
      preQualityValue,
      finalValue,
      remainingBudget,
      combinedBonuses: aggregateBonuses(parts.flatMap((part) => part.bonuses)),
      parts,
      process,
    };
  }

  private rollBudgetBucket(
    catalog: ItemGenerationCatalog,
    luck: number,
    process: ItemGenerationStep[]
  ): number {
    const bucketValue = rollWeighted(
      catalog.budgetBuckets,
      catalog.budgetBuckets.map((_, index) =>
        bucketWeight(index, luck, catalog.budgetBuckets.length)
      )
    ).value;

    process.push({
      title: 'Budget bucket',
      detail: `Luck ${luck} rolled bucket ${bucketValue} drachms.`,
    });

    return bucketValue;
  }

  private rollAffix(
    label: 'Prefix' | 'Suffix',
    affixes: ItemAffixDefinition[],
    remainingBudget: number,
    luck: number,
    process: ItemGenerationStep[]
  ): ItemAffixDefinition | null {
    const chance = label === 'Prefix'
      ? Math.min(0.18 + luck * 0.003, 0.42)
      : Math.min(0.32 + luck * 0.0038, 0.7);
    const roll = Math.random();
    const title = `${label} roll`;

    if (roll > chance) {
      process.push({
        title,
        detail: `Roll ${roll.toFixed(2)} missed ${Math.round(chance * 100)}% chance. No ${label.toLowerCase()} added.`,
      });
      return null;
    }

    const selected = this.pickAffix(affixes, remainingBudget, luck);

    process.push({
      title,
      detail: selected
        ? `Roll ${roll.toFixed(2)} passed ${Math.round(chance * 100)}% chance. ${label} ${selected.name} added for ${selected.goldValue} drachms.`
        : `Roll ${roll.toFixed(2)} passed, but no affordable ${label.toLowerCase()} fit the remaining budget.`,
    });

    return selected;
  }

  private pickAffix(
    affixes: ItemAffixDefinition[],
    remainingBudget: number,
    luck: number
  ): ItemAffixDefinition | null {
    const candidates = affixes.filter((affix) => affix.goldValue <= remainingBudget);
    return candidates.length
      ? rollWeighted(
          candidates,
          candidates.map((affix) => affixWeight(affix, remainingBudget, luck))
        ).value
      : null;
  }
}
