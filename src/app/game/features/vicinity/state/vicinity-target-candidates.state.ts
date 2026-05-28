import { computed, effect, inject, Injectable } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import {
  PvpStartActionKind,
  PvpVisibleAddressTargetOverlayInput,
} from '../../../../core/types/vicinity.types';
import { VicinityPvpActionsState } from './vicinity-pvp-actions.state';
import { VicinityRangeState } from './vicinity-range.state';
import { VicinityTargetSearchState } from './vicinity-target-search.state';
import { VicinityVisibleTargetOverlayState } from './vicinity-visible-target-overlay.state';

@Injectable()
export class VicinityTargetCandidatesState {
  private readonly actions = inject(VicinityPvpActionsState);
  private readonly overlay = inject(VicinityVisibleTargetOverlayState);
  private readonly range = inject(VicinityRangeState);
  private readonly search = inject(VicinityTargetSearchState);

  readonly isLoading = computed(() => this.overlay.isLoading() || this.search.isLoading());
  readonly isVisibleOverlayLoading = this.overlay.isLoading;
  readonly visibleOverlayLoaded = this.overlay.loaded;
  readonly error = computed(() => this.overlay.error() ?? this.search.error());
  readonly actionError = this.actions.error;
  readonly actionSuccess = this.actions.success;
  readonly visibleTargets = this.overlay.targets;
  readonly districtCode = this.search.districtCode;

  constructor() {
    effect(() => {
      const range = this.range.vicinityRange();

      if (!range) {
        return;
      }

      this.loadVisibleAddressTargetOverlay({
        districtCode: range.district.districtCode,
        fromAddressNumber: range.fromAddressNumber,
        toAddressNumber: range.toAddressNumber,
      });
    });
  }

  isSpyPending(targetHeroId: string): boolean {
    return this.actions.isSpyPending(targetHeroId);
  }

  isAttackPending(targetHeroId: string): boolean {
    return this.actions.isAttackPending(targetHeroId);
  }

  startAction(candidate: PvpTargetCandidate, actionKind: PvpStartActionKind): void {
    this.actions.start({
      candidate,
      actionKind,
      refreshTargets: () => this.overlay.refresh(),
    });
  }

  canStart(candidate: PvpTargetCandidate, actionKind: PvpStartActionKind): boolean {
    return this.actions.canStart(candidate, actionKind);
  }

  loadCandidates(onLoaded?: (candidates: readonly PvpTargetCandidate[]) => void): void {
    this.search.load(onLoaded);
  }

  loadVisibleAddressTargetOverlay(input: PvpVisibleAddressTargetOverlayInput): void {
    this.overlay.load(input);
  }

  setDistrictCode(value: string | null): void {
    this.search.setDistrictCode(value);
  }

  setSearch(value: string | null): void {
    this.search.setSearch(value);
  }
}
