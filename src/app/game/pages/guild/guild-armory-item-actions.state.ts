import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GuildArmoryBorrowResult,
  GuildArmoryItem,
  GuildArmoryItemOperationResult,
  GuildArmoryLoan,
  GuildArmoryLoanOperationResult,
} from '../../../core/domain/guild/guild-armory.model';
import { ArmoryItemSummary } from '../../../core/domain/item/item-equipment.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuildArmoryActions } from '../../../core/services/guild/player-guild-armory-actions';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { getErrorMessage } from '../../../core/utils/error-message';
import { GuildArmoryReadState } from './guild-armory-read.state';

type GuildArmoryItemActionKind =
  | 'borrow'
  | 'deposit'
  | 'remove'
  | 'return'
  | 'withdraw';

type GuildArmoryActionResult =
  | GuildArmoryBorrowResult
  | GuildArmoryItemOperationResult
  | GuildArmoryLoanOperationResult;

@Injectable()
export class GuildArmoryItemActionsState {
  private readonly activeHero = inject(ActiveHero);
  private readonly armory = inject(ArmoryShelfState);
  private readonly equipment = inject(CurrentEquipmentState);
  private readonly guildArmory = inject(GuildArmoryReadState);
  private readonly guildArmoryActions = inject(PlayerGuildArmoryActions);
  private mutationRequestId = 0;

  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly depositItems = computed(() => this.armory.visibleItems());
  readonly isLoadingDepositContext = computed(() =>
    this.armory.isLoading() || this.equipment.isLoading(),
  );
  readonly equippedItemIds = computed(() =>
    new Set(this.equipment.slots().map((slot) => slot.itemId)),
  );

  load(): void {
    this.armory.load();
    this.equipment.load();
  }

  isEquipped(item: Pick<ArmoryItemSummary, 'itemId'>): boolean {
    return this.equippedItemIds().has(item.itemId);
  }

  canDeposit(item: ArmoryItemSummary): boolean {
    return item.lifecycleStatus === 'active' && !this.isEquipped(item);
  }

  deposit(item: ArmoryItemSummary): void {
    if (this.isEquipped(item)) {
      this.error.set('Equipped items must be unequipped before guild armory deposit.');
      this.message.set(null);
      return;
    }

    if (!this.canDeposit(item)) {
      this.error.set('This item is not eligible for guild armory deposit.');
      this.message.set(null);
      return;
    }

    this.runMutation(
      'deposit',
      () => this.guildArmoryActions.depositGuildArmoryItemForActiveHero({
        itemId: item.itemId,
      }),
    );
  }

  borrow(item: GuildArmoryItem): void {
    this.runMutation(
      'borrow',
      () => this.guildArmoryActions.borrowGuildArmoryItemForActiveHero({
        armoryItemId: item.armoryItemId,
      }),
    );
  }

  returnItem(item: GuildArmoryItem): void {
    const loanId = item.loanId;

    if (!loanId) {
      this.error.set('No active guild armory loan for this item.');
      this.message.set(null);
      return;
    }

    this.runMutation(
      'return',
      () => this.guildArmoryActions.returnGuildArmoryLoanForActiveHero({
        loanId,
      }),
    );
  }

  returnLoan(loan: GuildArmoryLoan): void {
    this.runMutation(
      'return',
      () => this.guildArmoryActions.returnGuildArmoryLoanForActiveHero({
        loanId: loan.loanId,
      }),
    );
  }

  withdraw(item: GuildArmoryItem): void {
    this.runMutation(
      'withdraw',
      () => this.guildArmoryActions.withdrawGuildArmoryItemForActiveHero({
        armoryItemId: item.armoryItemId,
      }),
    );
  }

  remove(item: GuildArmoryItem): void {
    this.runMutation(
      'remove',
      () => this.guildArmoryActions.removeGuildArmoryItemForActiveHero({
        armoryItemId: item.armoryItemId,
      }),
    );
  }

  private runMutation(
    action: GuildArmoryItemActionKind,
    operation: () => Observable<GuildArmoryActionResult>,
  ): void {
    const requestId = ++this.mutationRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);

    if (!contextKey) {
      this.isMutating.set(false);
      this.error.set('No active hero for guild armory action.');
      return;
    }

    this.isMutating.set(true);

    operation().subscribe({
      next: () => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.message.set(successMessage(action));
        this.refreshAfterMutation();
      },
      error: (error: unknown) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.error.set(getErrorMessage(error, 'Guild armory action failed.'));
      },
    });
  }

  private refreshAfterMutation(): void {
    this.guildArmory.load();
    this.armory.refresh();
    this.equipment.refresh();
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsMutationResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.mutationRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.isMutating.set(false);
      this.error.set(null);
      this.message.set(null);
      return false;
    }

    return true;
  }
}

function successMessage(action: GuildArmoryItemActionKind): string {
  switch (action) {
    case 'borrow':
      return 'Item borrowed from guild armory.';
    case 'deposit':
      return 'Item deposited into guild armory.';
    case 'withdraw':
      return 'Item withdrawn from guild armory.';
    case 'remove':
      return 'Item removed from guild armory.';
    case 'return':
      return 'Guild armory loan returned.';
  }
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
