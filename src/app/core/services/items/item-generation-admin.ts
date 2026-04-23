import { Injectable, inject } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { SupabaseClientService } from '../supabase/supabase-client';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
  ItemGenerationAdminCatalogData,
  ItemGenerationAdminBalanceData,
} from '../../domain/item/item-generation-admin.model';
import {
  ItemGenerationAffixBonusRow,
  ItemGenerationBaseBonusRow,
} from '../../domain/item/item-generation.mapper';
import { Insert, Row } from '../../types/supabase.types';
import { ItemCatalogService } from './item-catalog';

@Injectable({ providedIn: 'root' })
export class ItemGenerationAdminService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly itemCatalogService = inject(ItemCatalogService);

  getCatalogData(): Observable<ItemGenerationAdminCatalogData> {
    return from(
      Promise.all([
        this.supabase
          .from('item_generation_bases')
          .select('*, item_generation_base_bonuses (*, bonus_templates (*))')
          .order('base_value', { ascending: true }),
        this.supabase
          .from('item_generation_affixes')
          .select('*, item_generation_affix_bonuses (*, bonus_templates (*))')
          .order('kind', { ascending: true })
          .order('gold_value', { ascending: true }),
        this.supabase
          .from('bonus_templates')
          .select('*')
          .order('target', { ascending: true }),
      ])
    ).pipe(
      map(([basesResult, affixesResult, templatesResult]) => {
        if (basesResult.error) {
          throw basesResult.error;
        }

        if (affixesResult.error) {
          throw affixesResult.error;
        }

        if (templatesResult.error) {
          throw templatesResult.error;
        }

        const bases = (basesResult.data ?? []).map((row) =>
          this.mapEditableBase(
            row as Row<'item_generation_bases'> & {
              item_generation_base_bonuses: ItemGenerationBaseBonusRow[];
            }
          )
        );
        const affixes = (affixesResult.data ?? []).map((row) =>
          this.mapEditableAffix(
            row as Row<'item_generation_affixes'> & {
              item_generation_affix_bonuses: ItemGenerationAffixBonusRow[];
            }
          )
        );
        const bonusTemplates = (templatesResult.data ?? []).map((row) => ({
          id: row.id,
          target: row.target,
          type: (row.type === 'percent' ? 'percent' : 'flat') as 'flat' | 'percent',
          description: row.description ?? '',
        }));

        return {
          bases,
          prefixes: affixes.filter((affix) => affix.kind === 'prefix'),
          suffixes: affixes.filter((affix) => affix.kind === 'suffix'),
          bonusTemplates,
        };
      })
    );
  }

  getBalanceData(): Observable<ItemGenerationAdminBalanceData> {
    return from(
      Promise.all([
        this.supabase
          .from('item_generation_qualities')
          .select('*')
          .order('sort_order', { ascending: true }),
        this.supabase
          .from('item_generation_bucket_profiles')
          .select('*')
          .order('created_at', { ascending: false }),
      ])
    ).pipe(
      map(([qualitiesResult, profilesResult]) => {
        if (qualitiesResult.error) {
          throw qualitiesResult.error;
        }

        if (profilesResult.error) {
          throw profilesResult.error;
        }

        return {
          qualities: (qualitiesResult.data ?? []).map((row) => ({
            id: row.id,
            key: row.key as EditableItemGenerationQuality['key'],
            label: row.label,
            multiplier: row.multiplier,
            weight: row.weight,
            sortOrder: row.sort_order,
            isEnabled: row.is_enabled,
          })),
          bucketProfiles: (profilesResult.data ?? []).map((row) => ({
            id: row.id,
            key: row.key,
            name: row.name,
            description: row.description ?? null,
            bucketCount: row.bucket_count,
            baseValue: row.base_value,
            linearGrowth: row.linear_growth,
            growthFactor: row.growth_factor,
            roundingStep: row.rounding_step,
            minIncrement: row.min_increment,
            isActive: row.is_active,
          })),
        };
      })
    );
  }

  saveQuality(draft: EditableItemGenerationQuality): Observable<void> {
    return from(this.saveQualityInternal(draft));
  }

  deleteQuality(id: string): Observable<void> {
    return from(this.deleteById('item_generation_qualities', id));
  }

  saveBucketProfile(draft: EditableItemGenerationBucketProfile): Observable<void> {
    return from(this.saveBucketProfileInternal(draft));
  }

  deleteBucketProfile(id: string): Observable<void> {
    return from(this.deleteById('item_generation_bucket_profiles', id));
  }

  saveBase(draft: EditableItemGenerationBase): Observable<void> {
    return from(this.saveBaseInternal(draft));
  }

  deleteBase(id: string): Observable<void> {
    return from(this.deleteById('item_generation_bases', id));
  }

  saveAffix(draft: EditableItemGenerationAffix): Observable<void> {
    return from(this.saveAffixInternal(draft));
  }

  deleteAffix(id: string): Observable<void> {
    return from(this.deleteById('item_generation_affixes', id));
  }

  private async saveQualityInternal(
    draft: EditableItemGenerationQuality
  ): Promise<void> {
    const payload = {
      key: draft.key.trim(),
      label: draft.label.trim(),
      multiplier: draft.multiplier,
      weight: draft.weight,
      sort_order: draft.sortOrder,
      is_enabled: draft.isEnabled,
    };

    if (draft.id) {
      const { data, error } = await this.supabase
        .from('item_generation_qualities')
        .update(payload)
        .eq('id', draft.id)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Quality update did not affect any row.');
      }
    } else {
      const { data, error } = await this.supabase
        .from('item_generation_qualities')
        .insert(payload)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Quality insert failed.');
      }
    }

    this.itemCatalogService.clearCache();
  }

  private async saveBucketProfileInternal(
    draft: EditableItemGenerationBucketProfile
  ): Promise<void> {
    const payload = {
      key: draft.key.trim(),
      name: draft.name.trim(),
      description: draft.description?.trim() || null,
      bucket_count: draft.bucketCount,
      base_value: draft.baseValue,
      linear_growth: draft.linearGrowth,
      growth_factor: draft.growthFactor,
      rounding_step: draft.roundingStep,
      min_increment: draft.minIncrement,
      is_active: draft.isActive,
    };

    if (draft.isActive) {
      const { error: deactivateError } = await this.supabase
        .from('item_generation_bucket_profiles')
        .update({ is_active: false })
        .neq('id', draft.id ?? '00000000-0000-0000-0000-000000000000');

      if (deactivateError) {
        throw deactivateError;
      }
    }

    if (draft.id) {
      const { data, error } = await this.supabase
        .from('item_generation_bucket_profiles')
        .update(payload)
        .eq('id', draft.id)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Bucket profile update did not affect any row.');
      }
    } else {
      const { data, error } = await this.supabase
        .from('item_generation_bucket_profiles')
        .insert(payload)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Bucket profile insert failed.');
      }
    }

    this.itemCatalogService.clearCache();
  }

  private async saveBaseInternal(
    draft: EditableItemGenerationBase
  ): Promise<void> {
    const payload = {
      key: draft.key.trim(),
      name: draft.name.trim(),
      slot: draft.slot,
      base_value: draft.baseValue,
      description: draft.description.trim() || null,
    };

    const baseId = await this.saveBaseEntity(draft.id, payload);

    await this.syncBonusesForBase(baseId, draft.bonuses);
    this.itemCatalogService.clearCache();
  }

  private async saveAffixInternal(
    draft: EditableItemGenerationAffix
  ): Promise<void> {
    const payload = {
      key: draft.key.trim(),
      kind: draft.kind,
      name: draft.name.trim(),
      gold_value: draft.goldValue,
      description: draft.description.trim() || null,
    };

    const affixId = await this.saveAffixEntity(draft.id, payload);

    await this.syncBonusesForAffix(affixId, draft.bonuses);
    this.itemCatalogService.clearCache();
  }

  private async saveBaseEntity(
    id: string | null,
    payload: {
      key: string;
      name: string;
      slot: EditableItemGenerationBase['slot'];
      base_value: number;
      description: string | null;
    }
  ): Promise<string> {
    if (id) {
      const { data, error } = await this.supabase
        .from('item_generation_bases')
        .update(payload)
        .eq('id', id)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Base update did not affect any row.');
      }

      return id;
    }

    const { data, error } = await this.supabase
      .from('item_generation_bases')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  private async saveAffixEntity(
    id: string | null,
    payload: {
      key: string;
      kind: EditableItemGenerationAffix['kind'];
      name: string;
      gold_value: number;
      description: string | null;
    }
  ): Promise<string> {
    if (id) {
      const { data, error } = await this.supabase
        .from('item_generation_affixes')
        .update(payload)
        .eq('id', id)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Affix update did not affect any row.');
      }

      return id;
    }

    const { data, error } = await this.supabase
      .from('item_generation_affixes')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  private async syncBonusesForBase(
    baseId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Promise<void> {
    const { error: deleteError } = await this.supabase
      .from('item_generation_base_bonuses')
      .delete()
      .eq('base_id', baseId);

    if (deleteError) {
      throw deleteError;
    }

    const rows = await this.buildBaseBonusRows(baseId, bonuses);

    if (rows.length === 0) {
      return;
    }

    const { error: insertError } = await this.supabase
      .from('item_generation_base_bonuses')
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  private async syncBonusesForAffix(
    affixId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Promise<void> {
    const { error: deleteError } = await this.supabase
      .from('item_generation_affix_bonuses')
      .delete()
      .eq('affix_id', affixId);

    if (deleteError) {
      throw deleteError;
    }

    const rows = await this.buildAffixBonusRows(affixId, bonuses);

    if (rows.length === 0) {
      return;
    }

    const { error: insertError } = await this.supabase
      .from('item_generation_affix_bonuses')
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  private async buildBaseBonusRows(
    baseId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Promise<Insert<'item_generation_base_bonuses'>[]> {
    const rows: Insert<'item_generation_base_bonuses'>[] = [];

    for (const bonus of bonuses) {
      const templateId = await this.ensureBonusTemplateId(bonus);
      rows.push({
        base_id: baseId,
        template_id: templateId,
        value: bonus.value,
      });
    }

    return rows;
  }

  private async buildAffixBonusRows(
    affixId: string,
    bonuses: EditableItemGenerationBonus[]
  ): Promise<Insert<'item_generation_affix_bonuses'>[]> {
    const rows: Insert<'item_generation_affix_bonuses'>[] = [];

    for (const bonus of bonuses) {
      const templateId = await this.ensureBonusTemplateId(bonus);
      rows.push({
        affix_id: affixId,
        template_id: templateId,
        value: bonus.value,
      });
    }

    return rows;
  }

  private async ensureBonusTemplateId(
    bonus: EditableItemGenerationBonus
  ): Promise<string> {
    if (bonus.templateId) {
      return bonus.templateId;
    }

    const target = bonus.target.trim();
    const description = bonus.description.trim() || null;
    const type = bonus.type;

    const { data: existing, error: fetchError } = await this.supabase
      .from('bonus_templates')
      .select('id')
      .eq('target', target)
      .eq('type', type)
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    const { data: created, error: createError } = await this.supabase
      .from('bonus_templates')
      .insert({
        target,
        type,
        description,
      })
      .select('id')
      .single();

    if (createError) {
      throw createError;
    }

    return created.id;
  }

  private async deleteById(
    table:
      | 'item_generation_qualities'
      | 'item_generation_bucket_profiles'
      | 'item_generation_bases'
      | 'item_generation_affixes',
    id: string
  ): Promise<void> {
    const { error } = await this.supabase.from(table).delete().eq('id', id);

    if (error) {
      throw error;
    }

    this.itemCatalogService.clearCache();
  }

  private mapEditableBase(
    row: Row<'item_generation_bases'> & {
      item_generation_base_bonuses: ItemGenerationBaseBonusRow[];
    }
  ): EditableItemGenerationBase {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      slot: row.slot as EditableItemGenerationBase['slot'],
      baseValue: row.base_value,
      description: row.description ?? '',
      bonuses: (row.item_generation_base_bonuses ?? []).map((bonus) =>
        this.mapEditableBonus(bonus)
      ),
    };
  }

  private mapEditableAffix(
    row: Row<'item_generation_affixes'> & {
      item_generation_affix_bonuses: ItemGenerationAffixBonusRow[];
    }
  ): EditableItemGenerationAffix {
    return {
      id: row.id,
      key: row.key,
      kind: row.kind as EditableItemGenerationAffix['kind'],
      name: row.name,
      goldValue: row.gold_value,
      description: row.description ?? '',
      bonuses: (row.item_generation_affix_bonuses ?? []).map((bonus) =>
        this.mapEditableBonus(bonus)
      ),
    };
  }

  private mapEditableBonus(
    row: ItemGenerationBaseBonusRow | ItemGenerationAffixBonusRow
  ): EditableItemGenerationBonus {
    return {
      templateId: row.template_id,
      target: row.bonus_templates.target,
      type: row.bonus_templates.type === 'percent' ? 'percent' : 'flat',
      value: row.value,
      description: row.bonus_templates.description ?? '',
    };
  }
}
