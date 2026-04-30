import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ANTI_ABUSE_CASE_VERDICT_OPTIONS } from '../../../core/constants/anti-abuse-display.const';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseDecision,
  AntiAbuseCaseVerdict,
} from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { AntiAbuseCaseVerdictForm } from '../../../core/types/forms/anti-abuse-case-verdict-form.types';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';

export const ANTI_ABUSE_VERDICT_STATUS_REASON_FALLBACK = 'Verdict updated.';

@Component({
  selector: 'app-anti-abuse-case-verdict-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './anti-abuse-case-verdict-section.html',
})
export class AntiAbuseCaseVerdictSection {
  private readonly decisions = inject(AntiAbuseDecisions);
  private readonly destroyRef = inject(DestroyRef);
  private activeCaseId: string | null = null;

  readonly caseItem = input.required<AntiAbuseCaseReadModel>();
  readonly sanctionCount = input.required<number>();
  readonly decisionSaved = output<AntiAbuseCaseDecision>();
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly verdictOptions = ANTI_ABUSE_CASE_VERDICT_OPTIONS;
  readonly form: AntiAbuseCaseVerdictForm = new FormGroup({
    verdict: new FormControl<AntiAbuseCaseVerdict | null>(null, Validators.required),
    verdictReason: new FormControl<string | null>(null, Validators.required),
    sanctionRequired: new FormControl<boolean | null>(false, Validators.required),
    noSanctionReason: new FormControl<string | null>(null),
  });

  constructor() {
    effect(() => {
      const item = this.caseItem();
      const isNewCaseContext = item.id !== this.activeCaseId;

      this.form.controls.verdict.setValue(item.verdict, { emitEvent: false });
      this.form.controls.sanctionRequired.setValue(item.sanctionRequired ?? false, {
        emitEvent: false,
      });
      this.form.controls.noSanctionReason.setValue(item.noSanctionReason, {
        emitEvent: false,
      });

      if (isNewCaseContext) {
        this.activeCaseId = item.id;
        this.form.controls.verdictReason.setValue(null, { emitEvent: false });
        this.error.set(null);
        this.successMessage.set(null);
      }
    });
  }

  submit(): void {
    const item = this.caseItem();
    const verdict = this.form.controls.verdict.value;
    const verdictReason = trimText(this.form.controls.verdictReason.value);
    const sanctionRequired = this.form.controls.sanctionRequired.value === true;
    const noSanctionReason = trimToNull(this.form.controls.noSanctionReason.value);

    this.error.set(null);
    this.successMessage.set(null);

    if (!verdict || !verdictReason) {
      this.form.markAllAsTouched();
      this.error.set('Verdict and verdict reason are required.');
      return;
    }

    if (sanctionRequired && item.status === 'resolved' && this.sanctionCount() === 0) {
      this.error.set(
        'Cannot keep a resolved case marked as sanction required before a sanction exists.',
      );
      return;
    }

    this.isSaving.set(true);

    this.decisions
      .setCaseDecision({
        caseId: item.id,
        status: item.status,
        statusReason: item.statusReason ?? ANTI_ABUSE_VERDICT_STATUS_REASON_FALLBACK,
        verdict,
        verdictReason,
        sanctionRequired,
        noSanctionReason: sanctionRequired ? null : noSanctionReason,
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

          this.successMessage.set('Case verdict updated.');
          this.form.controls.verdictReason.setValue(null);
          this.decisionSaved.emit(decision);
        },
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error ? error.message : 'Failed to update case verdict.',
          ),
      });
  }
}
