import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { finalize } from 'rxjs';
import { DirectTradeItemTarget } from '../../../core/domain/trade/direct-trade.model';
import { DirectTradeActions } from '../../../core/services/trade/direct-trade-actions';
import { DirectTradeRespondForm } from '../../../core/types/forms/direct-trade-form.types';
import { SelectOption } from '../../../core/types/select-option.types';
import { trimText } from '../../../core/utils/normalize-text';
import { TradeFeedbackState } from './trade-feedback.state';
import { TradeOverviewState } from './trade-overview.state';
import { TradeRequestToken } from './trade-request-token';
import { normalizeCharacterPoints, validateTradeValue } from './trade-validation';

@Injectable()
export class TradeRespondOfferState {
  private readonly tradeActions = inject(DirectTradeActions);
  private readonly overview = inject(TradeOverviewState);
  private readonly feedback = inject(TradeFeedbackState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly itemSearchToken = new TradeRequestToken();
  private readonly submitToken = new TradeRequestToken();

  readonly itemSuggestions = signal<DirectTradeItemTarget[]>([]);
  readonly isSaving = signal(false);
  readonly form: DirectTradeRespondForm = new FormGroup({
    offerId: new FormControl<string | null>(null, Validators.required),
    characterPoints: new FormControl<number | null>(null),
    items: new FormControl<DirectTradeItemTarget[]>([], { nonNullable: true }),
    description: new FormControl<string | null>(null),
  });

  constructor() {
    effect(() => {
      this.overview.overview();
      this.syncSelectedIncomingOffer();
    });
  }

  incomingOfferOptions(): SelectOption<string>[] {
    return this.overview.incomingOfferOptions();
  }

  searchItemTargets(event: AutoCompleteCompleteEvent): void {
    const context = this.overview.currentContext();
    const query = trimText(event.query);
    const token = this.itemSearchToken.next();

    if (!context || query.length < 2) {
      this.itemSuggestions.set([]);
      return;
    }

    this.tradeActions
      .searchOwnItemTargets({ ...context, query })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          if (!this.isCurrentItemSearch(token, context.serverId, context.heroId, query)) {
            return;
          }

          this.itemSuggestions.set(items);
        },
        error: (error: unknown) => {
          if (!this.isCurrentItemSearch(token, context.serverId, context.heroId, query)) {
            return;
          }

          this.feedback.setError(error, 'Failed to search trade items.');
        },
      });
  }

  submit(): void {
    const context = this.overview.currentContext();
    const offerId = this.form.controls.offerId.value;
    const characterPoints = normalizeCharacterPoints(
      this.form.controls.characterPoints.value,
    );
    const items = this.form.controls.items.value;

    this.feedback.clear();

    if (!context || !offerId) {
      this.form.markAllAsTouched();
      this.feedback.error.set('Incoming offer is required.');
      return;
    }

    const validationError = validateTradeValue(characterPoints, items);

    if (validationError) {
      this.feedback.error.set(validationError);
      return;
    }

    const token = this.submitToken.next();

    this.isSaving.set(true);
    this.tradeActions
      .respondToOffer({
        offerId,
        targetCharacterPoints: characterPoints,
        targetItemIds: items.map((item) => item.itemId),
        description: this.form.controls.description.value,
      })
      .pipe(
        finalize(() => {
          if (this.submitToken.isCurrent(token)) {
            this.isSaving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (!this.isCurrentSubmit(token, context.serverId, context.heroId)) {
            return;
          }

          this.feedback.setSuccess('Trade response sent.');
          this.resetForm();
          this.overview.refreshCurrent();
        },
        error: (error: unknown) => {
          if (!this.isCurrentSubmit(token, context.serverId, context.heroId)) {
            return;
          }

          this.feedback.setError(error, 'Trade workflow failed.');
        },
      });
  }

  rejectSelectedOffer(): void {
    const context = this.overview.currentContext();
    const offerId = this.form.controls.offerId.value;

    if (!context || !offerId) {
      this.form.markAllAsTouched();
      this.feedback.error.set('Incoming offer is required.');
      return;
    }

    const token = this.submitToken.next();

    this.isSaving.set(true);
    this.feedback.clear();
    this.tradeActions
      .rejectOffer({ offerId, statusReason: 'Rejected by target player.' })
      .pipe(
        finalize(() => {
          if (this.submitToken.isCurrent(token)) {
            this.isSaving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (!this.isCurrentSubmit(token, context.serverId, context.heroId)) {
            return;
          }

          this.feedback.setSuccess('Trade offer rejected.');
          this.resetForm();
          this.overview.refreshCurrent();
        },
        error: (error: unknown) => {
          if (!this.isCurrentSubmit(token, context.serverId, context.heroId)) {
            return;
          }

          this.feedback.setError(error, 'Trade workflow failed.');
        },
      });
  }

  private resetForm(): void {
    this.form.reset({
      offerId: null,
      characterPoints: null,
      items: [],
      description: null,
    });
  }

  private syncSelectedIncomingOffer(): void {
    const selected = this.form.controls.offerId.value;
    const nextSelected = this.overview.syncIncomingOfferSelection(selected);

    if (nextSelected === selected) {
      return;
    }

    this.form.controls.offerId.setValue(nextSelected, { emitEvent: false });
    this.form.controls.items.setValue([], { emitEvent: false });
    this.form.controls.characterPoints.setValue(null, { emitEvent: false });
    this.form.controls.description.setValue(null, { emitEvent: false });
  }

  private isCurrentItemSearch(
    token: number,
    serverId: string,
    heroId: string,
    query: string,
  ): boolean {
    return (
      this.itemSearchToken.isCurrent(token) &&
      this.overview.isCurrentContext(serverId, heroId) &&
      trimText(query).length >= 2
    );
  }

  private isCurrentSubmit(token: number, serverId: string, heroId: string): boolean {
    return this.submitToken.isCurrent(token) && this.overview.isCurrentContext(serverId, heroId);
  }
}
