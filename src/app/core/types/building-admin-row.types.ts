import { Row } from './supabase.types';

export type BuildingBonusAdminRow = Row<'building_bonuses'> & {
  bonus_templates: Row<'bonus_templates'>;
};

export type BuildingRequirementAdminRow = Row<'building_requirements'>;
export type BuildingResourceCostAdminRow = Row<'building_resource_costs'>;

export type EditableBuildingRow = Row<'buildings'> & {
  building_bonuses: BuildingBonusAdminRow[];
  building_requirements: BuildingRequirementAdminRow[];
  building_resource_costs: BuildingResourceCostAdminRow[];
};
