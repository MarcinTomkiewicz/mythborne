import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';
import { LuckRewardRangePreview } from '../../../core/domain/luck/luck.model';
import { ExplorationLabPreviews } from '../../../core/services/exploration/exploration-lab-previews';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { RewardProfilesPageState } from './reward-profiles-page.state';

@Injectable()
export class RewardProfilePreviewState {
  private readonly previews = inject(ExplorationLabPreviews);
  private readonly destroyRef = inject(DestroyRef);
  private readonly page = inject(RewardProfilesPageState);
  private readonly token = new RequestToken();
  private selectedProfileId = this.page.selectedProfileId();

  readonly isLoading = signal(false);
  readonly form = new FormGroup({
    previewCount: new FormControl<number | null>(5),
    spiritualityValue: new FormControl<number | null>(0),
    luckValue: new FormControl<number | null>(0),
  });
  readonly rows = signal<LuckRewardRangePreview[]>([]);

  constructor() {
    effect(() => {
      const profileId = this.page.selectedProfileId();

      if (profileId !== this.selectedProfileId) {
        this.selectedProfileId = profileId;
        this.clear();
      }
    });
  }

  clear(): void {
    this.rows.set([]);
  }

  loadPreview(): void {
    const profileId = this.page.selectedProfileId();

    if (!profileId) {
      return;
    }

    const token = this.token.next();

    this.clear();
    this.isLoading.set(true);
    this.page.error.set(null);
    this.previews.previewRewardProfile({
      rewardProfileId: profileId,
      ...this.form.getRawValue(),
    })
      .pipe(finalize(() => this.token.isCurrent(token) && this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          if (this.token.isCurrent(token) && this.page.selectedProfileId() === profileId) {
            this.rows.set(rows);
          }
        },
        error: (error: unknown) => {
          if (this.token.isCurrent(token) && this.page.selectedProfileId() === profileId) {
            this.page.error.set(getErrorMessage(error, 'Failed to preview reward profile.'));
          }
        },
      });
  }
}
