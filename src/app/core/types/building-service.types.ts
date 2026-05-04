import { Row } from './supabase.types';
import { Database } from './database.types';

export type BuildingPayload = {
  key: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  districtCode: string;
  sortOrder: number;
  baseBuildTimeSeconds: number;
  maxLevel: number;
};

export type MansionBuildingRow = Row<'buildings'>;
export type EstateBuildingRow = Row<'estate_buildings'>;
export type EstateBuildingJobRow = Row<'estate_building_jobs'>;
export type BuildingDistrictLevelCapRow = Row<'building_district_level_caps'>;
export type MansionBuildingResourceCostRow = Row<'building_resource_costs'>;
export type MansionBuildingRequirementRow = Row<'entity_requirements'> & {
  requirement_definitions: Row<'requirement_definitions'> | null;
};
export type DistrictRow = Row<'estate_districts'>;
export type StatLabelRow = Pick<Row<'stats'>, 'key' | 'label'>;

export type FinalizeHeroEstateBuildingJobsRpcRow =
  Database['public']['Functions']['finalize_hero_estate_building_jobs']['Returns'][number];
