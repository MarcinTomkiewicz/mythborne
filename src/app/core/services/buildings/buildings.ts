import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { TABLES } from '../../constants/tables.const';
import {
  BuildingBonusPreview,
  BuildingRequirementPreview,
  BuildingResourceCostPreview,
  BuildingResourceCostTotal,
  BuildingResourceType,
  MansionBuilding,
  MansionEstateView,
} from '../../domain/building/building.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import { BuildingProgressionRules } from '../../domain/progression/building-progression.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { BuildingProgressionService } from '../progression/building-progression';
import { FormulaService } from '../formula/formula';
import { Hero } from '../hero/hero';
import { resourceOrder } from '../../utils/building-display';
import { normalizeBuildingRequirementType, normalizeBuildingResourceType } from '../../utils/building-admin-mappers';
import { normalizeBonusType } from '../../utils/bonus';
import { mapResolvedBonus } from '../../utils/bonus-governance';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import {
  DistrictRow,
  EstateBuildingRow,
  EstateRow,
  MansionBuildingRequirementRow,
  MansionBuildingResourceCostRow,
  MansionBuildingRow,
  StatLabelRow,
} from '../../types/building-service.types';

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  private readonly backend = inject(Backend);
  private readonly heroService = inject(Hero);
  private readonly progression = inject(BuildingProgressionService);
  private readonly formulaService = inject(FormulaService);

  getMansionEstateView(): Observable<MansionEstateView> {
    return this.heroService.getHeroData().pipe(
      switchMap((hero) =>
        forkJoin({
          formulaData: this.formulaService.getAdminData(),
          buildings: this.backend.getAll<
            MansionBuildingRow & {
              building_requirements: MansionBuildingRequirementRow[];
              building_resource_costs: MansionBuildingResourceCostRow[];
            }
          >({
            table: TABLES.buildings,
            select: '*, building_requirements(*), building_resource_costs(*)',
            orderBy: [
              { column: 'district_code' },
              { column: 'sort_order' },
              { column: 'rank_required' },
              { column: 'name' },
            ],
            camelCase: false,
          }),
          entityBonuses: this.backend.getAll<CanonicalEntityBonusWithTemplateRow>({
            table: TABLES.entity_bonuses,
            select: '*, bonus_templates (*)',
            filters: {
              entityType: {
                operator: FilterOperator.EQ,
                value: BONUS_ENTITY_TYPES.Building,
              },
            },
            orderBy: { column: 'sort_order' },
            camelCase: false,
          }),
          estate: hero.estate_id
            ? this.backend
                .getAll<EstateRow>({
                  table: TABLES.estates,
                  select: 'address, district_code',
                  filters: {
                    id: { operator: FilterOperator.EQ, value: hero.estate_id },
                    heroId: { operator: FilterOperator.EQ, value: hero.id },
                    serverId: { operator: FilterOperator.EQ, value: hero.server_id },
                  },
                  range: { from: 0, to: 0 },
                  camelCase: false,
                })
                .pipe(map((rows) => rows[0] ?? null))
            : of(null),
          estateBuildings: hero.estate_id
            ? this.backend.getAll<EstateBuildingRow>({
                table: TABLES.estate_buildings,
                filters: {
                  estateId: { operator: FilterOperator.EQ, value: hero.estate_id },
                },
                camelCase: false,
              })
            : of([]),
          districts: this.backend.getAll<DistrictRow>({
            table: TABLES.estate_districts,
            orderBy: { column: 'rank' },
            camelCase: false,
          }),
          stats: this.backend.getAll<StatLabelRow>({
            table: TABLES.stats,
            select: 'key, label',
            orderBy: { column: 'order' },
            camelCase: false,
          }),
        }).pipe(
          map(({ formulaData, buildings, entityBonuses, estate, estateBuildings, districts, stats }) => {
            const currentDistrictCode = estate?.district_code ?? 'A';
            const currentDistrict = districts.find(
              (district) => district.code === currentDistrictCode
            );
            const currentDistrictRank = currentDistrict?.rank ?? 1;
            const ownedMap = new Map(
              estateBuildings.map((entry) => [entry.building_id, entry.level])
            );
            const statLabelMap = new Map(
              stats.map((stat) => [stat.key, stat.label])
            );
            const bonusesByBuildingId = this.groupBonusesByEntityId(entityBonuses);

            const districtBuildings = buildings
              .map((row) =>
                this.mapMansionBuilding(
                  row,
                  bonusesByBuildingId.get(row.id) ?? [],
                  ownedMap,
                  statLabelMap,
                  currentDistrictRank,
                  formulaData
                )
              )
              .filter((building) => building.rankRequired <= currentDistrictRank);

            return {
              currentAddress: estate?.address ?? null,
              currentDistrictCode,
              currentDistrictName: currentDistrict?.name ?? null,
              buildings: districtBuildings,
            } satisfies MansionEstateView;
          })
        )
      )
    );
  }

  private mapMansionBuilding(
    building: MansionBuildingRow & {
      building_requirements: MansionBuildingRequirementRow[];
      building_resource_costs: MansionBuildingResourceCostRow[];
    },
    bonuses: CanonicalEntityBonusWithTemplateRow[],
    ownedMap: Map<string, number>,
    statLabelMap: Map<string, string>,
    currentDistrictRank: number,
    formulaData: FormulaAdminData
  ): MansionBuilding {
    const currentLevel = ownedMap.get(building.id) ?? 0;
    const nextLevel = currentLevel + 1;
    const hasLimit = (building.max_level ?? 0) > 0;
    const canUpgrade = !hasLimit || currentLevel < (building.max_level ?? 0);
    const rules = this.progression.resolveRulesForBuilding(building.id, formulaData);
    const activeCostRules = canUpgrade
      ? this.mapActiveCostRules(
          building.building_resource_costs ?? [],
          currentLevel,
          building.rank_required,
          rules
        )
      : [];

    return {
      id: building.id,
      key: building.key,
      name: building.name,
      description: building.description ?? null,
      imagePath:
        resolveBuildingImagePath(building.key, building.district_code) ??
        building.image_path ??
        '/assets/icons/capitol.svg',
      districtCode: building.district_code ?? 'A',
      rankRequired: building.rank_required,
      sortOrder: building.sort_order ?? 0,
      maxLevel: building.max_level ?? 0,
      currentLevel,
      nextLevel,
      baseBuildTimeMinutes: building.base_build_time_minutes ?? 0,
      isOwned: currentLevel > 0,
      isUnlocked: currentDistrictRank >= building.rank_required,
      canUpgrade,
      nextUpgradeTimeMinutes: canUpgrade
        ? this.progression.getUpgradeTimeMinutes(
            currentLevel,
            building.base_build_time_minutes ?? 0,
            building.rank_required,
            rules
          )
        : null,
      nextUpgradeCosts: this.aggregateCostTotals(activeCostRules),
      activeCostRules,
      activeRequirements: this.mapActiveRequirements(
        building.building_requirements ?? [],
        statLabelMap,
        nextLevel
      ),
      bonuses: this.mapBonuses(bonuses, currentLevel, rules),
    };
  }

  private mapBonuses(
    rows: CanonicalEntityBonusWithTemplateRow[],
    currentLevel: number,
    rules: BuildingProgressionRules
  ): BuildingBonusPreview[] {
    return rows.map((row) => {
      const resolved = mapResolvedBonus(row);

      if (resolved.qualityScalesLevelInterval) {
        throw new Error('entity_bonuses.quality_scales_level_interval must remain false.');
      }

      return {
        templateId: resolved.templateId,
        target: resolved.targetKey,
        type: normalizeBonusType(resolved.typeKey),
        description: row.description ?? row.bonus_templates?.description ?? null,
        baseValue: resolved.value,
        currentValue:
          this.progression.getBonusValue(currentLevel, resolved.value, rules) ?? 0,
        nextValue:
          this.progression.getBonusValue(currentLevel + 1, resolved.value, rules) ?? 0,
      };
    });
  }

  private mapActiveCostRules(
    rows: MansionBuildingResourceCostRow[],
    currentLevel: number,
    rank: number,
    rules: BuildingProgressionRules
  ): BuildingResourceCostPreview[] {
    const nextLevel = currentLevel + 1;

    return rows
      .filter((row) => row.applies_from_level <= nextLevel)
      .sort((left, right) => {
        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }

        return left.applies_from_level - right.applies_from_level;
      })
      .map((row) => ({
        resourceType: normalizeBuildingResourceType(row.resource_type),
        appliesFromLevel: row.applies_from_level,
        baseValue: row.base_value,
        nextValue:
          this.progression.getUpgradeCost(currentLevel, row.base_value, rank, rules) ?? 0,
      }));
  }

  private aggregateCostTotals(
    rows: BuildingResourceCostPreview[]
  ): BuildingResourceCostTotal[] {
    const totals = rows.reduce((acc, row) => {
      acc.set(row.resourceType, (acc.get(row.resourceType) ?? 0) + row.nextValue);
      return acc;
    }, new Map<BuildingResourceType, number>());

    return Array.from(totals.entries())
      .map(([resourceType, amount]) => ({
        resourceType,
        amount,
      }))
      .sort(
        (left, right) =>
          resourceOrder(left.resourceType) - resourceOrder(right.resourceType)
      );
  }

  private mapActiveRequirements(
    rows: MansionBuildingRequirementRow[],
    statLabelMap: Map<string, string>,
    nextLevel: number
  ): BuildingRequirementPreview[] {
    return rows
      .filter((row) => row.applies_from_level <= nextLevel)
      .sort((left, right) => {
        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }

        return left.applies_from_level - right.applies_from_level;
      })
      .map((row) => ({
        type: normalizeBuildingRequirementType(row.requirement_type),
        statKey: row.stat_key,
        statLabel: row.stat_key ? statLabelMap.get(row.stat_key) ?? row.stat_key : null,
        minValue: row.min_value,
        appliesFromLevel: row.applies_from_level,
      }));
  }

  private groupBonusesByEntityId(
    rows: CanonicalEntityBonusWithTemplateRow[]
  ): Map<string, CanonicalEntityBonusWithTemplateRow[]> {
    const mapById = new Map<string, CanonicalEntityBonusWithTemplateRow[]>();

    for (const row of rows) {
      const existing = mapById.get(row.entity_id) ?? [];
      existing.push(row);
      mapById.set(row.entity_id, existing);
    }

    return mapById;
  }
}
