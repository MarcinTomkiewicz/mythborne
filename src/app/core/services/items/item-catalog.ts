import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, shareReplay } from 'rxjs';
import { ItemGenerationBucketsFactory } from '../../factories/item-generation/item-generation-buckets.factory';
import {
  mapBonusTemplateValue,
  mapItemGenerationAffix,
  mapItemGenerationBase,
  mapItemGenerationBucketProfile,
  mapItemGenerationQuality,
} from '../../domain/item/item-generation.mapper';
import { ItemGenerationCatalog } from '../../domain/item/item-generation.model';
import {
  ItemGenerationAffixBonusRow,
  ItemGenerationBaseBonusRow,
} from '../../types/domain-row.types';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';

@Injectable({ providedIn: 'root' })
export class ItemCatalogService {
  private readonly backend = inject(Backend);
  private readonly bucketFactory = inject(ItemGenerationBucketsFactory);

  private catalog$?: Observable<ItemGenerationCatalog>;

  getCatalog(): Observable<ItemGenerationCatalog> {
    if (!this.catalog$) {
      this.catalog$ = forkJoin({
        qualities: this.backend.getAll<Row<'item_generation_qualities'>>({
          table: 'item_generation_qualities',
          filters: { isEnabled: { operator: FilterOperator.EQ, value: true } },
          orderBy: { column: 'sort_order' },
          camelCase: false,
        }),
        bucketProfiles: this.backend.getAll<Row<'item_generation_bucket_profiles'>>({
          table: 'item_generation_bucket_profiles',
          filters: { isActive: { operator: FilterOperator.EQ, value: true } },
          orderBy: { column: 'created_at', ascending: false },
          range: { from: 0, to: 0 },
          camelCase: false,
        }),
        bases: this.backend.getAll<Row<'item_generation_bases'>>({
          table: 'item_generation_bases',
          orderBy: { column: 'base_value' },
          camelCase: false,
        }),
        baseBonuses: this.backend.getAll<ItemGenerationBaseBonusRow>({
          table: 'item_generation_base_bonuses',
          select: '*, bonus_templates (*)',
          camelCase: false,
        }),
        affixes: this.backend.getAll<Row<'item_generation_affixes'>>({
          table: 'item_generation_affixes',
          orderBy: { column: 'gold_value' },
          camelCase: false,
        }),
        affixBonuses: this.backend.getAll<ItemGenerationAffixBonusRow>({
          table: 'item_generation_affix_bonuses',
          select: '*, bonus_templates (*)',
          camelCase: false,
        }),
      }).pipe(
        map(({ qualities, bucketProfiles, bases, baseBonuses, affixes, affixBonuses }) =>
          this.buildCatalog({
            qualities,
            bucketProfiles,
            bases,
            baseBonuses: baseBonuses as ItemGenerationBaseBonusRow[],
            affixes,
            affixBonuses: affixBonuses as ItemGenerationAffixBonusRow[],
          })
        ),
        shareReplay(1)
      );
    }

    return this.catalog$;
  }

  clearCache() {
    this.catalog$ = undefined;
  }

  private buildCatalog(params: {
    qualities: Row<'item_generation_qualities'>[];
    bucketProfiles: Row<'item_generation_bucket_profiles'>[];
    bases: Row<'item_generation_bases'>[];
    baseBonuses: ItemGenerationBaseBonusRow[];
    affixes: Row<'item_generation_affixes'>[];
    affixBonuses: ItemGenerationAffixBonusRow[];
  }): ItemGenerationCatalog {
    const { qualities, bucketProfiles, bases, baseBonuses, affixes, affixBonuses } = params;

    const baseBonusesById = this.groupBonusesByForeignKey(
      baseBonuses,
      (row) => row.base_id
    );
    const affixBonusesById = this.groupBonusesByForeignKey(
      affixBonuses,
      (row) => row.affix_id
    );

    const mappedBases = bases.map((row) =>
      mapItemGenerationBase(row, baseBonusesById.get(row.id) ?? [])
    );

    const mappedAffixes = affixes.map((row) =>
      mapItemGenerationAffix(row, affixBonusesById.get(row.id) ?? [])
    );
    const mappedQualities = qualities.map(mapItemGenerationQuality);
    const activeBucketProfile = bucketProfiles[0]
      ? mapItemGenerationBucketProfile(bucketProfiles[0])
      : null;

    if (mappedBases.length === 0) {
      throw new Error(
        'No item generation bases were returned from Supabase. The browser request succeeded, but the result was empty. Most likely causes: missing SELECT policy (RLS) on public.item_generation_bases, or data was seeded into a different table than public.item_generation_bases.'
      );
    }

    if (mappedQualities.length === 0) {
      throw new Error(
        'No enabled item generation qualities were found in Supabase. Seed public.item_generation_qualities and make sure at least one row has is_enabled = true.'
      );
    }

    if (!activeBucketProfile) {
      throw new Error(
        'No active item generation bucket profile was found in Supabase. Seed public.item_generation_bucket_profiles and make sure one row has is_active = true.'
      );
    }

    return {
      budgetBuckets: this.bucketFactory.buildBuckets(activeBucketProfile),
      qualities: mappedQualities,
      bases: mappedBases,
      prefixes: mappedAffixes.filter((affix) => affix.kind === 'prefix'),
      suffixes: mappedAffixes.filter((affix) => affix.kind === 'suffix'),
    };
  }

  private groupBonusesByForeignKey<
    TRow extends ItemGenerationBaseBonusRow | ItemGenerationAffixBonusRow
  >(
    rows: TRow[],
    getRelationId: (row: TRow) => string
  ): Map<string, ReturnType<typeof mapBonusTemplateValue>[]> {
    const mapById = new Map<string, ReturnType<typeof mapBonusTemplateValue>[]>();

    for (const row of rows) {
      const relationId = getRelationId(row);
      const nextBonus = mapBonusTemplateValue(row);
      const existing = mapById.get(relationId) ?? [];
      existing.push(nextBonus);
      mapById.set(relationId, existing);
    }

    return mapById;
  }
}
