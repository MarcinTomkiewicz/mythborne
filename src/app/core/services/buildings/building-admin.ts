import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  EditableBuilding,
  EditableBuildingBonus,
  EditableBuildingRequirement,
  EditableBuildingResourceCost,
  BuildingAdminData,
} from '../../domain/building/building.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import {
  mapBuildingBonusTemplates,
  mapBuildingDistricts,
  mapBuildingStats,
  mapEditableBuilding,
} from '../../utils/building-admin-mappers';
import { nonNegativeInteger, positiveInteger, roundedNumber } from '../../utils/number';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { BuildingProgressionService } from '../progression/building-progression';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { ItemGenerationBonusTemplateAdminService } from '../items/item-generation-bonus-template-admin';
import { EditableBuildingRow } from '../../types/building-admin-row.types';
import { BuildingPayload } from '../../types/building-service.types';

@Injectable({ providedIn: 'root' })
export class BuildingAdminService {
  private readonly backend = inject(Backend);
  private readonly progression = inject(BuildingProgressionService);
  private readonly bonusTemplates = inject(ItemGenerationBonusTemplateAdminService);

  getAdminData(): Observable<BuildingAdminData> {
    return forkJoin({
      buildings: this.backend.getAll<any>({
        table: TABLES.buildings,
        select:
          '*, building_bonuses(*, bonus_templates(*)), building_requirements(*), building_resource_costs(*)',
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      templates: this.backend.getAll<any>({
        table: TABLES.bonus_templates,
        orderBy: { column: 'target' },
        camelCase: false,
      }),
      districts: this.backend.getAll<any>({
        table: TABLES.estate_districts,
        orderBy: { column: 'rank' },
        camelCase: false,
      }),
      stats: this.backend.getAll<any>({
        table: TABLES.stats,
        select: 'key, label',
        orderBy: { column: 'order' },
        camelCase: false,
      }),
    }).pipe(
      map(({ buildings, templates, districts, stats }) => ({
          buildings: buildings.map((row) =>
            mapEditableBuilding(row as EditableBuildingRow)
          ),
          bonusTemplates: mapBuildingBonusTemplates(templates),
          districts: mapBuildingDistricts(districts),
          stats: mapBuildingStats(stats),
        }))
    );
  }

  saveBuilding(draft: EditableBuilding): Observable<void> {
    const payload = {
      key: trimText(draft.key),
      name: trimText(draft.name),
      description: trimToNull(draft.description),
      imagePath:
        (resolveBuildingImagePath(draft.key, draft.districtCode) ??
          trimText(draft.imagePath)) ||
        null,
      districtCode: draft.districtCode,
      rankRequired: positiveInteger(draft.rankRequired),
      sortOrder: nonNegativeInteger(draft.sortOrder),
      baseBuildTimeMinutes: nonNegativeInteger(draft.baseBuildTimeMinutes),
      maxLevel: nonNegativeInteger(draft.maxLevel),
    };

    return this.saveEntity(draft.id, payload).pipe(
      switchMap((buildingId) =>
        forkJoin([
          this.syncBuildingBonuses(buildingId, draft.bonuses),
          this.syncBuildingCosts(buildingId, draft.resourceCosts),
          this.syncBuildingRequirements(buildingId, draft.requirements),
        ])
      ),
      map(() => void 0),
      tap(() => this.progression.clearCache())
    );
  }

  private saveEntity(
    id: string | null,
    payload: BuildingPayload
  ): Observable<string> {
    const request$ = id
      ? this.backend.update<{ id: string } & BuildingPayload>(TABLES.buildings, id, payload)
      : this.backend.create<{ id: string } & BuildingPayload>(TABLES.buildings, payload);

    return request$.pipe(map((row) => row.id));
  }

  private syncBuildingBonuses(
    buildingId: string,
    bonuses: EditableBuildingBonus[]
  ): Observable<void> {
    return this.deleteChildren(TABLES.building_bonuses, 'building_id', buildingId).pipe(
      switchMap(() =>
        bonuses.length
          ? forkJoin(
              bonuses.map((bonus) =>
                this.bonusTemplates.ensureTemplateId(bonus).pipe(
                  map((templateId) => ({
                    buildingId,
                    templateId,
                    value: roundedNumber(bonus.value),
                  }))
                )
              )
            )
          : of([])
      ),
      switchMap((rows) => this.insertRows(TABLES.building_bonuses, rows))
    );
  }

  private syncBuildingCosts(
    buildingId: string,
    costs: EditableBuildingResourceCost[]
  ): Observable<void> {
    const rows = costs.map((cost, index) => ({
      buildingId,
      resourceType: cost.resourceType,
      baseValue: nonNegativeInteger(cost.baseValue),
      appliesFromLevel: positiveInteger(cost.appliesFromLevel),
      sortOrder: (index + 1) * 10,
    }));

    return this.deleteChildren(TABLES.building_resource_costs, 'building_id', buildingId).pipe(
      switchMap(() => this.insertRows(TABLES.building_resource_costs, rows))
    );
  }

  private syncBuildingRequirements(
    buildingId: string,
    requirements: EditableBuildingRequirement[]
  ): Observable<void> {
    const rows = requirements.map((requirement, index) => ({
      buildingId,
      requirementType: requirement.type,
      statKey: requirement.type === 'hero_stat' ? requirement.statKey : null,
      minValue: nonNegativeInteger(requirement.minValue),
      appliesFromLevel: positiveInteger(requirement.appliesFromLevel),
      sortOrder: (index + 1) * 10,
    }));

    return this.deleteChildren(TABLES.building_requirements, 'building_id', buildingId).pipe(
      switchMap(() => this.insertRows(TABLES.building_requirements, rows))
    );
  }

  private deleteChildren(table: string, column: string, value: string): Observable<void> {
    return this.backend.delete(table, {
      [column]: { operator: FilterOperator.EQ, value },
    });
  }

  private insertRows(table: string, rows: unknown[]): Observable<void> {
    if (rows.length === 0) {
      return of(void 0);
    }

    return this.backend.createMany(table, rows as object[]).pipe(map(() => void 0));
  }
}
