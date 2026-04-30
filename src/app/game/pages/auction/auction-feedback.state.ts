import { Injectable, signal } from '@angular/core';

@Injectable()
export class AuctionFeedbackState {
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  clear(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }

  setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof Error ? error.message : fallback);
  }

  setSuccess(message: string): void {
    this.successMessage.set(message);
  }
}
