import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  AddHeroRemainingActionsInput,
  AddHeroRemainingActionsResult,
  ExplorationDebugScopeInput,
  ForceCompleteHeroExplorationChallengeAttemptInput,
  ForceCompleteHeroExplorationChallengeAttemptResult,
  ResetHeroExplorationInput,
  ResetHeroExplorationResult,
  SetNextHeroExplorationOutcomeOverrideInput,
  SetNextHeroExplorationOutcomeOverrideResult,
  SkipHeroExplorationStepTimerInput,
  SkipHeroExplorationStepTimerResult,
  TestGrantRewardProfileToHeroInput,
  TestGrantRewardProfileToHeroResult,
} from '../../domain/exploration/exploration-debug.model';
import { HeroExplorationDebugStateReadModel } from '../../domain/exploration/exploration-runtime.model';
import {
  AddHeroRemainingActionsRpcRow,
  ForceCompleteHeroExplorationChallengeAttemptRpcRow,
  GetHeroExplorationDebugStateRpcResult,
  ResetHeroExplorationRpcResult,
  SetNextHeroExplorationOutcomeOverrideRpcRow,
  SkipHeroExplorationStepTimerRpcRow,
  TestGrantRewardProfileToHeroRpcRow,
} from '../../types/exploration-debug-rpc.types';
import {
  firstAddHeroRemainingActionsRow,
  firstForceCompleteHeroExplorationChallengeAttemptRow,
  firstSetNextHeroExplorationOutcomeOverrideRow,
  firstSkipHeroExplorationStepTimerRow,
  firstTestGrantRewardProfileToHeroRow,
  mapAddHeroRemainingActionsResult,
  mapForceCompleteHeroExplorationChallengeAttemptResult,
  mapResetHeroExplorationResult,
  mapSetNextHeroExplorationOutcomeOverrideResult,
  mapSkipHeroExplorationStepTimerResult,
  mapTestGrantRewardProfileToHeroResult,
  toAddHeroRemainingActionsRpcArgs,
  toForceCompleteHeroExplorationChallengeAttemptRpcArgs,
  toGetHeroExplorationDebugStateRpcArgs,
  toResetHeroExplorationRpcArgs,
  toSetNextHeroExplorationOutcomeOverrideRpcArgs,
  toSkipHeroExplorationStepTimerRpcArgs,
  toTestGrantRewardProfileToHeroRpcArgs,
} from '../../utils/exploration-debug-rpc';
import { mapHeroExplorationDebugStateJson } from '../../utils/exploration-runtime-json-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class HeroExplorationDebug {
  private readonly backend = inject(Backend);

  getDebugState(
    input: ExplorationDebugScopeInput,
  ): Observable<HeroExplorationDebugStateReadModel> {
    return this.backend
      .rpc<GetHeroExplorationDebugStateRpcResult>(
        RPC.get_hero_exploration_debug_state,
        toGetHeroExplorationDebugStateRpcArgs(input),
      )
      .pipe(map(mapHeroExplorationDebugStateJson));
  }

  addRemainingActions(
    input: AddHeroRemainingActionsInput,
  ): Observable<AddHeroRemainingActionsResult> {
    return this.backend
      .rpc<AddHeroRemainingActionsRpcRow[]>(
        RPC.add_hero_remaining_actions,
        toAddHeroRemainingActionsRpcArgs(input),
      )
      .pipe(map(firstAddHeroRemainingActionsRow), map(mapAddHeroRemainingActionsResult));
  }

  resetExploration(
    input: ResetHeroExplorationInput,
  ): Observable<ResetHeroExplorationResult> {
    return this.backend
      .rpc<ResetHeroExplorationRpcResult>(
        RPC.reset_hero_exploration,
        toResetHeroExplorationRpcArgs(input),
      )
      .pipe(map(mapResetHeroExplorationResult));
  }

  skipStepTimer(
    input: SkipHeroExplorationStepTimerInput,
  ): Observable<SkipHeroExplorationStepTimerResult> {
    return this.backend
      .rpc<SkipHeroExplorationStepTimerRpcRow[]>(
        RPC.skip_hero_exploration_step_timer,
        toSkipHeroExplorationStepTimerRpcArgs(input),
      )
      .pipe(
        map(firstSkipHeroExplorationStepTimerRow),
        map(mapSkipHeroExplorationStepTimerResult),
      );
  }

  testGrantRewardProfileToHero(
    input: TestGrantRewardProfileToHeroInput,
  ): Observable<TestGrantRewardProfileToHeroResult> {
    return this.backend
      .rpc<TestGrantRewardProfileToHeroRpcRow[]>(
        RPC.test_grant_reward_profile_to_hero,
        toTestGrantRewardProfileToHeroRpcArgs(input),
      )
      .pipe(
        map(firstTestGrantRewardProfileToHeroRow),
        map(mapTestGrantRewardProfileToHeroResult),
      );
  }

  setNextOutcomeOverride(
    input: SetNextHeroExplorationOutcomeOverrideInput,
  ): Observable<SetNextHeroExplorationOutcomeOverrideResult> {
    return this.backend
      .rpc<SetNextHeroExplorationOutcomeOverrideRpcRow[]>(
        RPC.set_next_hero_exploration_outcome_override,
        toSetNextHeroExplorationOutcomeOverrideRpcArgs(input),
      )
      .pipe(
        map(firstSetNextHeroExplorationOutcomeOverrideRow),
        map(mapSetNextHeroExplorationOutcomeOverrideResult),
      );
  }

  forceCompleteChallengeAttempt(
    input: ForceCompleteHeroExplorationChallengeAttemptInput,
  ): Observable<ForceCompleteHeroExplorationChallengeAttemptResult> {
    return this.backend
      .rpc<ForceCompleteHeroExplorationChallengeAttemptRpcRow[]>(
        RPC.force_complete_hero_exploration_challenge_attempt,
        toForceCompleteHeroExplorationChallengeAttemptRpcArgs(input),
      )
      .pipe(
        map(firstForceCompleteHeroExplorationChallengeAttemptRow),
        map(mapForceCompleteHeroExplorationChallengeAttemptResult),
      );
  }
}
