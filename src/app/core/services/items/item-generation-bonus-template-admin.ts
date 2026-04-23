import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { EditableBonusTemplateDraft } from '../../types/item-generation-admin-service.types';
import { trimText, trimToNull } from '../../utils/normalize-text';

@Injectable({ providedIn: 'root' })
export class ItemGenerationBonusTemplateAdminService {
  private readonly backend = inject(Backend);

  ensureTemplateId(bonus: EditableBonusTemplateDraft): Observable<string> {
    if (bonus.templateId) {
      return of(bonus.templateId);
    }

    const target = trimText(bonus.target);
    const type = bonus.type;
    const description = trimToNull(bonus.description);

    return this.backend
      .getAll<{ id: string }>({
        table: 'bonus_templates',
        filters: {
          target: { operator: FilterOperator.EQ, value: target },
          type: { operator: FilterOperator.EQ, value: type },
        },
        range: { from: 0, to: 0 },
      })
      .pipe(
      switchMap((existing) => {
        if (existing.length) {
          return of(existing[0].id);
        }

        return this.backend
          .create<{ id: string }>('bonus_templates', { target, type, description })
          .pipe(map((created) => created.id));
      })
    );
  }
}
