import { inject, Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs';
import type { EmptyEstateAddressOption } from '../../../core/domain/estate/estate-address.model';
import { EstateRelocation } from '../../../core/services/estate/estate-relocation';
import { getErrorMessage } from '../../../core/utils/error-message';
import type {
  VicinityBrowserRangeResult,
  VicinityRelocationRunnerInput,
  VicinityRelocationSnapshot,
} from '../../../core/types/vicinity.types';
import {
  createRelocationSnapshot,
  matchesRelocationSnapshot,
} from './vicinity-state-guards';
import { VicinityRelocationFeedback } from './vicinity-relocation-feedback';

@Injectable()
export class VicinityRelocationRunner {
  private readonly estateRelocation = inject(EstateRelocation);
  private readonly feedback = inject(VicinityRelocationFeedback);
  private requestId = 0;

  relocate(input: VicinityRelocationRunnerInput): void {
    if (!input.target || !input.destructiveConfirmed) {
      const message = this.feedback.missingConfirmationMessage;
      input.setRelocationError(message);
      this.feedback.showUnavailable(message);
      return;
    }

    const requestId = ++this.requestId;
    const snapshot = createRelocationSnapshot(input.target);

    input.setIsRelocating(true);
    input.setRelocationError(null);
    input.setRelocationSuccess(null);

    this.estateRelocation.relocateActiveHeroEstate({
      districtCode: input.target.districtCode,
      addressNumber: input.target.addressNumber,
      confirmDestroyExistingEstate: true,
      reason: 'Player estate relocation from vicinity page.',
    }).pipe(
      switchMap((result) =>
        input.loadBrowserRange().pipe(
          map((browserResult) => ({ result, browserResult })),
        ),
      ),
    ).subscribe({
      next: ({ result, browserResult }) => {
        if (!this.isCurrent(requestId, snapshot, input.currentTarget())) {
          this.clearStaleRequest(requestId, input);
          return;
        }

        input.applyBrowserRangeResult(browserResult);
        const message = this.feedback.successMessage(result.addressLabel);
        input.setRelocationSuccess(message);
        this.feedback.showSuccess(message);
        input.setSelectedTarget(null);
        input.setDestructiveConfirmed(false);
        input.setIsRelocating(false);
      },
      error: (error: unknown) => {
        if (!this.isCurrent(requestId, snapshot, input.currentTarget())) {
          this.clearStaleRequest(requestId, input);
          return;
        }

        const message = getErrorMessage(error, 'Estate relocation failed.');
        input.setRelocationError(message);
        this.feedback.showError(message);
        input.setIsRelocating(false);
      },
    });
  }

  private isCurrent(
    requestId: number,
    snapshot: VicinityRelocationSnapshot,
    target: EmptyEstateAddressOption | null,
  ): boolean {
    return (
      requestId === this.requestId &&
      matchesRelocationSnapshot(target ? createRelocationSnapshot(target) : null, snapshot)
    );
  }

  private clearStaleRequest(
    requestId: number,
    input: VicinityRelocationRunnerInput,
  ): void {
    if (requestId === this.requestId) {
      input.setIsRelocating(false);
    }
  }
}
