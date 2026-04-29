import { Row } from './supabase.types';

export type BuildingResourceCostAdminRow = Row<'building_resource_costs'>;
export type RequirementDefinitionRow = Row<'requirement_definitions'>;

export type EditableBuildingRow = Row<'buildings'> & {
  building_resource_costs: BuildingResourceCostAdminRow[];
};
