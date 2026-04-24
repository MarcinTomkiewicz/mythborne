import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  ItemGenerationAdminCatalogData,
} from '../../domain/item/item-generation-admin.model';
import {
  ItemGenerationAffixBonusRow,
  ItemGenerationBaseBonusRow,
} from '../../types/domain-row.types';
import { Row } from '../../types/supabase.types';
import {
  mapEditableAffix,
  mapEditableBase,
} from '../../utils/item-generation-admin-mappers';
import { normalizeBonusTarget, normalizeBonusType } from '../../utils/bonus';
import { Backend } from '../backend/backend';
import { ItemGenerationAffixAdminService } from './item-generation-affix-admin';
import { ItemGenerationBaseAdminService } from './item-generation-base-admin';

@Injectable({ providedIn: 'root' })
export class ItemGenerationCatalogAdminService {
  private readonly backend = inject(Backend);
  private readonly bases = inject(ItemGenerationBaseAdminService);
  private readonly affixes = inject(ItemGenerationAffixAdminService);

  getData(): Observable<ItemGenerationAdminCatalogData> {
    return forkJoin({
      bases: this.backend.getAll<any>({
        table: 'item_generation_bases',
        select: '*, item_generation_base_bonuses (*, bonus_templates (*))',
        orderBy: { column: 'base_value' },
        camelCase: false,
      }),
      affixes: this.backend.getAll<any>({
        table: 'item_generation_affixes',
        select: '*, item_generation_affix_bonuses (*, bonus_templates (*))',
        orderBy: { column: 'kind' },
        camelCase: false,
      }),
      templates: this.backend.getAll<any>({
        table: 'bonus_templates',
        orderBy: { column: 'target' },
        camelCase: false,
      }),
    }).pipe(
      map(({ bases, affixes, templates }) => {
        const editableAffixes = affixes.map((row) =>
          mapEditableAffix(
            row as Row<'item_generation_affixes'> & {
              item_generation_affix_bonuses: ItemGenerationAffixBonusRow[];
            }
          )
        );

        return {
          bases: bases.map((row) =>
            mapEditableBase(
              row as Row<'item_generation_bases'> & {
                item_generation_base_bonuses: ItemGenerationBaseBonusRow[];
              }
            )
          ),
          prefixes: editableAffixes.filter((affix) => affix.kind === 'prefix'),
          suffixes: editableAffixes.filter((affix) => affix.kind === 'suffix'),
          bonusTemplates: templates.map((row) => ({
            id: row.id,
            target: normalizeBonusTarget(row.target),
            type: normalizeBonusType(row.type),
            description: row.description ?? '',
          })),
        };
      })
    );
  }

  saveBase(draft: EditableItemGenerationBase): Observable<void> {
    return this.bases.save(draft);
  }

  deleteBase(id: string): Observable<void> {
    return this.bases.delete(id);
  }

  saveAffix(draft: EditableItemGenerationAffix): Observable<void> {
    return this.affixes.save(draft);
  }

  deleteAffix(id: string): Observable<void> {
    return this.affixes.delete(id);
  }
}
