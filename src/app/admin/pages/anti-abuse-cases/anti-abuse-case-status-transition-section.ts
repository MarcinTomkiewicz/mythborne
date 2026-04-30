import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ANTI_ABUSE_CASE_STATUS_FALLBACK_LABELS } from '../../../core/constants/anti-abuse-display.const';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseDecision,
  AntiAbuseCaseStatus,
} from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { AntiAbuseCaseStatusTransitionForm } from '../../../core/types/forms/anti-abuse-case-status-form.types';
import { SelectOption } from '../../../core/types/select-option.types';
import { trimText } from '../../../core/utils/normalize-text';

@Component({
  selector: 'app-anti-abuse-case-status-transition-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './anti-abuse-case-status-transition-section.html',
})
export class AntiAbuseCaseStatusTransitionSection {
  private readonly decisions = inject(AntiAbuseDecisions);
  private readonly destroyRef = inject(DestroyRef);
  private activeCaseId: string | null = null;

  readonly caseItem = input.required<AntiAbuseCaseReadModel>();
  readonly decisionSaved = output<AntiAbuseCaseDecision>();
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly statusOptions: SelectOption<AntiAbuseCaseStatus>[] = Object.entries(
    ANTI_ABUSE_CASE_STATUS_FALLBACK_LABELS,
  ).map(([value, label]) => ({ label, value: value as AntiAbuseCaseStatus }));
  readonly form: AntiAbuseCaseStatusTransitionForm = new FormGroup({
    status: new FormControl<AntiAbuseCaseStatus | null>(null, Validators.required),
    statusReason: new FormControl<string | null>(null, Validators.required),
  });

  constructor() {
    effect(() => {
      const item = this.caseItem();
      const isNewCaseContext = item.id !== this.activeCaseId;

      this.form.controls.status.setValue(item.status, { emitEvent: false });

      if (isNewCaseContext) {
        this.activeCaseId = item.id;
        this.form.controls.statusReason.setValue(null, { emitEvent: false });
        this.error.set(null);
        this.successMessage.set(null);
      }
    });
  }

  submit(): void {
    const item = this.caseItem();
    const status = this.form.controls.status.value;
    const statusReason = trimText(this.form.controls.statusReason.value);

    this.error.set(null);
    this.successMessage.set(null);

    if (!status || !statusReason) {
      this.form.markAllAsTouched();
      this.error.set('Status and status reason are required.');
      return;
    }

    this.isSaving.set(true);

    this.decisions
      .setCaseDecision({
        caseId: item.id,
        status,
        statusReason,
      })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (decision) => {
          if (this.caseItem().id !== item.id) {
            return;
          }

          this.successMessage.set('Case status updated.');
          this.form.controls.statusReason.setValue(null);
          this.decisionSaved.emit(decision);
        },
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error ? error.message : 'Failed to update case status.',
          ),
      });
  }
}
