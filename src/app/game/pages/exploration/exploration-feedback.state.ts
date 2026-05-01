import { Injectable, signal } from '@angular/core';

@Injectable()
export class ExplorationFeedbackState {
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  setError(error: unknown, fallback: string): void {
    this.successMessage.set(null);
    this.error.set(error instanceof Error ? error.message : fallback);
  }

  setSuccess(message: string): void {
    this.error.set(null);
    this.successMessage.set(message);
  }

  clear(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }
}
