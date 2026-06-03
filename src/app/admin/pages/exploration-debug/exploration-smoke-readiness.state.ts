import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExplorationSmokeReadinessItem } from '../../../core/domain/exploration/exploration-smoke-readiness.model';
import { ExplorationSmokeReadiness } from '../../../core/services/exploration/exploration-smoke-readiness';
import { getErrorMessage } from '../../../core/utils/error-message';

@Injectable()
export class ExplorationSmokeReadinessState {
  private readonly smokeReadiness = inject(ExplorationSmokeReadiness);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<ExplorationSmokeReadinessItem[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.smokeReadiness.getReadinessMatrix()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.isLoading.set(false);
          this.error.set(
            getErrorMessage(error, 'Failed to load exploration smoke readiness matrix.'),
          );
        },
      });
  }

  statusSeverity(status: ExplorationSmokeReadinessItem['status']): 'success' | 'warn' | 'danger' {
    if (status === 'ready') {
      return 'success';
    }

    return status === 'missing' ? 'danger' : 'warn';
  }
}
