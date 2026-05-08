import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { RecoverableScrappedItem } from '../../domain/item/item-lifecycle.model';
import { getErrorMessage } from '../../utils/error-message';
import { ItemLifecycleService } from './item-lifecycle';

interface RecoverySearchContext {
  requestId: number;
  serverId: string;
}

interface RecoveryMutationContext extends RecoverySearchContext {
  itemId: string;
}

@Injectable()
export class ScrappedItemRecoveryState {
  private readonly lifecycle = inject(ItemLifecycleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchForm = new FormGroup({
    query: new FormControl<string>('', { nonNullable: true }),
  });
  readonly recoveryForm = new FormGroup({
    reason: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly items = signal<RecoverableScrappedItem[]>([]);
  readonly totalCount = signal(0);
  readonly isSearching = signal(false);
  readonly recoveringItemId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  private searchRequestId = 0;
  private mutationRequestId = 0;
  private activeSearch: RecoverySearchContext | null = null;
  private activeMutation: RecoveryMutationContext | null = null;

  reset(): void {
    this.searchRequestId += 1;
    this.mutationRequestId += 1;
    this.activeSearch = null;
    this.activeMutation = null;
    this.items.set([]);
    this.totalCount.set(0);
    this.isSearching.set(false);
    this.recoveringItemId.set(null);
    this.error.set(null);
    this.message.set(null);
    this.searchForm.reset({ query: '' });
    this.recoveryForm.reset({ reason: '' });
  }

  search(serverId: string | null, canRecover: boolean): void {
    if (!this.canUseRecoverySurface(serverId, canRecover)) {
      return;
    }

    const context = this.nextSearchContext(serverId);

    this.isSearching.set(true);
    this.error.set(null);

    this.lifecycle.searchRecoverableScrappedItems({
      serverId,
      query: this.searchForm.controls.query.value,
      limit: 25,
      offset: 0,
    })
      .pipe(
        finalize(() => {
          if (this.isActiveSearch(context)) {
            this.isSearching.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!this.isActiveSearch(context)) {
            return;
          }

          this.items.set(result.items);
          this.totalCount.set(result.totalCount);
          this.message.set(result.items.length
            ? null
            : 'No recoverable scrapped affix items were returned for this server.');
        },
        error: (error: unknown) => {
          if (this.isActiveSearch(context)) {
            this.error.set(getErrorMessage(
              error,
              'Failed to load recoverable scrapped items.',
            ));
          }
        },
      });
  }

  recover(
    item: RecoverableScrappedItem,
    serverId: string | null,
    canRecover: boolean,
  ): void {
    if (!this.canUseRecoverySurface(serverId, canRecover)) {
      return;
    }

    this.recoveryForm.controls.reason.markAsTouched();
    if (this.recoveryForm.invalid) {
      this.error.set('Recovery reason is required.');
      return;
    }

    const context = this.nextMutationContext(serverId, item.itemId);

    this.recoveringItemId.set(item.itemId);
    this.error.set(null);
    this.message.set(null);

    this.lifecycle.recoverScrappedItem({
      itemId: item.itemId,
      targetHeroId: item.ownerHeroId,
      reason: this.recoveryForm.controls.reason.value,
    })
      .pipe(
        finalize(() => {
          if (this.isActiveMutation(context)) {
            this.recoveringItemId.set(null);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (!this.isActiveMutation(context)) {
            return;
          }

          this.message.set(`Recovered ${item.itemDisplayName} to ${item.ownerHeroName}.`);
          this.refreshAfterRecovery(context);
        },
        error: (error: unknown) => {
          if (this.isActiveMutation(context)) {
            this.error.set(getErrorMessage(
              error,
              'Failed to recover scrapped item.',
            ));
          }
        },
      });
  }

  isRecovering(item: RecoverableScrappedItem): boolean {
    return this.recoveringItemId() === item.itemId;
  }

  private refreshAfterRecovery(context: RecoveryMutationContext): void {
    const searchContext = this.nextSearchContext(context.serverId);

    this.isSearching.set(true);
    this.lifecycle.searchRecoverableScrappedItems({
      serverId: context.serverId,
      query: this.searchForm.controls.query.value,
      limit: 25,
      offset: 0,
    })
      .pipe(
        finalize(() => {
          if (this.isActiveSearch(searchContext)) {
            this.isSearching.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!this.isActiveSearch(searchContext)) {
            return;
          }

          this.items.set(result.items);
          this.totalCount.set(result.totalCount);
        },
        error: (error: unknown) => {
          if (this.isActiveSearch(searchContext)) {
            this.error.set(getErrorMessage(
              error,
              'Recovered item, but failed to refresh recoverable items.',
            ));
          }
        },
      });
  }

  private canUseRecoverySurface(
    serverId: string | null,
    canRecover: boolean,
  ): serverId is string {
    if (!serverId) {
      this.error.set('Select a server before searching recoverable items.');
      return false;
    }

    if (!canRecover) {
      this.error.set('This account cannot recover scrapped items on the selected server.');
      return false;
    }

    return true;
  }

  private nextSearchContext(serverId: string): RecoverySearchContext {
    const context = {
      requestId: ++this.searchRequestId,
      serverId,
    };

    this.activeSearch = context;
    return context;
  }

  private nextMutationContext(
    serverId: string,
    itemId: string,
  ): RecoveryMutationContext {
    const context = {
      requestId: ++this.mutationRequestId,
      serverId,
      itemId,
    };

    this.activeMutation = context;
    return context;
  }

  private isActiveSearch(context: RecoverySearchContext): boolean {
    return this.activeSearch?.requestId === context.requestId
      && this.activeSearch.serverId === context.serverId;
  }

  private isActiveMutation(context: RecoveryMutationContext): boolean {
    return this.activeMutation?.requestId === context.requestId
      && this.activeMutation.serverId === context.serverId
      && this.activeMutation.itemId === context.itemId;
  }
}
