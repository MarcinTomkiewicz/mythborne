import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  BuildingRequirementDefinition,
  BuildingRequirementDraft,
  BuildingRequirementEntityType,
  BuildingRequirementImpactPreview,
  BuildingRequirementValueType,
} from '../../domain/building/building.model';
import { FilterOperator } from '../../enums/filter-operators';
import { RequirementDefinitionRow } from '../../types/building-admin-row.types';
import {
  EntityRequirementRpcRow,
  RequirementImpactPreviewRpcRow,
} from '../../types/building-requirement-rpc.types';
import {
  mapBuildingRequirementDefinition,
  mapBuildingRequirementImpactPreview,
  toDeactivateEntityRequirementRpcArgs,
  toGetEntityRequirementImpactPreviewRpcArgs,
  toCreateManagedEntityRequirementRpcArgs,
  toReorderManagedEntityRequirementsRpcArgs,
  toUpdateEntityRequirementRpcArgs,
} from '../../utils/building-requirement-rpc.mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class BuildingRequirementsAdminService {
  private readonly backend = inject(Backend);

  getRequirementDefinitions(): Observable<BuildingRequirementDefinition[]> {
    return this.backend
      .getAll<RequirementDefinitionRow>({
        table: TABLES.requirement_definitions,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: { column: 'sort_order' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapBuildingRequirementDefinition)));
  }

  getBuildingRequirementImpactPreview(
    buildingId: string,
  ): Observable<BuildingRequirementImpactPreview[]> {
    return this.getRequirementImpactPreview('building_definition', buildingId);
  }

  getRequirementImpactPreview(
    entityType: BuildingRequirementEntityType,
    entityId: string,
  ): Observable<BuildingRequirementImpactPreview[]> {
    return this.backend
      .rpc<RequirementImpactPreviewRpcRow[]>(
        RPC.get_requirement_impact_preview,
        toGetEntityRequirementImpactPreviewRpcArgs(entityType, entityId),
      )
      .pipe(map((rows) => rows.map(mapBuildingRequirementImpactPreview)));
  }

  createRequirement(
    buildingId: string,
    draft: BuildingRequirementDraft,
    valueType: BuildingRequirementValueType,
  ): Observable<void> {
    return this.createEntityRequirement(
      'building_definition',
      buildingId,
      draft,
      valueType,
    );
  }

  createEntityRequirement(
    entityType: BuildingRequirementEntityType,
    entityId: string,
    draft: BuildingRequirementDraft,
    valueType: BuildingRequirementValueType,
  ): Observable<void> {
    return this.backend
      .rpc<EntityRequirementRpcRow>(
        RPC.create_entity_requirement,
        toCreateManagedEntityRequirementRpcArgs(
          entityType,
          entityId,
          draft,
          valueType,
        ),
      )
      .pipe(map(() => void 0));
  }

  updateRequirement(
    draft: BuildingRequirementDraft,
    valueType: BuildingRequirementValueType,
  ): Observable<void> {
    return this.backend
      .rpc<EntityRequirementRpcRow>(
        RPC.update_entity_requirement,
        toUpdateEntityRequirementRpcArgs(draft, valueType),
      )
      .pipe(map(() => void 0));
  }

  deactivateRequirement(requirementId: string, reason: string | null): Observable<void> {
    return this.backend
      .rpc<EntityRequirementRpcRow>(
        RPC.deactivate_entity_requirement,
        toDeactivateEntityRequirementRpcArgs(requirementId, reason),
      )
      .pipe(map(() => void 0));
  }

  reorderRequirements(
    buildingId: string,
    requirementIds: string[],
    reason: string | null,
  ): Observable<void> {
    return this.reorderEntityRequirements(
      'building_definition',
      buildingId,
      requirementIds,
      reason,
    );
  }

  reorderEntityRequirements(
    entityType: BuildingRequirementEntityType,
    entityId: string,
    requirementIds: string[],
    reason: string | null,
  ): Observable<void> {
    return this.backend
      .rpc<boolean>(
        RPC.reorder_entity_requirements,
        toReorderManagedEntityRequirementsRpcArgs(
          entityType,
          entityId,
          requirementIds,
          reason,
        ),
      )
      .pipe(map(() => void 0));
  }
}
