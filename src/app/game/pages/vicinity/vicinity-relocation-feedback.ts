import { inject, Injectable } from '@angular/core';
import { ToastService } from '../../../core/services/ui/toast';

@Injectable({ providedIn: 'root' })
export class VicinityRelocationFeedback {
  readonly missingConfirmationMessage =
    'Choose an empty vicinity address and confirm the destructive reset.';

  private readonly toast = inject(ToastService);

  successMessage(addressLabel: string): string {
    return (
      `Estate relocated to ${addressLabel}. ` +
      'The previous estate was reset and the new district baseline was initialized.'
    );
  }

  showUnavailable(message: string): void {
    this.toast.show('warn', 'Relocation unavailable', message);
  }

  showSuccess(message: string): void {
    this.toast.show('success', 'Estate relocated', message);
  }

  showError(message: string): void {
    this.toast.show('error', 'Estate relocation failed', message);
  }
}
