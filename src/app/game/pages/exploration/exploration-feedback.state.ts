import { Injectable, inject, signal } from '@angular/core';
import { ToastService } from '../../../core/services/ui/toast';

@Injectable()
export class ExplorationFeedbackState {
  private readonly toast = inject(ToastService);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  setError(error: unknown, fallback: string): void {
    this.successMessage.set(null);
    const message = error instanceof Error ? error.message : fallback;

    this.error.set(message);
    this.toast.show('error', 'Eksploracja', message);
  }

  setSuccess(message: string): void {
    this.error.set(null);
    this.successMessage.set(message);
    this.toast.show('success', 'Eksploracja', message);
  }

  clear(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }
}
