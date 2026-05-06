import { Component, computed, input, output } from '@angular/core';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { PvpTargetCandidate } from '../../../core/domain/pvp/pvp.model';
import {
  PvpEligibilityDisplay,
  pvpEligibilityDisplay,
} from '../../../core/utils/pvp-eligibility-display';

@Component({
  selector: 'app-vicinity-pvp-target-card',
  standalone: true,
  templateUrl: './vicinity-pvp-target-card.html',
})
export class VicinityPvpTargetCard {
  readonly candidate = input.required<PvpTargetCandidate>();
  readonly metadataEntries = input<readonly UiMetadataEntryReadModel[]>([]);
  readonly actionPending = input(false);
  readonly attackPending = input(false);
  readonly spyPending = input(false);
  readonly startAttack = output<PvpTargetCandidate>();
  readonly startSpy = output<PvpTargetCandidate>();

  readonly attackDisplay = computed(() =>
    pvpEligibilityDisplay({
      actionKind: 'attack',
      eligibility: this.candidate().attackEligibility,
      targetLevel: this.candidate().targetLevel,
      metadataEntries: this.metadataEntries(),
    }),
  );
  readonly spyDisplay = computed(() =>
    pvpEligibilityDisplay({
      actionKind: 'spy',
      eligibility: this.candidate().spyEligibility,
      targetLevel: this.candidate().targetLevel,
      metadataEntries: this.metadataEntries(),
    }),
  );

  durationLabel(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  protectionLabel(candidate: PvpTargetCandidate): string {
    if (!candidate.underProtection) {
      return 'No active protection';
    }

    return candidate.protectionExpiresAt
      ? `Protected until ${new Date(candidate.protectionExpiresAt).toLocaleString()}`
      : 'Protected';
  }

  eligibilityBadgeClass(canStart: boolean): string {
    return canStart
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--muted';
  }

  hasReason(display: PvpEligibilityDisplay): boolean {
    return display.reasonLabel !== null;
  }

  canStartSpy(): boolean {
    return this.candidate().spyEligibility.canStart
      && !this.actionPending()
      && !this.spyPending();
  }

  canStartAttack(): boolean {
    return this.candidate().attackEligibility.canStart
      && !this.actionPending()
      && !this.attackPending();
  }

  onStartAttack(): void {
    if (!this.canStartAttack()) {
      return;
    }

    this.startAttack.emit(this.candidate());
  }

  onStartSpy(): void {
    if (!this.canStartSpy()) {
      return;
    }

    this.startSpy.emit(this.candidate());
  }
}
