import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GuildArmoryBorrowResult,
  GuildArmoryItem,
  GuildArmoryItemOperationResult,
  GuildArmoryLoan,
  GuildArmoryLoanOperationResult,
} from '../../../core/domain/guild/guild-armory.model';
import { PlayerArmoryItemReadModel } from '../../../core/domain/item/player-armory-page-context.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuildArmoryActions } from '../../../core/services/guild/player-guild-armory-actions';
import { ToastService } from '../../../core/services/ui/toast';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { getErrorMessage } from '../../../core/utils/error-message';
import { GuildArmoryReadState } from './guild-armory-read.state';

type GuildArmoryItemActionKind =
  | 'borrow'
  | 'deposit'
  | 'force-return'
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
  private readonly toast = inject(ToastService);
  private mutationRequestId = 0;

  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
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

  isEquipped(item: Pick<PlayerArmoryItemReadModel, 'itemId'>): boolean {
    return this.equippedItemIds().has(item.itemId);
  }

  canDeposit(item: PlayerArmoryItemReadModel): boolean {
    return item.lifecycleStatusKey === 'active' && !this.isEquipped(item);
  }

  deposit(item: PlayerArmoryItemReadModel): void {
    if (this.isEquipped(item)) {
      this.showActionError(
        'Equipped items must be unequipped before guild armory deposit.',
      );
      return;
    }

    if (!this.canDeposit(item)) {
      this.showActionError('This item is not eligible for guild armory deposit.');
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
      this.showActionError('No active guild armory loan for this item.');
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

  forceReturnItem(item: GuildArmoryItem): void {
    const loanId = item.loanId;

    if (!loanId) {
      this.showActionError('No active guild armory loan for this item.');
      return;
    }

    this.runMutation(
      'force-return',
      () => this.guildArmoryActions.forceReturnGuildArmoryLoanForActiveHero({
        loanId,
      }),
    );
  }

  forceReturnLoan(loan: GuildArmoryLoan): void {
    this.runMutation(
      'force-return',
      () => this.guildArmoryActions.forceReturnGuildArmoryLoanForActiveHero({
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

    if (!contextKey) {
      this.isMutating.set(false);
      this.showActionError('No active hero for guild armory action.');
      return;
    }

    this.isMutating.set(true);

    operation().subscribe({
      next: () => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.toast.show('success', 'Guild armory', successMessage(action));
        this.refreshAfterMutation();
      },
      error: (error: unknown) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.showActionError(getErrorMessage(error, 'Guild armory action failed.'));
      },
    });
  }

  private showActionError(message: string): void {
    this.error.set(message);
    this.toast.show('error', 'Guild armory action failed', message);
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
    case 'force-return':
      return 'Guild armory loan force-returned.';
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
