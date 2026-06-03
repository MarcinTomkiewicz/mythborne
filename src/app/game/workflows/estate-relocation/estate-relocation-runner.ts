import { inject, Injectable } from '@angular/core';
import type { EmptyEstateAddressOption } from '../../../core/domain/estate/estate-address.model';
import { EstateRelocation } from '../../../core/services/estate/estate-relocation';
import type {
  EstateRelocationRunnerInput,
  EstateRelocationSnapshot,
} from './estate-relocation-workflow.types';
import { getErrorMessage } from '../../../core/utils/error-message';
import { EstateRelocationFeedback } from './estate-relocation-feedback';
import {
  createRelocationSnapshot,
  matchesRelocationSnapshot,
} from './estate-relocation-state-guards';

@Injectable()
export class EstateRelocationRunner {
  private readonly estateRelocation = inject(EstateRelocation);
  private readonly feedback = inject(EstateRelocationFeedback);
  private requestId = 0;

  relocate(input: EstateRelocationRunnerInput): void {
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
    }).subscribe({
      next: (result) => {
        if (!this.isCurrent(requestId, snapshot, input.currentTarget())) {
          this.clearStaleRequest(requestId, input);
          return;
        }

        input.onSuccess(result);
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

        const message = getErrorMessage(error, 'Nie udało się przenieść posiadłości.');
        input.setRelocationError(message);
        this.feedback.showError(message);
        input.setIsRelocating(false);
      },
    });
  }

  private isCurrent(
    requestId: number,
    snapshot: EstateRelocationSnapshot,
    target: EmptyEstateAddressOption | null,
  ): boolean {
    return (
      requestId === this.requestId &&
      matchesRelocationSnapshot(target ? createRelocationSnapshot(target) : null, snapshot)
    );
  }

  private clearStaleRequest(
    requestId: number,
    input: EstateRelocationRunnerInput,
  ): void {
    if (requestId === this.requestId) {
      input.setIsRelocating(false);
    }
  }
}
