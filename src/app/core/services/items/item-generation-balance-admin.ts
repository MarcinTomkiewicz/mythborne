import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
  ItemGenerationAdminBalanceData,
  ItemQualityImpactPreview,
  ItemQualityImpactPreviewInput,
} from '../../domain/item/item-generation-admin.model';
import {
  mapItemQualityImpactPreview,
  mapEditableBucketProfile,
  mapEditableQuality,
  mapItemRequirementAggregationSettings,
  toGetItemQualityImpactPreviewRpcArgs,
} from '../../utils/item-generation-admin-mappers';
import { ItemCatalogService } from './item-catalog';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { BucketProfilePayload } from '../../types/item-generation-admin-service.types';
import { ItemQualityImpactPreviewRpcRow } from '../../types/item-generation-preview-rpc.types';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { Row } from '../../types/supabase.types';
import { TABLES } from '../../constants/tables.const';

@Injectable({ providedIn: 'root' })
export class ItemGenerationBalanceAdminService {
  private readonly backend = inject(Backend);
  private readonly itemCatalogService = inject(ItemCatalogService);

  getData(): Observable<ItemGenerationAdminBalanceData> {
    return forkJoin({
      qualities: this.backend.getAll<Row<'item_generation_qualities'>>({
        table: TABLES.item_generation_qualities,
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      profiles: this.backend.getAll<Row<'item_generation_bucket_profiles'>>({
        table: TABLES.item_generation_bucket_profiles,
        orderBy: { column: 'created_at', ascending: false },
        camelCase: false,
      }),
      requirementAggregationSettings: this.backend.getAll<
        Row<'item_requirement_aggregation_settings'>
      >({
        table: TABLES.item_requirement_aggregation_settings,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        camelCase: false,
      }),
    }).pipe(
      map(({ qualities, profiles, requirementAggregationSettings }) => ({
        qualities: qualities.map(mapEditableQuality),
        bucketProfiles: profiles.map(mapEditableBucketProfile),
        requirementAggregationSettings: requirementAggregationSettings[0]
          ? mapItemRequirementAggregationSettings(requirementAggregationSettings[0])
          : null,
      }))
    );
  }

  getQualityImpactPreview(
    input: ItemQualityImpactPreviewInput,
  ): Observable<ItemQualityImpactPreview[]> {
    return this.backend
      .rpc<ItemQualityImpactPreviewRpcRow[]>(
        'get_item_quality_impact_preview',
        toGetItemQualityImpactPreviewRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapItemQualityImpactPreview)));
  }

  saveQuality(draft: EditableItemGenerationQuality): Observable<void> {
    const payload = {
      key: trimText(draft.key),
      label: trimText(draft.label),
      multiplier: draft.multiplier,
      requirementMultiplier: draft.requirementMultiplier,
      weight: draft.weight,
      sortOrder: draft.sortOrder,
      isEnabled: draft.isEnabled,
    };
    const request$ = draft.id
      ? this.backend.update(TABLES.item_generation_qualities, draft.id, payload)
      : this.backend.create(TABLES.item_generation_qualities, payload);

    return request$.pipe(
      map(() => void 0),
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  deleteQuality(id: string): Observable<void> {
    return this.backend.delete(TABLES.item_generation_qualities, id).pipe(
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  saveBucketProfile(draft: EditableItemGenerationBucketProfile): Observable<void> {
    const payload = {
      key: trimText(draft.key),
      name: trimText(draft.name),
      description: trimToNull(draft.description),
      bucketCount: draft.bucketCount,
      baseValue: draft.baseValue,
      linearGrowth: draft.linearGrowth,
      growthFactor: draft.growthFactor,
      roundingStep: draft.roundingStep,
      minIncrement: draft.minIncrement,
      isActive: draft.isActive,
    };
    const save$ = draft.id
      ? this.updateBucketProfile(draft.id, payload.key, payload)
      : this.insertBucketProfile(payload);

    return save$.pipe(
      switchMap((savedId) =>
        draft.isActive
          ? this.backend.updateWhere(
              TABLES.item_generation_bucket_profiles,
              { id: { operator: FilterOperator.NE, value: savedId } },
              { isActive: false }
            )
          : of([]),
      ),
      map(() => void 0),
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  deleteBucketProfile(id: string): Observable<void> {
    return this.backend.delete(TABLES.item_generation_bucket_profiles, id).pipe(
      tap(() => this.itemCatalogService.clearCache())
    );
  }

  private insertBucketProfile(payload: BucketProfilePayload): Observable<string> {
    return this.backend
      .create<{ id: string } & BucketProfilePayload>(
        TABLES.item_generation_bucket_profiles,
        payload,
      )
      .pipe(map((row) => row.id));
  }

  private updateBucketProfile(
    id: string,
    key: string,
    payload: BucketProfilePayload
  ): Observable<string> {
    return this.backend
      .updateWhere<{ id: string } & BucketProfilePayload>(
        TABLES.item_generation_bucket_profiles,
        { id: { operator: FilterOperator.EQ, value: id } },
        payload
      )
      .pipe(
        switchMap((rowsById) =>
          rowsById.length
            ? of(rowsById[0].id)
            : this.backend
                .updateWhere<{ id: string } & BucketProfilePayload>(
                  TABLES.item_generation_bucket_profiles,
                  { key: { operator: FilterOperator.EQ, value: key } },
                  payload
                )
                .pipe(
                  map((rowsByKey) => {
                    if (!rowsByKey.length) {
                      throw new Error(
                        `Bucket profile "${key}" update did not affect any row. Apply database/item-generation/009_item_generation_balance_write_policy_repair.sql in Supabase and verify RLS policies plus grants for item_generation_bucket_profiles.`
                      );
                    }

                    return rowsByKey[0].id;
                  })
                )
        )
      );
  }
}
