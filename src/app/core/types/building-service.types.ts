import { Row } from './supabase.types';

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
export type EstateRow = Pick<Row<'estates'>, 'address' | 'district_code'>;
export type MansionBuildingResourceCostRow = Row<'building_resource_costs'>;
export type DistrictRow = Row<'estate_districts'>;
export type StatLabelRow = Pick<Row<'stats'>, 'key' | 'label'>;
