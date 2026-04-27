import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, shareReplay } from 'rxjs';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { TABLES } from '../../constants/tables.const';
import { ItemGenerationCatalog } from '../../domain/item/item-generation.model';
import { FilterOperator } from '../../enums/filter-operators';
import { ItemGenerationBucketsFactory } from '../../factories/item-generation/item-generation-buckets.factory';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import { Row } from '../../types/supabase.types';
import {
  mapItemGenerationAffix,
  mapItemGenerationBase,
  mapItemGenerationBaseType,
  mapItemGenerationBaseTypeTarget,
  mapItemGenerationBucketProfile,
  mapItemGenerationQuality,
  mapResolvedItemGenerationBonus,
  toBaseTypeByKey,
} from '../../utils/item-generation-catalog-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ItemCatalogService {
  private readonly backend = inject(Backend);
  private readonly bucketFactory = inject(ItemGenerationBucketsFactory);

  private catalog$?: Observable<ItemGenerationCatalog>;

  getCatalog(): Observable<ItemGenerationCatalog> {
    if (!this.catalog$) {
      this.catalog$ = forkJoin({
        qualities: this.backend.getAll<Row<'item_generation_qualities'>>({
          table: TABLES.item_generation_qualities,
          filters: { isEnabled: { operator: FilterOperator.EQ, value: true } },
          orderBy: { column: 'sort_order' },
          camelCase: false,
        }),
        bucketProfiles: this.backend.getAll<Row<'item_generation_bucket_profiles'>>({
          table: TABLES.item_generation_bucket_profiles,
          filters: { isActive: { operator: FilterOperator.EQ, value: true } },
          orderBy: { column: 'created_at', ascending: false },
          range: { from: 0, to: 0 },
          camelCase: false,
        }),
        baseTypes: this.backend.getAll<Row<'item_generation_base_types'>>({
          table: TABLES.item_generation_base_types,
          filters: { isActive: { operator: FilterOperator.EQ, value: true } },
          orderBy: { column: 'sort_order' },
          camelCase: false,
        }),
        baseTypeTargets: this.backend.getAll<Row<'item_generation_base_type_targets'>>({
          table: TABLES.item_generation_base_type_targets,
          orderBy: { column: 'sort_order' },
          camelCase: false,
        }),
        bases: this.backend.getAll<Row<'item_generation_bases'>>({
          table: TABLES.item_generation_bases,
          orderBy: { column: 'base_value' },
          camelCase: false,
        }),
        affixes: this.backend.getAll<Row<'item_generation_affixes'>>({
          table: TABLES.item_generation_affixes,
          orderBy: { column: 'gold_value' },
          camelCase: false,
        }),
        entityBonuses: this.backend.getAll<CanonicalEntityBonusWithTemplateRow>({
          table: TABLES.entity_bonuses,
          select: '*, bonus_templates (*)',
          filters: {
            entityType: {
              operator: FilterOperator.IN,
              value: [
                BONUS_ENTITY_TYPES.ItemGenerationBase,
                BONUS_ENTITY_TYPES.ItemGenerationAffix,
              ],
            },
            isActive: { operator: FilterOperator.EQ, value: true },
          },
          orderBy: { column: 'sort_order' },
          camelCase: false,
        }),
      }).pipe(
        map(
          ({
            qualities,
            bucketProfiles,
            baseTypes,
            baseTypeTargets,
            bases,
            affixes,
            entityBonuses,
          }) =>
            this.buildCatalog({
              qualities,
              bucketProfiles,
              baseTypes,
              baseTypeTargets,
              bases,
              affixes,
              entityBonuses,
            }),
        ),
        shareReplay(1),
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
    baseTypes: Row<'item_generation_base_types'>[];
    baseTypeTargets: Row<'item_generation_base_type_targets'>[];
    bases: Row<'item_generation_bases'>[];
    affixes: Row<'item_generation_affixes'>[];
    entityBonuses: CanonicalEntityBonusWithTemplateRow[];
  }): ItemGenerationCatalog {
    const {
      qualities,
      bucketProfiles,
      baseTypes,
      baseTypeTargets,
      bases,
      affixes,
      entityBonuses,
    } = params;

    if ((bases.length > 0 || affixes.length > 0) && entityBonuses.length === 0) {
      throw new Error(
        'No entity_bonuses were returned for item generation bases/affixes. Apply the base/affix backfill before using item generation bonuses.',
      );
    }

    const bonusesByEntityId = this.groupBonusesByEntityId(entityBonuses);
    const mappedBaseTypes = baseTypes.map(mapItemGenerationBaseType);
    const baseTypeByKey = toBaseTypeByKey(mappedBaseTypes);
    const mappedBaseTypeTargets = baseTypeTargets.map(mapItemGenerationBaseTypeTarget);

    const mappedBases = bases.map((row) =>
      mapItemGenerationBase(row, bonusesByEntityId.get(row.id) ?? [], baseTypeByKey),
    );
    const mappedAffixes = affixes.map((row) =>
      mapItemGenerationAffix(row, bonusesByEntityId.get(row.id) ?? []),
    );
    const mappedQualities = qualities.map(mapItemGenerationQuality);
    const activeBucketProfile = bucketProfiles[0]
      ? mapItemGenerationBucketProfile(bucketProfiles[0])
      : null;

    if (mappedBases.length === 0) {
      throw new Error(
        'No item generation bases were returned from Supabase. The browser request succeeded, but the result was empty. Most likely causes: missing SELECT policy (RLS) on public.item_generation_bases, or data was seeded into a different table than public.item_generation_bases.',
      );
    }

    if (mappedQualities.length === 0) {
      throw new Error(
        'No enabled item generation qualities were found in Supabase. Seed public.item_generation_qualities and make sure at least one row has is_enabled = true.',
      );
    }

    if (!activeBucketProfile) {
      throw new Error(
        'No active item generation bucket profile was found in Supabase. Seed public.item_generation_bucket_profiles and make sure one row has is_active = true.',
      );
    }

    return {
      budgetBuckets: this.bucketFactory.buildBuckets(activeBucketProfile),
      qualities: mappedQualities,
      baseTypes: mappedBaseTypes,
      baseTypeTargets: mappedBaseTypeTargets,
      bases: mappedBases,
      prefixes: mappedAffixes.filter((affix) => affix.kind === 'prefix'),
      suffixes: mappedAffixes.filter((affix) => affix.kind === 'suffix'),
    };
  }

  private groupBonusesByEntityId(
    rows: CanonicalEntityBonusWithTemplateRow[],
  ): Map<string, ReturnType<typeof mapResolvedItemGenerationBonus>[]> {
    const mapById = new Map<string, ReturnType<typeof mapResolvedItemGenerationBonus>[]>();

    for (const row of rows) {
      const relationId = row.entity_id;
      const nextBonus = mapResolvedItemGenerationBonus(row);
      const existing = mapById.get(relationId) ?? [];
      existing.push(nextBonus);
      mapById.set(relationId, existing);
    }

    return mapById;
  }
}
