import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  ChallengeAutoResolveSuccessChancePreview,
  TrialManifestationChancePreview,
  TrialOpportunityCurvePreview,
  TrialOpportunitySimulation,
} from '../../domain/exploration/exploration-preview.model';
import {
  LuckGeneratedItemPreview,
  LuckRewardRangePreview,
} from '../../domain/luck/luck.model';
import {
  PreviewChallengeAutoResolveSuccessChanceRpcRow,
  PreviewTrialManifestationChanceRpcRow,
  PreviewTrialOpportunityCurveRpcRow,
  SimulateTrialOpportunityRunsRpcRow,
} from '../../types/exploration-preview-rpc.types';
import {
  PreviewRewardGeneratedItemLuckRpcRow,
  PreviewRewardProfileLuckRpcRow,
} from '../../types/luck-rpc.types';
import {
  mapChallengeAutoResolveSuccessChancePreview,
  mapTrialManifestationChancePreview,
  mapTrialOpportunityCurvePreview,
  mapTrialOpportunitySimulation,
} from '../../utils/exploration-preview-mappers';
import {
  mapRewardGeneratedItemLuckPreview,
  mapRewardProfileLuckPreview,
} from '../../utils/luck-preview-mappers';
import {
  PreviewChallengeAutoResolveSuccessChanceInput,
  PreviewRewardGeneratedItemInput,
  PreviewRewardProfileInput,
  PreviewTrialManifestationChanceInput,
  PreviewTrialOpportunityCurveInput,
  SimulateTrialOpportunityRunsInput,
  toPreviewChallengeAutoResolveSuccessChanceRpcArgs,
  toPreviewRewardGeneratedItemLuckRpcArgs,
  toPreviewRewardProfileLuckRpcArgs,
  toPreviewTrialManifestationChanceRpcArgs,
  toPreviewTrialOpportunityCurveRpcArgs,
  toSimulateTrialOpportunityRunsRpcArgs,
} from '../../utils/exploration-preview-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ExplorationLabPreviews {
  private readonly backend = inject(Backend);

  previewTrialOpportunityCurve(
    input: PreviewTrialOpportunityCurveInput,
  ): Observable<TrialOpportunityCurvePreview[]> {
    return this.backend
      .rpc<PreviewTrialOpportunityCurveRpcRow[]>(
        RPC.preview_trial_opportunity_curve,
        toPreviewTrialOpportunityCurveRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapTrialOpportunityCurvePreview)));
  }

  previewTrialManifestationChance(
    input: PreviewTrialManifestationChanceInput,
  ): Observable<TrialManifestationChancePreview[]> {
    return this.backend
      .rpc<PreviewTrialManifestationChanceRpcRow[]>(
        RPC.preview_trial_manifestation_chance,
        toPreviewTrialManifestationChanceRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapTrialManifestationChancePreview)));
  }

  previewChallengeAutoResolveSuccessChance(
    input: PreviewChallengeAutoResolveSuccessChanceInput,
  ): Observable<ChallengeAutoResolveSuccessChancePreview[]> {
    return this.backend
      .rpc<PreviewChallengeAutoResolveSuccessChanceRpcRow[]>(
        RPC.preview_challenge_auto_resolve_success_chance,
        toPreviewChallengeAutoResolveSuccessChanceRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapChallengeAutoResolveSuccessChancePreview)));
  }

  previewRewardGeneratedItem(
    input: PreviewRewardGeneratedItemInput,
  ): Observable<LuckGeneratedItemPreview[]> {
    return this.backend
      .rpc<PreviewRewardGeneratedItemLuckRpcRow[]>(
        RPC.preview_reward_generated_item_luck,
        toPreviewRewardGeneratedItemLuckRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapRewardGeneratedItemLuckPreview)));
  }

  previewRewardProfile(input: PreviewRewardProfileInput): Observable<LuckRewardRangePreview[]> {
    return this.backend
      .rpc<PreviewRewardProfileLuckRpcRow[]>(
        RPC.preview_reward_profile_luck,
        toPreviewRewardProfileLuckRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapRewardProfileLuckPreview)));
  }

  simulateTrialOpportunityRuns(
    input: SimulateTrialOpportunityRunsInput,
  ): Observable<TrialOpportunitySimulation[]> {
    return this.backend
      .rpc<SimulateTrialOpportunityRunsRpcRow[]>(
        RPC.simulate_trial_opportunity_runs,
        toSimulateTrialOpportunityRunsRpcArgs(input),
      )
      .pipe(map((rows) => rows.map(mapTrialOpportunitySimulation)));
  }
}
