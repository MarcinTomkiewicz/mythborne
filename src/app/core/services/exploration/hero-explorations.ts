import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { ExplorationDifficultyTierReadModel } from '../../domain/exploration/exploration-definition.model';
import {
  HeroExplorationChallengeCompletionWorkflowResult,
  HeroExplorationStateReadModel,
  HeroExplorationStepResolutionWorkflowResult,
} from '../../domain/exploration/exploration-runtime.model';
import { TrialOpportunityCurvePreview } from '../../domain/exploration/exploration-preview.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import {
  AutoResolveHeroExplorationChallengeAttemptRpcRow,
  CompleteHeroExplorationChallengeAttemptRpcRow,
  GetHeroExplorationStateRpcResult,
  PreviewTrialOpportunityCurveRpcRow,
  ResolveHeroExplorationStepRpcRow,
  StartHeroExplorationStepRpcRow,
  StartOrGetHeroExplorationRpcRow,
} from '../../types/exploration-runtime-rpc.types';
import { mapExplorationDifficultyTier } from '../../utils/exploration-definition-mappers';
import { mapTrialOpportunityCurvePreview } from '../../utils/exploration-preview-mappers';
import { mapHeroExplorationStateJson } from '../../utils/exploration-runtime-json-mappers';
import {
  explorationChallengeCompletionWorkflowResult,
  firstResolveHeroExplorationStepRow,
  firstAutoResolveHeroExplorationChallengeAttemptRow,
  firstCompleteHeroExplorationChallengeAttemptRow,
  firstStartHeroExplorationStepRow,
  firstStartOrGetHeroExplorationRow,
  explorationStepResolutionWorkflowResult,
  mapAutoResolveHeroExplorationChallengeResult,
  mapCompleteHeroExplorationChallengeResult,
  mapResolveHeroExplorationStepResult,
  toAutoResolveHeroExplorationChallengeAttemptRpcArgs,
  toCompleteHeroExplorationChallengeAttemptRpcArgs,
  toGetHeroExplorationStateRpcArgs,
  toPreviewTrialOpportunityCurveRpcArgs,
  toResolveHeroExplorationStepRpcArgs,
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

  resolveHeroExplorationStep(input: {
    heroId: string;
    difficultyKey: string;
    stepId: string;
  }): Observable<HeroExplorationStepResolutionWorkflowResult> {
    return this.backend
      .rpc<ResolveHeroExplorationStepRpcRow[]>(
        RPC.resolve_hero_exploration_step,
        toResolveHeroExplorationStepRpcArgs(input),
      )
      .pipe(
        map(firstResolveHeroExplorationStepRow),
        switchMap((row) =>
          this.getHeroExplorationState({
            heroId: input.heroId,
            difficultyKey: input.difficultyKey,
          }).pipe(
            map((state) =>
              explorationStepResolutionWorkflowResult(
                mapResolveHeroExplorationStepResult(row),
                state,
              ),
            ),
          ),
        ),
      );
  }

  completeHeroExplorationChallengeAttempt(input: {
    heroId: string;
    difficultyKey: string;
    challengeAttemptId: string;
    success: boolean;
    completionMode?: string | null;
    score?: number | null;
    performanceRating?: string | null;
    requestId?: string | null;
  }): Observable<HeroExplorationChallengeCompletionWorkflowResult> {
    return this.backend
      .rpc<CompleteHeroExplorationChallengeAttemptRpcRow[]>(
        RPC.complete_hero_exploration_challenge_attempt,
        toCompleteHeroExplorationChallengeAttemptRpcArgs(input),
      )
      .pipe(
        map(firstCompleteHeroExplorationChallengeAttemptRow),
        switchMap((row) =>
          this.getHeroExplorationState({
            heroId: input.heroId,
            difficultyKey: input.difficultyKey,
          }).pipe(
            map((state) =>
              explorationChallengeCompletionWorkflowResult(
                mapCompleteHeroExplorationChallengeResult(row),
                state,
              ),
            ),
          ),
        ),
      );
  }

  autoResolveHeroExplorationChallengeAttempt(input: {
    heroId: string;
    difficultyKey: string;
    challengeAttemptId: string;
    requestId?: string | null;
  }): Observable<HeroExplorationChallengeCompletionWorkflowResult> {
    return this.backend
      .rpc<AutoResolveHeroExplorationChallengeAttemptRpcRow[]>(
        RPC.auto_resolve_hero_exploration_challenge_attempt,
        toAutoResolveHeroExplorationChallengeAttemptRpcArgs(input),
      )
      .pipe(
        map(firstAutoResolveHeroExplorationChallengeAttemptRow),
        switchMap((row) =>
          this.getHeroExplorationState({
            heroId: input.heroId,
            difficultyKey: input.difficultyKey,
          }).pipe(
            map((state) =>
              explorationChallengeCompletionWorkflowResult(
                mapAutoResolveHeroExplorationChallengeResult(row),
                state,
              ),
            ),
          ),
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
