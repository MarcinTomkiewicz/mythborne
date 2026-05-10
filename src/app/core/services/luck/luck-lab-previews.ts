import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CombatLuckPreview,
  LuckChancePreview,
  LuckGeneratedItemPreview,
  LuckInfluencePreview,
  LuckLabDropDistributionSummary,
  LuckLabInputState,
  LuckLabPreviewResult,
  LuckRewardRangePreview,
  LuckRngSurface,
  TrialPowerRead,
} from '../../domain/luck/luck.model';
import {
  PreviewChallengeAutoResolveSuccessChanceLuckRpcArgs,
  PreviewChallengeAutoResolveSuccessChanceLuckRpcRow,
  PreviewCombatLuckFormulaContextRpcRow,
  PreviewExplorationLuckRngChainRpcRow,
  PreviewNonTrialEncounterChanceLuckRpcRow,
  PreviewRewardGeneratedItemLuckRpcRow,
  PreviewRewardProfileLuckRpcRow,
  PreviewTrialManifestationChanceLuckRpcRow,
  PreviewTrialOpportunityCurveLuckRpcRow,
} from '../../types/luck-rpc.types';
import {
  createUnsupportedDropDistributionSummary,
  mapLuckLabPreviewResult,
} from '../../utils/luck-lab-mappers';
import {
  mapChallengeAutoResolveChancePreview,
  mapCombatLuckPreview,
  mapExplorationLuckRngChainPreview,
  mapNonTrialEncounterChancePreview,
  mapRewardGeneratedItemLuckPreview,
  mapRewardProfileLuckPreview,
  mapTrialManifestationChancePreview,
  mapTrialOpportunityChancePreview,
} from '../../utils/luck-preview-mappers';
import { Backend } from '../backend/backend';
import {
  toChallengeAutoResolveArgs,
  toCombatArgs,
  toExplorationRngChainArgs,
  toGeneratedItemArgs,
  toNonTrialEncounterArgs,
  toRewardProfileArgs,
  toTrialManifestationArgs,
  toTrialOpportunityArgs,
} from './luck-lab-rpc';
import { LuckRngSurfaces } from './luck-rng-surfaces';
import { LuckTrialPower } from './luck-trial-power';

@Injectable({ providedIn: 'root' })
export class LuckLabPreviews {
  private readonly backend = inject(Backend);
  private readonly surfaces = inject(LuckRngSurfaces);
  private readonly trialPower = inject(LuckTrialPower);

  getSurfaces(): Observable<LuckRngSurface[]> {
    return this.surfaces.getSurfaces();
  }

  previewLuckInfluence(input: LuckLabInputState): Observable<LuckInfluencePreview[]> {
    return this.trialPower.previewTrialPower(input).pipe(
      map((rows) => rows.map((row) => ({
        luckValue: row.luckValue,
        luckInfluence: row.luckInfluence,
        formula: row.luckInfluenceFormula,
        explanation: row.explanation,
      }))),
    );
  }

  previewTrialPower(input: LuckLabInputState): Observable<TrialPowerRead[]> {
    return this.trialPower.previewTrialPower(input);
  }

  previewTrialOpportunity(input: LuckLabInputState): Observable<LuckChancePreview[]> {
    return this.backend
      .rpc<PreviewTrialOpportunityCurveLuckRpcRow[]>(
        RPC.preview_trial_opportunity_curve,
        toTrialOpportunityArgs(input),
      )
      .pipe(map((rows) => rows.map(mapTrialOpportunityChancePreview)));
  }

  previewTrialManifestation(input: LuckLabInputState): Observable<LuckChancePreview[]> {
    return this.backend
      .rpc<PreviewTrialManifestationChanceLuckRpcRow[]>(
        RPC.preview_trial_manifestation_chance,
        toTrialManifestationArgs(input),
      )
      .pipe(map((rows) => rows.map(mapTrialManifestationChancePreview)));
  }

