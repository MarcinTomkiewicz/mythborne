import { computed, inject, Injectable, signal } from '@angular/core';
import {
  GuildArmoryItem,
  GuildArmoryLoan,
  GuildArmoryReadModel,
} from '../../../core/domain/guild/guild-armory.model';
import { ArmoryItemSummary } from '../../../core/domain/item/item-equipment.model';
import {
  ArmoryGuildItemUsage,
} from '../../../core/interfaces/item/armory-guild-item-usage.interface';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuildArmory } from '../../../core/services/guild/player-guild-armory';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { getErrorMessage } from '../../../core/utils/error-message';

@Injectable()
export class ArmoryGuildItemUsageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly guildArmory = inject(PlayerGuildArmory);
  private loadRequestId = 0;

  readonly readModel = signal<GuildArmoryReadModel | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly itemsByItemId = computed(() =>
    new Map(this.readModel()?.items.map((item) => [item.itemId, item]) ?? []),
  );
  readonly activeLoansByItemId = computed(() =>
    new Map(this.readModel()?.loans.map((loan) => [loan.itemId, loan]) ?? []),
  );

  load(): void {
    const requestId = ++this.loadRequestId;
    const contextKey = this.currentContextKey();

    this.readModel.set(null);
    this.error.set(null);

    if (!contextKey) {
      this.isLoading.set(false);
      this.error.set('No active hero for guild armory item state.');
      return;
    }

    this.isLoading.set(true);

    this.guildArmory.getActiveHeroGuildArmory(false).subscribe({
      next: (readModel) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.readModel.set(readModel);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.readModel.set(null);
        this.error.set(getErrorMessage(
          error,
          'Failed to load guild armory item state.',
        ));
        this.isLoading.set(false);
      },
    });
  }

  usageForItem(item: Pick<ArmoryItemSummary, 'itemId' | 'ownerHeroId'>): ArmoryGuildItemUsage {
    if (this.isLoading() || this.error()) {
      return unknownUsage();
    }

    const activeHeroId = this.activeHero.state()?.heroId ?? null;
    const guildItem = this.itemsByItemId().get(item.itemId) ?? null;
    const activeLoan = this.activeLoansByItemId().get(item.itemId) ?? null;

    if (isBorrowedByActiveHero(activeLoan, activeHeroId)
      || isBorrowedByActiveHero(guildItem, activeHeroId)) {
      return {
        key: 'borrowed_from_guild_armory',
        label: 'Borrowed from guild armory',
        detail: 'Guild borrowed items cannot be sold to vendor from private armory actions.',
        privateActionsAllowed: false,
      };
    }

    if (guildItem?.ownerHeroId === item.ownerHeroId) {
      if (guildItem.armoryStatusKey === 'borrowed') {
        return {
          key: 'borrowed_by_guild_member',
          label: guildItem.borrowerHeroName
            ? `Borrowed by ${guildItem.borrowerHeroName}`
            : 'Borrowed by guild member',
          detail: 'Return or force-return through guild armory before private item actions.',
          privateActionsAllowed: false,
        };
      }

      return {
        key: 'deposited_in_guild_armory',
        label: 'Deposited in guild armory',
        detail: 'Withdraw from guild armory before equipping, moving or selling privately.',
        privateActionsAllowed: false,
      };
    }

    return {
      key: 'owned_private',
      label: 'Owned private item',
      detail: null,
      privateActionsAllowed: true,
    };
  }

  canUsePrivateItemActions(item: Pick<ArmoryItemSummary, 'itemId' | 'ownerHeroId'>): boolean {
    return this.usageForItem(item).privateActionsAllowed;
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.readModel.set(null);
      this.error.set(null);
      this.isLoading.set(false);
      return false;
    }

    return true;
  }
}

function isBorrowedByActiveHero(
  row: Pick<GuildArmoryItem | GuildArmoryLoan, 'borrowerHeroId'> | null,
  activeHeroId: string | null,
): boolean {
  return !!activeHeroId && row?.borrowerHeroId === activeHeroId;
}

function unknownUsage(): ArmoryGuildItemUsage {
  return {
    key: 'unknown',
    label: 'Guild armory state unavailable',
    detail: 'Private item actions are hidden until guild armory item state is loaded.',
    privateActionsAllowed: false,
  };
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
