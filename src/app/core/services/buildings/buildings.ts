import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BONUS_ENTITY_TYPES } from '../../constants/bonus-entity-types.const';
import { TABLES } from '../../constants/tables.const';
import {
  MansionEstateView,
  StartBuildingUpgradeResult,
} from '../../domain/building/building.model';
import { BuildingProgressionService } from '../progression/building-progression';
import { FormulaService } from '../formula/formula';
import { Hero } from '../hero/hero';
import { Backend } from '../backend/backend';
import { FilterOperator } from '../../enums/filter-operators';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import {
  BuildingDistrictLevelCapRow,
  DistrictRow,
  MansionBuildingResourceCostRow,
  MansionBuildingRequirementRow,
  MansionBuildingRow,
  StatLabelRow,
} from '../../types/building-service.types';
import {
  buildStatLabelMap,
  buildDistrictRankMap,
  groupEstateBuildingsByBuildingId,
  groupLevelCapsByBuildingIdAndDistrict,
  groupRequirementsByBuildingId,
  requiredBuildingDistrictCode,
  requiredDistrictRank,
} from './building-runtime-read-model';
import { groupBonusesByEntityId } from './building-runtime-calculation';
import { BuildingJobs } from './building-jobs';
import { mapMansionBuildingJobs } from './building-jobs-read-model';
import { mapMansionBuilding } from './mansion-building-read-model';

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  private readonly backend = inject(Backend);
  private readonly heroService = inject(Hero);
  private readonly progression = inject(BuildingProgressionService);
  private readonly formulaService = inject(FormulaService);
  private readonly buildingJobs = inject(BuildingJobs);

  getMansionEstateView(): Observable<MansionEstateView> {
    return this.heroService.getHeroData().pipe(
      switchMap((hero) => {
        if (!hero.estate_id) {
          throw new Error('Active hero does not have an estate address.');
        }
        const estateId = hero.estate_id;

        return this.buildingJobs.getHeroEstateRuntimeState(hero.id).pipe(
          switchMap((runtimeState) =>
            forkJoin({
              runtimeState: of(runtimeState),
              formulaData: this.formulaService.getAdminData(),
              buildings: this.getBuildings(),
              levelCaps: this.backend.getAll<BuildingDistrictLevelCapRow>({
                table: TABLES.building_district_level_caps,
                camelCase: false,
              }),
              requirements: this.getRequirements(),
              stats: this.getStats(),
              entityBonuses: this.getEntityBonuses(),
              districts: this.backend.getAll<DistrictRow>({
                table: TABLES.estate_districts,
                orderBy: { column: 'rank' },
                camelCase: false,
              }),
            }),
          ),
          map(({
            runtimeState,
            formulaData,
            buildings,
            levelCaps,
            requirements,
            stats,
            entityBonuses,
            districts,
          }) => {
            if (
              runtimeState.heroId !== hero.id ||
              runtimeState.serverId !== hero.server_id ||
              runtimeState.estateId !== estateId
            ) {
              throw new Error('Hero estate runtime state returned a stale hero estate result.');
            }

            const currentDistrictCode = runtimeState.districtCode;
            const currentDistrict = requiredCurrentDistrict(districts, currentDistrictCode);
            const districtRanks = buildDistrictRankMap(districts);
            const currentDistrictRank = currentDistrict.rank;
            const estateBuildingsByBuildingId =
              groupEstateBuildingsByBuildingId(runtimeState.estateBuildings);
            const levelCapsByBuildingAndDistrict =
              groupLevelCapsByBuildingIdAndDistrict(levelCaps);
            const requirementsByBuildingId = groupRequirementsByBuildingId(requirements);
            const statLabels = buildStatLabelMap(stats);
            const bonusesByBuildingId = groupBonusesByEntityId(entityBonuses);
            const activeJobs = runtimeState.activeJob
              ? mapMansionBuildingJobs({
                  rows: [runtimeState.activeJob],
                  buildings,
                })
              : [];
            const recentJobs = mapMansionBuildingJobs({
              rows: runtimeState.recentJobs,
              buildings,
            });

            const districtBuildings = buildings
              .filter((row) => {
                const districtCode = requiredBuildingDistrictCode(row);
                return requiredDistrictRank(districtCode, districtRanks) <= currentDistrictRank;
              })
              .map((row) =>
                mapMansionBuilding({
                  building: row,
                  bonuses: bonusesByBuildingId.get(row.id) ?? [],
                  estateBuildingsByBuildingId,
                  levelCaps: levelCapsByBuildingAndDistrict,
                  requirements: requirementsByBuildingId.get(row.id) ?? [],
                  statLabels,
                  currentDistrictRank,
                  currentDistrictCode,
                  districtRanks,
                  formulaData,
                  resolveRulesForBuilding: this.progression.resolveRulesForBuilding.bind(
                    this.progression,
                  ),
                  getUpgradeTimeSeconds: this.progression.getUpgradeTimeSeconds.bind(
                    this.progression,
                  ),
                  getUpgradeCost: this.progression.getUpgradeCost.bind(this.progression),
                  getBonusValue: this.progression.getBonusValue.bind(this.progression),
                })
              );

            return {
              heroId: hero.id,
              serverId: hero.server_id,
              currentAddress: runtimeState.address,
              currentDistrictCode,
              currentDistrictName: currentDistrict.name ?? null,
              activeBuildingJob: activeJobs[0] ?? null,
              recentBuildingJobs: recentJobs.filter(
                (job) => job.status !== 'active',
              ),
              finalizedBuildingJobsCount: runtimeState.settledCompletedCount,
              buildings: districtBuildings,
            } satisfies MansionEstateView;
          })
        );
      })
    );
  }

  startBuildingUpgrade(buildingId: string): Observable<StartBuildingUpgradeResult> {
    return this.heroService.getHeroData().pipe(
      switchMap((hero) => {
        if (!hero.estate_id) {
          throw new Error('Active hero does not have an estate address.');
        }

        return this.buildingJobs.startHeroEstateBuildingUpgrade({
          heroId: hero.id,
          buildingId,
          reason: 'Player started estate building construction or upgrade.',
        }).pipe(
          map((result) => {
            if (
              result.estateId !== hero.estate_id ||
              result.buildingId !== buildingId
            ) {
              throw new Error('Building upgrade start returned a stale hero estate result.');
            }

            return result;
          }),
        );
      }),
    );
  }

  private getBuildings(): Observable<
    (MansionBuildingRow & {
      building_resource_costs: MansionBuildingResourceCostRow[];
    })[]
  > {
    return this.backend.getAll<
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
    });
  }

  private getRequirements(): Observable<MansionBuildingRequirementRow[]> {
    return this.backend.getAll<MansionBuildingRequirementRow>({
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
    });
  }

  private getStats(): Observable<StatLabelRow[]> {
    return this.backend.getAll<StatLabelRow>({
      table: TABLES.stats,
      select: 'key, label',
      orderBy: { column: 'order' },
      camelCase: false,
    });
  }

  private getEntityBonuses(): Observable<CanonicalEntityBonusWithTemplateRow[]> {
    return this.backend.getAll<CanonicalEntityBonusWithTemplateRow>({
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
    });
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
