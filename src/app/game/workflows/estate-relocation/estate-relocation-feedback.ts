import { inject, Injectable } from '@angular/core';
import { ToastService } from '../../../core/services/ui/toast';

@Injectable({ providedIn: 'root' })
export class EstateRelocationFeedback {
  readonly missingConfirmationMessage =
    'Wybierz pusty adres i potwierdź destrukcyjną przeprowadzkę.';

  private readonly toast = inject(ToastService);

  successMessage(addressLabel: string): string {
    return (
      `Posiadłość przeniesiona na ${addressLabel}. ` +
      'Poprzednia posiadłość została zresetowana, a nowa powstała w stanie początkowym.'
    );
  }

  showUnavailable(message: string): void {
    this.toast.show('warn', 'Przeprowadzka niedostępna', message);
  }

  showSuccess(message: string): void {
    this.toast.show('success', 'Posiadłość przeniesiona', message);
  }

  showError(message: string): void {
    this.toast.show('error', 'Przeprowadzka nieudana', message);
  }
}