  previewChallengeAutoResolve(input: LuckLabInputState): Observable<LuckChancePreview[]> {
    return this.backend
      .rpc<PreviewChallengeAutoResolveSuccessChanceLuckRpcRow[]>(
        RPC.preview_challenge_auto_resolve_success_chance,
        toChallengeAutoResolveArgs(input),
      )
      .pipe(map((rows) => rows.map(mapChallengeAutoResolveChancePreview)));
  }

  previewNonTrialEncounter(input: LuckLabInputState): Observable<LuckChancePreview[]> {
    return this.backend
      .rpc<PreviewNonTrialEncounterChanceLuckRpcRow[]>(
        RPC.preview_non_trial_encounter_chance,
        toNonTrialEncounterArgs(input),
      )
      .pipe(map((rows) => rows.map(mapNonTrialEncounterChancePreview)));
  }

  previewExplorationRngChain(input: LuckLabInputState): Observable<LuckChancePreview[]> {
    return this.backend
      .rpc<PreviewExplorationLuckRngChainRpcRow[]>(
        RPC.preview_exploration_luck_rng_chain,
        toExplorationRngChainArgs(input),
      )
      .pipe(map((rows) => rows.map(mapExplorationLuckRngChainPreview)));
  }

  previewCombat(input: LuckLabInputState): Observable<CombatLuckPreview[]> {
    return this.backend
      .rpc<PreviewCombatLuckFormulaContextRpcRow[]>(
        RPC.preview_combat_luck_formula_context,
        toCombatArgs(input),
      )
      .pipe(map((rows) => rows.map(mapCombatLuckPreview)));
  }

  previewRewardProfile(input: LuckLabInputState): Observable<LuckRewardRangePreview[]> {
    return this.backend
      .rpc<PreviewRewardProfileLuckRpcRow[]>(
        RPC.preview_reward_profile_luck,
        toRewardProfileArgs(input),
      )
      .pipe(map((rows) => rows.map(mapRewardProfileLuckPreview)));
  }

  previewGeneratedItem(input: LuckLabInputState): Observable<LuckGeneratedItemPreview[]> {
    return this.backend
      .rpc<PreviewRewardGeneratedItemLuckRpcRow[]>(
        RPC.preview_reward_generated_item_luck,
        toGeneratedItemArgs(input),
      )
      .pipe(map((rows) => rows.map(mapRewardGeneratedItemLuckPreview)));
  }

  previewDropDistribution(): Observable<LuckLabDropDistributionSummary> {
    return of(undefined).pipe(map(() => createUnsupportedDropDistributionSummary()));
  }

  previewAll(input: LuckLabInputState): Observable<LuckLabPreviewResult> {
    return forkJoin({
      surfaces: this.getSurfaces(),
      trialPowerRows: this.previewTrialPower(input),
      trialOpportunity: this.previewTrialOpportunity(input),
      trialManifestation: this.previewTrialManifestation(input),
      autoResolve: this.previewChallengeAutoResolve(input),
      nonTrialEncounter: this.previewNonTrialEncounter(input),
      explorationChain: this.previewExplorationRngChain(input),
      combatRows: this.previewCombat(input),
      rewardRangePreviews: this.previewRewardProfile(input),
      generatedItemPreviews: this.previewGeneratedItem(input),
      dropDistribution: this.previewDropDistribution(),
    }).pipe(
      map((result) =>
        mapLuckLabPreviewResult({
          input,
          surfaces: result.surfaces,
          luckInfluence: result.trialPowerRows[0]
            ? {
                luckValue: result.trialPowerRows[0].luckValue,
                luckInfluence: result.trialPowerRows[0].luckInfluence,
                formula: result.trialPowerRows[0].luckInfluenceFormula,
                explanation: result.trialPowerRows[0].explanation,
              }
            : null,
          trialPower: result.trialPowerRows[0] ?? null,
          chancePreviews: [
            ...result.trialOpportunity,
            ...result.trialManifestation,
            ...result.autoResolve,
            ...result.nonTrialEncounter,
            ...result.explorationChain,
          ],
          combatPreview: result.combatRows[0] ?? null,
          rewardRangePreviews: result.rewardRangePreviews,
          generatedItemPreviews: result.generatedItemPreviews,
          dropDistribution: result.dropDistribution,
        }),
      ),
    );
  }
}
