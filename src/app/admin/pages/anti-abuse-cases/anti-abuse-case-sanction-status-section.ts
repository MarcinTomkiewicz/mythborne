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
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionStatus,
} from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { AntiAbuseSanctionStatusForm } from '../../../core/types/forms/anti-abuse-sanction-status-form.types';
import { SelectOption } from '../../../core/types/select-option.types';
import { displayValue } from '../../../core/utils/display-value';
import { trimText } from '../../../core/utils/normalize-text';

const SANCTION_REASON_PREVIEW_LENGTH = 48;

@Component({
  selector: 'app-anti-abuse-case-sanction-status-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './anti-abuse-case-sanction-status-section.html',
})
export class AntiAbuseCaseSanctionStatusSection {
  private readonly decisions = inject(AntiAbuseDecisions);
  private readonly destroyRef = inject(DestroyRef);
  private activeContextKey: string | null = null;
  private activeSanctionId: string | null = null;

  readonly caseItem = input.required<AntiAbuseCaseReadModel>();
  readonly sanctions = input.required<AntiAbuseSanctionDecision[]>();
  readonly sanctionStatusSaved = output<AntiAbuseSanctionDecision>();
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly statusOptions = ANTI_ABUSE_SANCTION_STATUS_OPTIONS;
  readonly form: AntiAbuseSanctionStatusForm = new FormGroup({
    sanctionId: new FormControl<string | null>(null, Validators.required),
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

      this.syncSelectedSanction();
    });
  }

  selectedSanction(): AntiAbuseSanctionDecision | null {
    const sanctionId = this.form.controls.sanctionId.value;
    return this.sanctions().find((entry) => entry.id === sanctionId) ?? null;
  }

  sanctionOptions(): SelectOption<string>[] {
    return this.sanctions().map((sanction) => ({
      value: sanction.id,
      label: sanctionOptionLabel(sanction),
    }));
  }

  onSanctionChange(): void {
    this.syncSelectedSanction();
  }

  submit(): void {
    const caseItem = this.caseItem();
    const sanction = this.selectedSanction();
    const status = this.form.controls.status.value;
    const statusReason = trimText(this.form.controls.statusReason.value);

    this.error.set(null);
    this.successMessage.set(null);

    if (!sanction || !status || !statusReason) {
      this.form.markAllAsTouched();
      this.error.set('Sanction, status and status reason are required.');
      return;
    }

    this.isSaving.set(true);

    this.decisions
      .setSanctionStatus({
        sanctionId: sanction.id,
        status,
        statusReason,
      })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedSanction) => {
          if (!this.isCurrentContext(caseItem, sanction.id, updatedSanction)) {
            return;
          }

          this.successMessage.set('Sanction status updated.');
          this.form.controls.statusReason.setValue(null);
          this.sanctionStatusSaved.emit(updatedSanction);
        },
        error: (error: unknown) => {
          if (!this.isCurrentContextForRequest(caseItem, sanction.id)) {
            return;
          }

          this.error.set(
            error instanceof Error ? error.message : 'Failed to update sanction status.',
          );
        },
      });
  }

  private syncSelectedSanction(): void {
    const sanctions = this.sanctions();
    const current = this.selectedSanction();
    const next = current ?? sanctions[0] ?? null;

    if (!next) {
      this.form.controls.sanctionId.setValue(null, { emitEvent: false });
      this.form.controls.status.setValue(null, { emitEvent: false });
      this.activeSanctionId = null;
      return;
    }

    const previousSanctionId = this.activeSanctionId;

    if (this.form.controls.sanctionId.value !== next.id) {
      this.form.controls.sanctionId.setValue(next.id, { emitEvent: false });
    }

    this.form.controls.status.setValue(next.status, { emitEvent: false });

    if (previousSanctionId !== next.id) {
      this.activeSanctionId = next.id;
      this.form.controls.statusReason.setValue(null, { emitEvent: false });
      this.error.set(null);
      this.successMessage.set(null);
    }
  }

  private resetForContext(): void {
    this.form.reset();
    this.activeSanctionId = null;
    this.error.set(null);
    this.successMessage.set(null);
  }

  private isCurrentContext(
    caseItem: AntiAbuseCaseReadModel,
    requestedSanctionId: string,
    updatedSanction: AntiAbuseSanctionDecision,
  ): boolean {
    return (
      this.isCurrentContextForRequest(caseItem, requestedSanctionId) &&
      updatedSanction.caseId === this.caseItem().id &&
      updatedSanction.id === requestedSanctionId
    );
  }

  private isCurrentContextForRequest(
    caseItem: AntiAbuseCaseReadModel,
    requestedSanctionId: string,
  ): boolean {
    const currentCase = this.caseItem();

    return (
      currentCase.id === caseItem.id &&
      currentCase.serverId === caseItem.serverId &&
      this.form.controls.sanctionId.value === requestedSanctionId &&
      this.sanctions().some((sanction) => sanction.id === requestedSanctionId)
    );
  }
}

function sanctionOptionLabel(sanction: AntiAbuseSanctionDecision): string {
  const target = displayValue(sanction.targetHeroId ?? sanction.targetUserId);
  return [
    sanction.sanctionTypeKey,
    sanction.status,
    target,
    shortReason(sanction.reason),
  ].join(' · ');
}

function shortReason(reason: string): string {
  const normalized = trimText(reason);

  return normalized.length > SANCTION_REASON_PREVIEW_LENGTH
    ? `${normalized.slice(0, SANCTION_REASON_PREVIEW_LENGTH)}...`
    : normalized;
}
