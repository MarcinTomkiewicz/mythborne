import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ANTI_ABUSE_SANCTION_STATUS_OPTIONS } from '../../../core/constants/anti-abuse-display.const';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseSanctionStatus,
  CharacterPointPenaltyDecision,
} from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { AntiAbuseCharacterPointPenaltyStatusForm } from '../../../core/types/forms/anti-abuse-character-point-penalty-status-form.types';
import { SelectOption } from '../../../core/types/select-option.types';
import { displayValue } from '../../../core/utils/display-value';
import { trimText } from '../../../core/utils/normalize-text';

const PENALTY_REASON_PREVIEW_LENGTH = 48;

@Component({
  selector: 'app-anti-abuse-case-penalty-status-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './anti-abuse-case-penalty-status-section.html',
})
export class AntiAbuseCasePenaltyStatusSection {
  private readonly decisions = inject(AntiAbuseDecisions);
  private readonly destroyRef = inject(DestroyRef);
  private activeContextKey: string | null = null;
  private activePenaltyId: string | null = null;

  readonly caseItem = input.required<AntiAbuseCaseReadModel>();
  readonly penalties = input.required<CharacterPointPenaltyDecision[]>();
  readonly penaltyStatusSaved = output<CharacterPointPenaltyDecision>();
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly statusOptions = ANTI_ABUSE_SANCTION_STATUS_OPTIONS;
  readonly form: AntiAbuseCharacterPointPenaltyStatusForm = new FormGroup({
    penaltyId: new FormControl<string | null>(null, Validators.required),
    status: new FormControl<AntiAbuseSanctionStatus | null>(null, Validators.required),
    statusReason: new FormControl<string | null>(null, Validators.required),
  });

  constructor() {
    effect(() => {
      const caseItem = this.caseItem();
      const contextKey = `${caseItem.serverId}:${caseItem.id}`;

      if (contextKey !== this.activeContextKey) {
        this.activeContextKey = contextKey;
        this.resetForContext();
      }

      this.syncSelectedPenalty();
    });
  }

  selectedPenalty(): CharacterPointPenaltyDecision | null {
    const penaltyId = this.form.controls.penaltyId.value;
    return this.penalties().find((entry) => entry.id === penaltyId) ?? null;
  }

  penaltyOptions(): SelectOption<string>[] {
    return this.penalties().map((penalty) => ({
      value: penalty.id,
      label: penaltyOptionLabel(penalty),
    }));
  }

  onPenaltyChange(): void {
    this.syncSelectedPenalty();
  }

  submit(): void {
    const caseItem = this.caseItem();
    const penalty = this.selectedPenalty();
    const status = this.form.controls.status.value;
    const statusReason = trimText(this.form.controls.statusReason.value);

    this.error.set(null);
    this.successMessage.set(null);

    if (!penalty || !status || !statusReason) {
      this.form.markAllAsTouched();
      this.error.set('Penalty, status and status reason are required.');
      return;
    }

    this.isSaving.set(true);

    this.decisions
      .setCharacterPointPenaltyStatus({
        penaltyId: penalty.id,
        status,
        statusReason,
      })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedPenalty) => {
          if (!this.isCurrentContext(caseItem, penalty.id, updatedPenalty)) {
            return;
          }

          this.successMessage.set('Character Point penalty status updated.');
          this.form.controls.statusReason.setValue(null);
          this.penaltyStatusSaved.emit(updatedPenalty);
        },
        error: (error: unknown) => {
          if (!this.isCurrentContextForRequest(caseItem, penalty.id)) {
            return;
          }

          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to update Character Point penalty status.',
          );
        },
      });
  }

  private syncSelectedPenalty(): void {
    const penalties = this.penalties();
    const current = this.selectedPenalty();
    const next = current ?? penalties[0] ?? null;

    if (!next) {
      this.form.controls.penaltyId.setValue(null, { emitEvent: false });
      this.form.controls.status.setValue(null, { emitEvent: false });
      this.activePenaltyId = null;
      return;
    }

    const previousPenaltyId = this.activePenaltyId;

    if (this.form.controls.penaltyId.value !== next.id) {
      this.form.controls.penaltyId.setValue(next.id, { emitEvent: false });
    }

    this.form.controls.status.setValue(next.status, { emitEvent: false });

    if (previousPenaltyId !== next.id) {
      this.activePenaltyId = next.id;
      this.form.controls.statusReason.setValue(null, { emitEvent: false });
      this.error.set(null);
      this.successMessage.set(null);
    }
  }

  private resetForContext(): void {
    this.form.reset();
    this.activePenaltyId = null;
    this.error.set(null);
    this.successMessage.set(null);
  }

  private isCurrentContext(
    caseItem: AntiAbuseCaseReadModel,
    requestedPenaltyId: string,
    updatedPenalty: CharacterPointPenaltyDecision,
  ): boolean {
    return (
      this.isCurrentContextForRequest(caseItem, requestedPenaltyId) &&
      updatedPenalty.caseId === this.caseItem().id &&
      updatedPenalty.serverId === this.caseItem().serverId &&
      updatedPenalty.id === requestedPenaltyId
    );
  }

  private isCurrentContextForRequest(
    caseItem: AntiAbuseCaseReadModel,
    requestedPenaltyId: string,
  ): boolean {
    const currentCase = this.caseItem();

    return (
      currentCase.id === caseItem.id &&
      currentCase.serverId === caseItem.serverId &&
      this.form.controls.penaltyId.value === requestedPenaltyId &&
      this.penalties().some((penalty) => penalty.id === requestedPenaltyId)
    );
  }
}

function penaltyOptionLabel(penalty: CharacterPointPenaltyDecision): string {
  return [
    displayValue(penalty.heroId),
    penalty.status,
    `${penalty.remainingAmount}/${penalty.totalAmount} CP remaining`,
    shortReason(penalty.reason),
  ].join(' - ');
}

function shortReason(reason: string): string {
  const normalized = trimText(reason);

  return normalized.length > PENALTY_REASON_PREVIEW_LENGTH
    ? `${normalized.slice(0, PENALTY_REASON_PREVIEW_LENGTH)}...`
    : normalized;
}
