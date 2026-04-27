import { inject, Injectable } from '@angular/core';
import { defer, forkJoin, map, Observable } from 'rxjs';
import { BonusAdminData, BonusTemplate } from '../../domain/bonus/bonus.model';
import { TABLES } from '../../constants/tables.const';
import {
  CanonicalBonusTemplateRow,
} from '../../domain/bonus/bonus-governance.model';
import {
  mapCanonicalBonusScope,
  mapCanonicalBonusTarget,
  mapCanonicalBonusTargetCategory,
  mapCanonicalBonusTemplate,
  mapCanonicalBonusType,
  toBonusTemplateAdminView,
  toSemanticBonusTemplatePayload,
} from '../../utils/bonus-governance';
import { Backend } from '../backend/backend';
import { Row } from '../../types/supabase.types';

@Injectable({ providedIn: 'root' })
export class BonusTemplateAdminService {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<BonusAdminData> {
    return forkJoin({
      types: this.backend.getAll<Row<'bonus_types'>>({
        table: TABLES.bonus_types,
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      scopes: this.backend.getAll<Row<'bonus_scopes'>>({
        table: TABLES.bonus_scopes,
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      targetCategories: this.backend.getAll<Row<'bonus_target_categories'>>({
        table: TABLES.bonus_target_categories,
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      targets: this.backend.getAll<Row<'bonus_targets'>>({
        table: TABLES.bonus_targets,
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      templates: this.backend.getAll<CanonicalBonusTemplateRow>({
        table: TABLES.bonus_templates,
        orderBy: [
          { column: 'target_key' },
          { column: 'sort_order' },
          { column: 'label' },
        ],
        camelCase: false,
      }),
    }).pipe(
      map(({ types, scopes, targetCategories, targets, templates }) => {
        const bonusTypes = types.map(mapCanonicalBonusType);
        const bonusScopes = scopes.map(mapCanonicalBonusScope);
        const bonusTargetCategories = targetCategories.map(mapCanonicalBonusTargetCategory);
        const bonusTargets = targets.map(mapCanonicalBonusTarget);
        const targetByKey = new Map(bonusTargets.map((target) => [target.key, target]));
        const normalizedTemplates = templates
          .map(mapCanonicalBonusTemplate)
          .map((template) => toBonusTemplateAdminView(template, targetByKey));

        return {
          templates: normalizedTemplates,
          targets: bonusTargets.map((target) => ({
            id: target.id,
            key: target.key,
            label: target.label,
            kind: target.valueKind,
            description: target.description,
            sortOrder: target.sortOrder,
            isActive: target.isActive,
          })),
          categories: bonusTargetCategories.map((category) => category.key),
          types: bonusTypes,
          scopes: bonusScopes,
          targetCategories: bonusTargetCategories,
        };
      })
    );
  }

  saveTemplate(draft: BonusTemplate): Observable<void> {
    return defer(() => {
      const payload = toSemanticBonusTemplatePayload(draft);
      const request$ = draft.id
        ? this.backend.update('bonus_templates', draft.id, payload)
        : this.backend.create('bonus_templates', payload);

      return request$.pipe(map(() => void 0));
    });
  }

  deleteTemplate(id: string): Observable<void> {
    return this.backend.delete('bonus_templates', id);
  }
}
