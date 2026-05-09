import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { GuildEmergencyElectionCandidate } from '../../../core/domain/guild/guild-emergency-election.model';
import { GuildEmergencyElectionState } from '../../../core/services/guild/guild-emergency-election.state';
import { ToastService } from '../../../core/services/ui/toast';
import { trimRequiredValidator } from '../../../core/validators/form.validators';

@Component({
  selector: 'app-guild-emergency-election-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
  ],
  host: { class: 'd-block w-100' },
  templateUrl: './guild-emergency-election-section.html',
})
export class GuildEmergencyElectionSection implements OnInit {
  readonly election = inject(GuildEmergencyElectionState);
  private readonly toast = inject(ToastService);
  private actionPending = false;

  readonly startForm = new FormGroup({
    reason: new FormControl<string>('', { nonNullable: true }),
  });
  readonly nominateForm = new FormGroup({
    candidateHeroId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, trimRequiredValidator()],
    }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
  readonly actionReasonForm = new FormGroup({
    reason: new FormControl<string>('', { nonNullable: true }),
  });
  readonly readError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const error = this.election.error();

      if (!error) {
        this.readError.set(null);
        return;
      }

      if (this.consumeActionPending()) {
        this.toast.show('error', 'Guild emergency election failed', error);
      } else {
        this.readError.set(error);
      }
    });

    effect(() => {
      const message = this.election.message();

      if (message && this.consumeActionPending()) {
        this.toast.show('success', 'Guild emergency election', message);
      }
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.actionPending = false;
    this.readError.set(null);
    this.election.load();
  }

  startElection(): void {
    if (!this.election.canStartElection()) {
      return;
    }

    this.runAction(() => this.election.start({
      reason: this.optionalTrimmedValue(this.startForm.controls.reason.value),
    }));
  }

  nominateCandidate(): void {
    this.nominateForm.markAllAsTouched();

    const summary = this.election.summary();
    const candidateHeroId = this.nominateForm.controls.candidateHeroId.value.trim();

    if (!summary?.canNominate || this.nominateForm.invalid) {
      return;
    }

    this.runAction(() => this.election.nominate({
      electionId: summary.electionId,
      candidateHeroId,
      reason: this.optionalTrimmedValue(this.nominateForm.controls.reason.value),
    }));
  }

  startVoting(): void {
    const summary = this.election.summary();

    if (!summary?.canStartVoting) {
      return;
    }

    this.runAction(() => this.election.startVoting({
      electionId: summary.electionId,
      reason: this.actionReason(),
    }));
  }

  vote(candidate: Pick<GuildEmergencyElectionCandidate, 'candidateHeroId'>): void {
    const summary = this.election.summary();

    if (!summary?.canVote) {
      return;
    }

    this.runAction(() => this.election.vote({
      electionId: summary.electionId,
      candidateHeroId: candidate.candidateHeroId,
      reason: this.actionReason(),
    }));
  }

  finalizeElection(): void {
    const summary = this.election.summary();

    if (!summary?.canFinalize) {
      return;
    }

    this.runAction(() => this.election.finalize({
      electionId: summary.electionId,
      reason: this.actionReason(),
    }));
  }

  private runAction(action: () => void): void {
    this.actionPending = true;
    action();
  }

  private actionReason(): string | null {
    return this.optionalTrimmedValue(this.actionReasonForm.controls.reason.value);
  }

  private optionalTrimmedValue(value: string): string | null {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  private consumeActionPending(): boolean {
    const pending = this.actionPending;
    this.actionPending = false;
    return pending;
  }
}
