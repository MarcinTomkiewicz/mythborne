import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BuildingBonusImpactPreview } from '../../domain/building/building.model';
import { getErrorMessage } from '../../utils/error-message';
import { ToastService } from '../ui/toast';
import { BuildingImpactPreviewAdminService } from './building-impact-preview-admin';

@Injectable()
export class BuildingImpactPreviewState {
  private readonly previewAdmin = inject(BuildingImpactPreviewAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  readonly bonusRows = signal<BuildingBonusImpactPreview[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  load(buildingId: string | null | undefined, options: { silent?: boolean } = {}): void {
    if (!buildingId) {
      this.reset();
      this.error.set('Save or select an existing building before loading impact preview.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.previewAdmin
      .getBuildingBonusImpactPreview(buildingId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (bonuses) => this.bonusRows.set(bonuses),
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load building impact preview.');
          this.error.set(message);

          if (!options.silent) {
            this.toast.show('error', 'Impact preview unavailable', message);
          }
        },
      });
  }

  reset(): void {
    this.bonusRows.set([]);
    this.error.set(null);
  }
}
