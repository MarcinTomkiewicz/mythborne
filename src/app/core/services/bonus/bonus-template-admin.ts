import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { BonusAdminData, BonusTargetDefinition, BonusTemplate } from '../../domain/bonus/bonus.model';
import { Backend } from '../backend/backend';
import { uniqueBonusCategories, normalizeBonusTemplate } from '../../utils/bonus';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { BonusTemplatePayload } from '../../types/item-generation-admin-service.types';

@Injectable({ providedIn: 'root' })
export class BonusTemplateAdminService {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<BonusAdminData> {
    return forkJoin({
      templates: this.backend.getAll<any>({
        table: 'bonus_templates',
        orderBy: [
          { column: 'category' },
          { column: 'sort_order' },
          { column: 'label' },
        ],
        camelCase: false,
      }),
      targets: this.backend.getAll<any>({
        table: 'bonus_targets',
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
    }).pipe(
      map(({ templates, targets }) => {
        const normalizedTemplates = templates.map(normalizeBonusTemplate);
        const normalizedTargets = targets.map((row) => this.mapTarget(row));

        return {
          templates: normalizedTemplates,
          targets: normalizedTargets,
          categories: uniqueBonusCategories(normalizedTemplates),
        };
      })
    );
  }

  saveTemplate(draft: BonusTemplate): Observable<void> {
    const payload: BonusTemplatePayload = {
      key: trimText(draft.key),
      label: trimText(draft.label),
      category: trimText(draft.category),
      target: trimText(draft.target),
      type: draft.type,
      context: draft.context,
      description: trimToNull(draft.description),
      baseValue: Number(draft.baseValue ?? 0),
      levelsStep: draft.levelsStep,
      sourceStat: draft.sourceStat,
      scalingFactor: draft.scalingFactor,
      sortOrder: Number(draft.sortOrder ?? 0),
      isActive: draft.isActive,
    };
    const request$ = draft.id
      ? this.backend.update('bonus_templates', draft.id, payload)
      : this.backend.create('bonus_templates', payload);

    return request$.pipe(map(() => void 0));
  }

  deleteTemplate(id: string): Observable<void> {
    return this.backend.delete('bonus_templates', id);
  }

  private mapTarget(row: {
    id: string;
    key: string;
    label: string;
    kind: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
  }): BonusTargetDefinition {
    return {
      id: row.id,
      key: row.key,
      label: row.label,
      kind: row.kind,
      description: row.description,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    };
  }
}
