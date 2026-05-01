import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { ExplorationDifficultyTierReadModel } from '../../domain/exploration/exploration-definition.model';
import { HeroExplorationStateReadModel } from '../../domain/exploration/exploration-runtime.model';
import { TrialOpportunityCurvePreview } from '../../domain/exploration/exploration-preview.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import {
  GetHeroExplorationStateRpcResult,
  PreviewTrialOpportunityCurveRpcRow,
  StartHeroExplorationStepRpcRow,
  StartOrGetHeroExplorationRpcRow,
} from '../../types/exploration-runtime-rpc.types';
import { mapExplorationDifficultyTier } from '../../utils/exploration-definition-mappers';
import { mapTrialOpportunityCurvePreview } from '../../utils/exploration-preview-mappers';
import { mapHeroExplorationStateJson } from '../../utils/exploration-runtime-json-mappers';
import {
  firstStartHeroExplorationStepRow,
  firstStartOrGetHeroExplorationRow,
  toGetHeroExplorationStateRpcArgs,
  toPreviewTrialOpportunityCurveRpcArgs,
  toStartHeroExplorationStepRpcArgs,
  toStartOrGetHeroExplorationRpcArgs,
} from '../../utils/exploration-runtime-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class HeroExplorations {
  private readonly backend = inject(Backend);

  getActiveDifficultyTiers(): Observable<ExplorationDifficultyTierReadModel[]> {
    return this.backend
      .getAll<Row<'exploration_difficulty_tiers'>>({
        table: TABLES.exploration_difficulty_tiers,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapExplorationDifficultyTier)));
  }

  getHeroExplorationState(input: {
    heroId: string;
    difficultyKey: string;
  }): Observable<HeroExplorationStateReadModel> {
    return this.backend
      .rpc<GetHeroExplorationStateRpcResult>(
        RPC.get_hero_exploration_state,
        toGetHeroExplorationStateRpcArgs(input),
      )
      .pipe(map(mapHeroExplorationStateJson));
  }

  startOrGetHeroExploration(input: {
    heroId: string;
    difficultyKey: string;
  }): Observable<HeroExplorationStateReadModel> {
    return this.backend
      .rpc<StartOrGetHeroExplorationRpcRow[]>(
        RPC.start_or_get_hero_exploration,
        toStartOrGetHeroExplorationRpcArgs(input),
      )
      .pipe(
        map(firstStartOrGetHeroExplorationRow),
        switchMap((row) =>
          this.getHeroExplorationState({
            heroId: row.hero_id,
            difficultyKey: row.difficulty_key,
          }),
        ),
      );
  }

  startHeroExplorationStep(input: {
    heroId: string;
    difficultyKey: string;
    explorationId: string;
    edgeId: string;
    stepKind?: string | null;
  }): Observable<HeroExplorationStateReadModel> {
    return this.backend
      .rpc<StartHeroExplorationStepRpcRow[]>(
        RPC.start_hero_exploration_step,
        toStartHeroExplorationStepRpcArgs(input),
      )
      .pipe(
        map(firstStartHeroExplorationStepRow),
        switchMap(() =>
          this.getHeroExplorationState({
            heroId: input.heroId,
            difficultyKey: input.difficultyKey,
          }),
        ),
      );
  }

  previewTrialOpportunityCurve(input: {
    difficultyKey: string;
    startingDryStepCount?: number | null;
    stepsToPreview?: number | null;
  }): Observable<TrialOpportunityCurvePreview[]> {
    return this.backend
      .rpc<PreviewTrialOpportunityCurveRpcRow[]>(
        RPC.preview_trial_opportunity_curve,
        toPreviewTrialOpportunityCurveRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapTrialOpportunityCurvePreview)));
  }
}
