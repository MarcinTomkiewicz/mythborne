import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import type { PendingTimerDisplay } from '../../core/types/pending-timer.types';
import { neutralPendingTimerDisplay } from '../../core/utils/pending-timer';

@Component({
  selector: 'app-pending-timer-oracle',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './pending-timer-oracle.html',
  styleUrl: './pending-timer-oracle.scss',
  host: {
    class: 'd-block w-100',
  },
})
export class PendingTimerOracle {
  readonly timer = input.required<PendingTimerDisplay>();
  readonly isReady = input(false);
  readonly isResolving = input(false);
  readonly isUpdating = input(false);
  readonly timerAriaLabel = input.required<string>();
  readonly progressAriaLabel = input.required<string>();
  readonly pendingLabel = input.required<string>();
  readonly pendingHelperText = input.required<string>();
  readonly pendingNeutralHelperText = input.required<string>();
  readonly readyLabel = input.required<string>();
  readonly readyTitle = input.required<string>();
  readonly readyHelperText = input.required<string>();
  readonly primaryActionLabel = input.required<string>();
  readonly decorativeLabel = input<string | null>(null);
  readonly primaryAction = output<void>();
  readonly displayTimer = computed(() =>
    this.isUpdating()
      ? neutralPendingTimerDisplay(this.timer().subjectId)
      : this.timer(),
  );

  onPrimaryAction(): void {
    if (this.isReady() && !this.isResolving()) {
      this.primaryAction.emit();
    }
  }
}
