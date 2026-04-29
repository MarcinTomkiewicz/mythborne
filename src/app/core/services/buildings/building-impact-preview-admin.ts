import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { BuildingBonusImpactPreview } from '../../domain/building/building.model';
import { BonusImpactPreviewRpcRow } from '../../types/building-impact-preview-rpc.types';
import {
  mapBuildingBonusImpactPreview,
  toGetBonusImpactPreviewRpcArgs,
} from '../../utils/building-admin-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class BuildingImpactPreviewAdminService {
  private readonly backend = inject(Backend);

  getBuildingBonusImpactPreview(
    buildingId: string,
  ): Observable<BuildingBonusImpactPreview[]> {
    return this.backend
      .rpc<BonusImpactPreviewRpcRow[]>(
        RPC.get_bonus_impact_preview,
        toGetBonusImpactPreviewRpcArgs(buildingId),
      )
      .pipe(map((rows) => rows.map(mapBuildingBonusImpactPreview)));
  }
}
