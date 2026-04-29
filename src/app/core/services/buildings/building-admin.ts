import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  BuildingAdminData,
  EditableBuilding,
  EditableBuildingBonus,
  EditableBuildingResourceCost,
  BuildingProgressionPreview,
  BuildingProgressionPreviewInput,
} from '../../domain/building/building.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import {
  mapEditableBuildingEntityBonus,
  mapBuildingBonusTemplateMetadata,
  mapBuildingBonusTemplates,
  mapBuildingDistricts,
  mapBuildingProgressionPreview,
  mapBuildingStats,
  mapEditableBuilding,
  toGetBuildingProgressionPreviewRpcArgs,
} from '../../utils/building-admin-mappers';
import { nonNegativeInteger, positiveInteger, roundedNumber } from '../../utils/number';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { BuildingProgressionService } from '../progression/building-progression';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { EditableBuildingRow } from '../../types/building-admin-row.types';
import { BuildingProgressionPreviewRpcRow } from '../../types/building-preview-rpc.types';
import { BuildingPayload } from '../../types/building-service.types';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import { Row } from '../../types/supabase.types';
import { toEntityBonusPayload } from '../../utils/entity-bonus-governance';
import { BonusTemplateAdminService } from '../bonus/bonus-template-admin';
import { FormulaService } from '../formula/formula';
import { BUILDING_PROGRESSION_TARGET_KEYS } from '../../domain/progression/building-progression.model';

@Injectable({ providedIn: 'root' })
export class BuildingAdminService {
  private readonly backend = inject(Backend);
  private readonly progression = inject(BuildingProgressionService);
  private readonly bonusTemplates = inject(BonusTemplateAdminService);
  private readonly formulaService = inject(FormulaService);

  getAdminData(): Observable<BuildingAdminData> {
    return forkJoin({
      buildings: this.backend.getAll<EditableBuildingRow>({
        table: TABLES.buildings,
        select: '*, building_resource_costs(*)',
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      entityBonuses: this.backend.getAll<CanonicalEntityBonusWithTemplateRow>({
        table: TABLES.entity_bonuses,
        select: '*, bonus_templates (*)',
        filters: {
          entityType: { operator: FilterOperator.EQ, value: BONUS_ENTITY_TYPES.Building },
        },
        orderBy: { column: 'sort_order' },
        camelCase: false,
      }),
      bonusData: this.bonusTemplates.getAdminData(),
      districts: this.backend.getAll<Row<'estate_districts'>>({
        table: TABLES.estate_districts,
        orderBy: { column: 'rank' },
        camelCase: false,
      }),
      stats: this.backend.getAll<Pick<Row<'stats'>, 'key' | 'label'>>({
        table: TABLES.stats,
        select: 'key, label',
        orderBy: { column: 'order' },
        camelCase: false,
      }),
      formulaData: this.formulaService.getAdminData(),
    }).pipe(
      map(({ buildings, entityBonuses, bonusData, districts, stats, formulaData }) => {
        const bonusTemplateById = new Map(
          bonusData.templates.map((template) => [template.id, template])
        );
        const bonusesByBuildingId = this.groupEditableBonusesByEntityId(
          entityBonuses,
          bonusTemplateById
        );

        return {
          buildings: buildings.map((row) =>
            mapEditableBuilding(
              row,
              bonusesByBuildingId.get(row.id) ?? [],
              formulaData
            )
          ),
          bonusTemplates: mapBuildingBonusTemplates(bonusData.templates),
          bonusTemplateMetadata: mapBuildingBonusTemplateMetadata(bonusData.templates),
          districts: mapBuildingDistricts(districts),
          stats: mapBuildingStats(stats),
        };
      })
    );
  }

  getBuildingProgressionPreview(
    input: BuildingProgressionPreviewInput
  ): Observable<BuildingProgressionPreview[]> {
    return this.backend
      .rpc<BuildingProgressionPreviewRpcRow[]>(
        RPC.get_building_progression_preview,
        toGetBuildingProgressionPreviewRpcArgs(input)
      )
      .pipe(map((rows) => rows.map(mapBuildingProgressionPreview)));
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
      sortOrder: nonNegativeInteger(draft.sortOrder),
      baseBuildTimeMinutes: nonNegativeInteger(draft.baseBuildTimeMinutes),
      maxLevel: nonNegativeInteger(draft.maxLevel),
    };

    return this.saveEntity(draft.id, payload).pipe(
      switchMap((buildingId) =>
        forkJoin([
          this.syncBuildingBonuses(buildingId, draft.bonuses),
          this.syncBuildingCosts(buildingId, draft.resourceCosts),
          this.syncFormulaOverrides(buildingId, draft),
        ])
      ),
      map(() => void 0),
      tap(() => {
        this.progression.clearCache();
        this.formulaService.clearCache();
      })
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
    const missingTemplate = bonuses.some((bonus) => !bonus.templateId);

    if (missingTemplate) {
      return throwError(
        () => new Error('Building bonuses require a semantic bonus template.')
      );
    }

    return this.backend.delete(TABLES.entity_bonuses, {
      entityType: { operator: FilterOperator.EQ, value: BONUS_ENTITY_TYPES.Building },
      entityId: { operator: FilterOperator.EQ, value: buildingId },
    }).pipe(
      switchMap(() => {
        const rows = bonuses.map((bonus, index) =>
          toEntityBonusPayload({
            entityType: BONUS_ENTITY_TYPES.Building,
            entityId: buildingId,
            bonusTemplateId: bonus.templateId ?? '',
            value: roundedNumber(bonus.value),
            description: bonus.description,
            sortOrder: index,
            isActive: true,
          })
        );

        return this.insertRows(TABLES.entity_bonuses, rows);
      })
    );
  }

  private syncFormulaOverrides(buildingId: string, draft: EditableBuilding): Observable<void> {
    return this.formulaService.getAdminData().pipe(
      switchMap((formulaData) => {
        const targetIdFor = (targetKey: string) =>
          formulaData.targets.find((target) => target.key === targetKey)?.id ?? null;

        const operations = [
          {
            targetId: targetIdFor(BUILDING_PROGRESSION_TARGET_KEYS.upgradeCost),
            formulaId: draft.formulaOverrides.upgradeCostFormulaId,
          },
          {
            targetId: targetIdFor(BUILDING_PROGRESSION_TARGET_KEYS.upgradeTime),
            formulaId: draft.formulaOverrides.upgradeTimeFormulaId,
          },
          {
            targetId: targetIdFor(BUILDING_PROGRESSION_TARGET_KEYS.bonusGrowth),
            formulaId: draft.formulaOverrides.bonusGrowthFormulaId,
          },
        ]
          .filter((entry) => !!entry.targetId)
          .map((entry) =>
            this.formulaService.assignFormulaToEntity(
              'building',
              buildingId,
              entry.targetId as string,
              entry.formulaId
            )
          );

        return operations.length ? forkJoin(operations).pipe(map(() => void 0)) : of(void 0);
      })
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

  private groupEditableBonusesByEntityId(
    rows: CanonicalEntityBonusWithTemplateRow[],
    bonusTemplateById: Parameters<typeof mapEditableBuildingEntityBonus>[1]
  ): Map<string, EditableBuildingBonus[]> {
    const mapById = new Map<string, EditableBuildingBonus[]>();

    for (const row of rows) {
      const existing = mapById.get(row.entity_id) ?? [];
      existing.push(mapEditableBuildingEntityBonus(row, bonusTemplateById));
      mapById.set(row.entity_id, existing);
    }

    return mapById;
  }
}
