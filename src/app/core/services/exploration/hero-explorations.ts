import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { ExplorationDifficultyTierReadModel } from '../../domain/exploration/exploration-definition.model';
import {
  HeroExplorationChallengeCompletionWorkflowResult,
  HeroDailyActionCounterReadModel,
  HeroPendingCombatEffectStateReadModel,
  HeroExplorationStateReadModel,
  HeroExplorationStepResolutionWorkflowResult,
} from '../../domain/exploration/exploration-runtime.model';
import {
  HeroExplorationDifficultyCardPreview,
  TrialOpportunityCurvePreview,
} from '../../domain/exploration/exploration-preview.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import {
  AutoResolveHeroExplorationChallengeAttemptRpcRow,
  CompleteHeroExplorationChallengeAttemptRpcRow,
  GetHeroExplorationDifficultyCardPreviewsRpcRow,
  GetHeroExplorationStateRpcResult,
  GetHeroPendingCombatEffectStateRpcRow,
  PreviewTrialOpportunityCurveRpcRow,
  ResolveHeroExplorationStepRpcRow,
  StartHeroExplorationStepRpcRow,
  StartOrGetHeroExplorationRpcRow,
} from '../../types/exploration-runtime-rpc.types';
import { mapExplorationDifficultyTier } from '../../utils/exploration-definition-mappers';
import {
  mapHeroExplorationDifficultyCardPreview,
  mapTrialOpportunityCurvePreview,
} from '../../utils/exploration-preview-mappers';
import { mapHeroExplorationStateJson } from '../../utils/exploration-runtime-json-mappers';
import {
  mapHeroDailyActionCounter,
  mapHeroPendingCombatEffectState,
} from '../../utils/exploration-runtime-mappers';
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
  toGetHeroExplorationDifficultyCardPreviewsRpcArgs,
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

  getHeroExplorationDifficultyCardPreviews(input: {
    heroId: string;
    stepsToPreview?: number | null;
  }): Observable<HeroExplorationDifficultyCardPreview[]> {
    return this.backend
      .rpc<GetHeroExplorationDifficultyCardPreviewsRpcRow[]>(
        RPC.get_hero_exploration_difficulty_card_previews,
        toGetHeroExplorationDifficultyCardPreviewsRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapHeroExplorationDifficultyCardPreview)));
  }

  getHeroPendingCombatEffectState(
    heroId: string,
  ): Observable<HeroPendingCombatEffectStateReadModel[]> {
    return this.backend
      .rpc<GetHeroPendingCombatEffectStateRpcRow[]>(
        RPC.get_hero_pending_combat_effect_state,
        { p_hero_id: heroId },
      )
      .pipe(map((rows) => rows.map(mapHeroPendingCombatEffectState)));
  }

  getHeroTrialCounter(input: {
    heroId: string;
    serverId: string;
  }): Observable<HeroDailyActionCounterReadModel | null> {
    return this.backend
      .getAll<Row<'hero_daily_action_counters'>>({
        table: TABLES.hero_daily_action_counters,
        filters: {
          heroId: { operator: FilterOperator.EQ, value: input.heroId },
          serverId: { operator: FilterOperator.EQ, value: input.serverId },
          actionKind: { operator: FilterOperator.EQ, value: 'trial' },
        },
        orderBy: [
          { column: 'actionDate', ascending: false },
          { column: 'updatedAt', ascending: false },
        ],
        range: { from: 0, to: 0 },
        camelCase: false,
      })
      .pipe(map((rows) => rows[0] ? mapHeroDailyActionCounter(rows[0]) : null));
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
    edgeId: string | null;
    stepKind: string;
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
