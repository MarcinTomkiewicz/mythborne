import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import {
  EstateBuildingJobRow,
  FinalizeHeroEstateBuildingJobsRpcRow,
} from '../../types/building-service.types';
import { Backend } from '../backend/backend';
import { firstBuildingJobFinalizationRow } from './building-jobs-read-model';
import { MansionBuildingJobFinalization } from '../../domain/building/building.model';

const RECENT_BUILDING_JOB_LIMIT = 5;

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

  getRecentJobsForEstate(estateId: string): Observable<EstateBuildingJobRow[]> {
    return this.backend.getAll<EstateBuildingJobRow>({
      table: TABLES.estate_building_jobs,
      filters: {
        estateId: { operator: FilterOperator.EQ, value: estateId },
      },
      orderBy: { column: 'updated_at', ascending: false },
      range: { from: 0, to: RECENT_BUILDING_JOB_LIMIT - 1 },
      camelCase: false,
    });
  }
}
