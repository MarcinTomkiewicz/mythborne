import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  FinalizeHeroEstateBuildingJobsRpcRow,
  GetHeroEstateRuntimeStateRpcArgs,
  GetHeroEstateRuntimeStateRpcRow,
  StartEstateBuildingUpgradeRpcArgs,
  StartEstateBuildingUpgradeRpcRow,
} from '../../types/building-service.types';
import { Backend } from '../backend/backend';
import {
  firstBuildingJobFinalizationRow,
  firstHeroEstateRuntimeStateRow,
  firstStartBuildingUpgradeRow,
  HeroEstateRuntimeStateReadModel,
} from './building-jobs-read-model';
import {
  MansionBuildingJobFinalization,
  StartBuildingUpgradeResult,
} from '../../domain/building/building.model';

@Injectable({ providedIn: 'root' })
export class BuildingJobs {
  private readonly backend = inject(Backend);

  finalizeHeroEstateBuildingJobs(
    heroId: string,
  ): Observable<MansionBuildingJobFinalization> {
    return this.backend
      .rpc<FinalizeHeroEstateBuildingJobsRpcRow[]>(
        RPC.finalize_hero_estate_building_jobs,
        { p_hero_id: heroId },
      )
      .pipe(map(firstBuildingJobFinalizationRow));
  }

  getHeroEstateRuntimeState(heroId: string): Observable<HeroEstateRuntimeStateReadModel> {
    const args: GetHeroEstateRuntimeStateRpcArgs = { p_hero_id: heroId };

    return this.backend
      .rpc<GetHeroEstateRuntimeStateRpcRow[]>(
        RPC.get_hero_estate_runtime_state,
        args,
      )
      .pipe(map(firstHeroEstateRuntimeStateRow));
  }

  startHeroEstateBuildingUpgrade(input: {
    heroId: string;
    buildingId: string;
    reason?: string;
    requestId?: string;
  }): Observable<StartBuildingUpgradeResult> {
    const args: StartEstateBuildingUpgradeRpcArgs = {
      p_hero_id: input.heroId,
      p_building_id: input.buildingId,
    };

    if (input.reason) {
      args.p_reason = input.reason;
    }

    if (input.requestId) {
      args.p_request_id = input.requestId;
    }

    return this.backend
      .rpc<StartEstateBuildingUpgradeRpcRow[]>(
        RPC.start_estate_building_upgrade,
        args,
      )
      .pipe(map(firstStartBuildingUpgradeRow));
  }
}
