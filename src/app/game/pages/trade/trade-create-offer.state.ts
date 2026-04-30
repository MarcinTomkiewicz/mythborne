import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { finalize } from 'rxjs';
import {
  DirectTradeHeroTarget,
  DirectTradeItemTarget,
} from '../../../core/domain/trade/direct-trade.model';
import { DirectTradeActions } from '../../../core/services/trade/direct-trade-actions';
import { DirectTradeCreateForm } from '../../../core/types/forms/direct-trade-form.types';
import { trimText } from '../../../core/utils/normalize-text';
import { TradeFeedbackState } from './trade-feedback.state';
import { TradeOverviewState } from './trade-overview.state';
import { TradeRequestToken } from './trade-request-token';
import { normalizeCharacterPoints, validateTradeValue } from './trade-validation';

@Injectable()
export class TradeCreateOfferState {
  private readonly tradeActions = inject(DirectTradeActions);
  private readonly overview = inject(TradeOverviewState);
  private readonly feedback = inject(TradeFeedbackState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heroSearchToken = new TradeRequestToken();
  private readonly itemSearchToken = new TradeRequestToken();
  private readonly submitToken = new TradeRequestToken();

  readonly targetSuggestions = signal<DirectTradeHeroTarget[]>([]);
  readonly itemSuggestions = signal<DirectTradeItemTarget[]>([]);
  readonly isSaving = signal(false);
  readonly form: DirectTradeCreateForm = new FormGroup({
    target: new FormControl<DirectTradeHeroTarget | null>(null, Validators.required),
    characterPoints: new FormControl<number | null>(null),
    items: new FormControl<DirectTradeItemTarget[]>([], { nonNullable: true }),
    description: new FormControl<string | null>(null),
  });

  searchHeroTargets(event: AutoCompleteCompleteEvent): void {
    const context = this.overview.currentContext();
    const query = trimText(event.query);
    const token = this.heroSearchToken.next();

    if (!context || query.length < 2) {
      this.targetSuggestions.set([]);
      return;
    }

    this.tradeActions
      .searchHeroTargets({
        serverId: context.serverId,
        activeHeroId: context.heroId,
        query,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (targets) => {
          if (!this.isCurrentHeroSearch(token, context.serverId, context.heroId, query)) {
            return;
          }

          this.targetSuggestions.set(targets);
        },
        error: (error: unknown) => {
          if (!this.isCurrentHeroSearch(token, context.serverId, context.heroId, query)) {
            return;
          }

          this.feedback.setError(error, 'Failed to search trade targets.');
        },
      });
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
    const target = this.form.controls.target.value;
    const characterPoints = normalizeCharacterPoints(
      this.form.controls.characterPoints.value,
    );
    const items = this.form.controls.items.value;

    this.feedback.clear();

    if (!context || !target) {
      this.form.markAllAsTouched();
      this.feedback.error.set('Target hero is required.');
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
      .createOffer({
        creatorHeroId: context.heroId,
        targetHeroId: target.heroId,
        creatorCharacterPoints: characterPoints,
        creatorItemIds: items.map((item) => item.itemId),
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

          this.feedback.setSuccess('Trade offer created.');
          this.form.reset({ target: null, characterPoints: null, items: [] });
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

  private isCurrentHeroSearch(
    token: number,
    serverId: string,
    heroId: string,
    query: string,
  ): boolean {
    return (
      this.heroSearchToken.isCurrent(token) &&
      this.overview.isCurrentContext(serverId, heroId) &&
      trimText(query).length >= 2
    );
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
