import { Database } from './database.types';

type Functions = Database['public']['Functions'];

export type CreateEntityRequirementRpcArgs =
  Functions['create_entity_requirement']['Args'];
export type EntityRequirementRpcRow =
  Functions['create_entity_requirement']['Returns'];

export type UpdateEntityRequirementRpcArgs =
  Functions['update_entity_requirement']['Args'];
export type DeactivateEntityRequirementRpcArgs =
  Functions['deactivate_entity_requirement']['Args'];
export type ReorderEntityRequirementsRpcArgs =
  Functions['reorder_entity_requirements']['Args'];

export type GetRequirementImpactPreviewRpcArgs =
  Functions['get_requirement_impact_preview']['Args'];
export type RequirementImpactPreviewRpcRow =
  Functions['get_requirement_impact_preview']['Returns'][number];
