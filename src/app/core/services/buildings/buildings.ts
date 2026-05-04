import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { TABLES } from '../../constants/tables.const';
import { MansionBuilding, MansionEstateView } from '../../domain/building/building.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { BuildingProgressionService } from '../progression/building-progression';
import { FormulaService } from '../formula/formula';
import { Hero } from '../hero/hero';
import { EstateAddresses } from '../estate/estate-addresses';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import {
  BuildingDistrictLevelCapRow,
  DistrictRow,
  EstateBuildingRow,
  MansionBuildingResourceCostRow,
  MansionBuildingRequirementRow,
  MansionBuildingRow,
  StatLabelRow,
} from '../../types/building-service.types';
import {
  buildStatLabelMap,
  buildDistrictRankMap,
  effectiveBuildingMaxLevel,
  groupEstateBuildingsByBuildingId,
  groupLevelCapsByBuildingIdAndDistrict,
  groupRequirementsByBuildingId,
  isUnlimitedBuildingCap,
  mapActiveBuildingRequirements,
  requiredBuildingDistrictCode,
  requiredDistrictRank,
  requiredEstateBuildingLevel,
} from './building-runtime-read-model';
import {
  aggregateCostTotals,
  groupBonusesByEntityId,
  mapActiveCostRules,
  mapBuildingBonuses,
} from './building-runtime-calculation';

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  private readonly backend = inject(Backend);
  private readonly heroService = inject(Hero);
  private readonly progression = inject(BuildingProgressionService);
  private readonly formulaService = inject(FormulaService);
  private readonly estateAddresses = inject(EstateAddresses);

  getMansionEstateView(): Observable<MansionEstateView> {
    return this.heroService.getHeroData().pipe(
      switchMap((hero) => {
        if (!hero.estate_id) {
          throw new Error('Active hero does not have an estate address.');
        }

        return forkJoin({
          formulaData: this.formulaService.getAdminData(),
          buildings: this.backend.getAll<
            MansionBuildingRow & {
              building_resource_costs: MansionBuildingResourceCostRow[];
            }
          >({
            table: TABLES.buildings,
            select: '*, building_resource_costs(*)',
            orderBy: [
              { column: 'district_code' },
              { column: 'sort_order' },
              { column: 'rank_required' },
              { column: 'name' },
            ],
            camelCase: false,
          }),
          levelCaps: this.backend.getAll<BuildingDistrictLevelCapRow>({
            table: TABLES.building_district_level_caps,
            camelCase: false,
          }),
          requirements: this.backend.getAll<MansionBuildingRequirementRow>({
            table: TABLES.entity_requirements,
            select: '*, requirement_definitions(*)',
            filters: {
              entityType: {
                operator: FilterOperator.EQ,
                value: 'building_definition',
              },
              isActive: {
                operator: FilterOperator.EQ,
                value: true,
              },
            },
            orderBy: [
              { column: 'entity_id' },
              { column: 'sort_order' },
              { column: 'applies_from_level' },
            ],
            camelCase: false,
          }),
          stats: this.backend.getAll<StatLabelRow>({
            table: TABLES.stats,
            select: 'key, label',
            orderBy: { column: 'sort_order' },
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
          currentAddress: this.estateAddresses.getCurrentAddress({
                estateId: hero.estate_id,
                heroId: hero.id,
                serverId: hero.server_id,
              }),
          estateBuildings: this.backend.getAll<EstateBuildingRow>({
                table: TABLES.estate_buildings,
                filters: {
                  estateId: { operator: FilterOperator.EQ, value: hero.estate_id },
                },
                camelCase: false,
              }),
          districts: this.backend.getAll<DistrictRow>({
            table: TABLES.estate_districts,
            orderBy: { column: 'rank' },
            camelCase: false,
          }),
        }).pipe(
          map(({
            formulaData,
            buildings,
            levelCaps,
            requirements,
            stats,
            entityBonuses,
            currentAddress,
            estateBuildings,
            districts,
          }) => {
            if (!currentAddress) {
              throw new Error('Active hero estate address is not readable.');
            }

            const currentDistrictCode = currentAddress.districtCode;
            const currentDistrict = requiredCurrentDistrict(districts, currentDistrictCode);
            const districtRanks = buildDistrictRankMap(districts);
            const currentDistrictRank = currentDistrict.rank;
            const estateBuildingsByBuildingId =
              groupEstateBuildingsByBuildingId(estateBuildings);
            const levelCapsByBuildingAndDistrict =
              groupLevelCapsByBuildingIdAndDistrict(levelCaps);
            const requirementsByBuildingId = groupRequirementsByBuildingId(requirements);
            const statLabels = buildStatLabelMap(stats);
            const bonusesByBuildingId = groupBonusesByEntityId(entityBonuses);

            const districtBuildings = buildings
              .filter((row) => {
                const districtCode = requiredBuildingDistrictCode(row);
                return requiredDistrictRank(districtCode, districtRanks) <= currentDistrictRank;
              })
              .map((row) =>
                this.mapMansionBuilding(
                  row,
                  bonusesByBuildingId.get(row.id) ?? [],
                  estateBuildingsByBuildingId,
                  levelCapsByBuildingAndDistrict,
                  requirementsByBuildingId.get(row.id) ?? [],
                  statLabels,
                  currentDistrictRank,
                  currentDistrictCode,
                  districtRanks,
                  formulaData
                )
              );

            return {
              currentAddress: currentAddress.addressLabel,
              currentDistrictCode,
              currentDistrictName: currentAddress.districtName ?? currentDistrict?.name ?? null,
              buildings: districtBuildings,
            } satisfies MansionEstateView;
          })
        );
      })
    );
  }

  private mapMansionBuilding(
    building: MansionBuildingRow & {
      building_resource_costs: MansionBuildingResourceCostRow[];
    },
    bonuses: CanonicalEntityBonusWithTemplateRow[],
    estateBuildingsByBuildingId: ReadonlyMap<string, EstateBuildingRow>,
    levelCaps: ReadonlyMap<string, BuildingDistrictLevelCapRow>,
    requirements: readonly MansionBuildingRequirementRow[],
    statLabels: ReadonlyMap<string, string>,
    currentDistrictRank: number,
    currentDistrictCode: string,
    districtRanks: ReadonlyMap<string, number>,
    formulaData: FormulaAdminData
  ): MansionBuilding {
    const districtCode = requiredBuildingDistrictCode(building);
    const buildingDistrictRank = requiredDistrictRank(districtCode, districtRanks);
    const currentLevel = requiredEstateBuildingLevel(estateBuildingsByBuildingId, building);
    const nextLevel = currentLevel + 1;
    const effectiveMaxLevel = effectiveBuildingMaxLevel({
      building,
      currentDistrictCode,
      levelCaps,
    });
    const isUnlimited = isUnlimitedBuildingCap(effectiveMaxLevel);
    const canUpgrade = isUnlimited || currentLevel < effectiveMaxLevel;
    const rules = this.progression.resolveRulesForBuilding(building.id, formulaData);
    const activeCostRules = canUpgrade
      ? mapActiveCostRules(
          building.building_resource_costs ?? [],
          currentLevel,
          building.rank_required,
          rules,
          this.progression.getUpgradeCost.bind(this.progression),
        )
      : [];

    return {
      id: building.id,
      key: building.key,
      name: building.name,
      description: building.description ?? null,
      imagePath:
        resolveBuildingImagePath(building.key, districtCode) ??
        building.image_path ??
        '/assets/icons/capitol.svg',
      districtCode,
      districtUnlockRank: buildingDistrictRank,
      rankRequired: building.rank_required,
      sortOrder: building.sort_order ?? 0,
      startingLevel: building.starting_level,
      baseCost: building.base_cost,
      maxLevel: building.max_level ?? 0,
      effectiveMaxLevel,
      isUnlimited,
      currentLevel,
      nextLevel,
      baseBuildTimeSeconds: building.base_build_time_seconds ?? 0,
      isOwned: currentLevel > 0,
      isUnlocked: buildingDistrictRank <= currentDistrictRank,
      canUpgrade,
      nextUpgradeTimeSeconds: canUpgrade
        ? this.progression.getUpgradeTimeSeconds(
            currentLevel,
            building.base_build_time_seconds ?? 0,
            building.rank_required,
            rules
          )
        : null,
      nextUpgradeCosts: aggregateCostTotals(activeCostRules),
      activeCostRules,
      activeRequirements: mapActiveBuildingRequirements(
        requirements,
        nextLevel,
        statLabels,
      ),
      bonuses: mapBuildingBonuses(
        bonuses,
        currentLevel,
        rules,
        this.progression.getBonusValue.bind(this.progression),
      ),
    };
  }
}

function requiredCurrentDistrict(
  districts: readonly DistrictRow[],
  currentDistrictCode: string,
): DistrictRow {
  const district = districts.find((row) => row.code === currentDistrictCode);

  if (!district) {
    throw new Error(`Estate district "${currentDistrictCode}" is not configured.`);
  }

  return district;
}
