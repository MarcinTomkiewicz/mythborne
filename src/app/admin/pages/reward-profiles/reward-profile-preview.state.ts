import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { RewardProfilePreview } from '../../../core/domain/exploration/exploration-preview.model';
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

  readonly isLoading = signal(false);
  readonly rows = signal<RewardProfilePreview[]>([]);

  clear(): void {
    this.rows.set([]);
  }

  loadPreview(): void {
    const profileId = this.page.selectedProfileId();

    if (!profileId) {
      return;
    }

    const token = this.token.next();

    this.isLoading.set(true);
    this.page.error.set(null);
    this.previews.previewRewardProfile({ rewardProfileId: profileId, previewCount: 5 })
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
