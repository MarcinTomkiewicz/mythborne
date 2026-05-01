import { Injectable, signal } from '@angular/core';

@Injectable()
export class ExplorationDebugFeedbackState {
  readonly error = signal<string | null>(null);

  clear(): void {
    this.error.set(null);
  }

  reset(): void {
    this.clear();
  }
}

