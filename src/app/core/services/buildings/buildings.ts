import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
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
import { BuildingProgressionService } from '../progression/building-progression';
import { Hero } from '../hero/hero';
import { resourceOrder } from '../../utils/building-display';
import { normalizeBuildingRequirementType, normalizeBuildingResourceType } from '../../utils/building-admin-mappers';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import {
  DistrictRow,
  EstateBuildingRow,
  EstateRow,
  MansionBuildingBonusRow,
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

  getMansionEstateView(): Observable<MansionEstateView> {
    return this.heroService.getHeroData().pipe(
      switchMap((hero) =>
        forkJoin({
          rules: this.progression.getRules(),
          buildings: this.backend.getAll<
            MansionBuildingRow & {
              building_bonuses: MansionBuildingBonusRow[];
              building_requirements: MansionBuildingRequirementRow[];
              building_resource_costs: MansionBuildingResourceCostRow[];
            }
          >({
            table: TABLES.buildings,
            select:
              '*, building_bonuses(*, bonus_templates(*)), building_requirements(*), building_resource_costs(*)',
            orderBy: [
              { column: 'district_code' },
              { column: 'sort_order' },
              { column: 'rank_required' },
              { column: 'name' },
            ],
            camelCase: false,
          }),
          estate: hero.estate_id
            ? this.backend
                .getAll<EstateRow>({
                  table: TABLES.estates,
                  select: 'address, district_code',
                  filters: {
                    id: { operator: FilterOperator.EQ, value: hero.estate_id },
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
          map(({ rules, buildings, estate, estateBuildings, districts, stats }) => {
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

            const districtBuildings = buildings
              .map((row) =>
                this.mapMansionBuilding(
                  row,
                  ownedMap,
                  statLabelMap,
                  currentDistrictRank,
                  rules
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
      building_bonuses: MansionBuildingBonusRow[];
      building_requirements: MansionBuildingRequirementRow[];
      building_resource_costs: MansionBuildingResourceCostRow[];
    },
    ownedMap: Map<string, number>,
    statLabelMap: Map<string, string>,
    currentDistrictRank: number,
    rules: BuildingProgressionRules
  ): MansionBuilding {
    const currentLevel = ownedMap.get(building.id) ?? 0;
    const nextLevel = currentLevel + 1;
    const hasLimit = (building.max_level ?? 0) > 0;
    const canUpgrade = !hasLimit || currentLevel < (building.max_level ?? 0);
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
      bonuses: this.mapBonuses(
        building.building_bonuses ?? [],
        currentLevel,
        rules
      ),
    };
  }

  private mapBonuses(
    rows: MansionBuildingBonusRow[],
    currentLevel: number,
    rules: BuildingProgressionRules
  ): BuildingBonusPreview[] {
    return rows.map((row) => ({
      templateId: row.template_id,
      target: row.bonus_templates.target,
      type: row.bonus_templates.type === 'percent' ? 'percent' : 'flat',
      description: row.bonus_templates.description ?? null,
      baseValue: row.value,
      currentValue:
        this.progression.getBonusValue(currentLevel, row.value, rules) ?? 0,
      nextValue:
        this.progression.getBonusValue(currentLevel + 1, row.value, rules) ?? 0,
    }));
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

}
