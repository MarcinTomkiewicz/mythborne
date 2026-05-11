import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ExplorationSmokeReadinessItem } from '../../domain/exploration/exploration-smoke-readiness.model';
import { toExplorationSmokeReadinessItems } from '../../utils/exploration-smoke-readiness';
import { ExplorationEncounterAdmin } from './exploration-encounter-admin';
import { ExplorationTrialAdmin } from './exploration-trial-admin';

@Injectable({ providedIn: 'root' })
export class ExplorationSmokeReadiness {
  private readonly trials = inject(ExplorationTrialAdmin);
  private readonly encounters = inject(ExplorationEncounterAdmin);

  getReadinessMatrix(): Observable<ExplorationSmokeReadinessItem[]> {
    return forkJoin({
      trialData: this.trials.getAdminData(),
      encounterData: this.encounters.getAdminData(),
    }).pipe(
      map(({ trialData, encounterData }) =>
        toExplorationSmokeReadinessItems({
          trials: trialData.trials,
          encounters: encounterData.encounters,
          trialReadiness: trialData.trialReadiness,
          encounterReadiness: encounterData.encounterReadiness,
          rewardAssignments: uniqueById([
            ...trialData.rewardAssignments,
            ...encounterData.rewardAssignments,
          ]),
          rewardProfiles: uniqueById([...trialData.rewardProfiles, ...encounterData.rewardProfiles]),
          rewardProfileEntries: uniqueById([
            ...trialData.rewardProfileEntries,
            ...encounterData.rewardProfileEntries,
          ]),
          effectPayloads: encounterData.effectPayloads,
          effectDefinitions: encounterData.effectDefinitions,
        }),
      ),
    );
  }
}

function uniqueById<T extends { id: string }>(entries: T[]): T[] {
  return [...new Map(entries.map((entry) => [entry.id, entry])).values()];
}
