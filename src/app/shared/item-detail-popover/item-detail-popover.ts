import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import {
  ItemDetailPopoverCopy,
  ItemPopoverContextKey,
  ItemDetailPopoverViewModel,
} from '../../core/domain/item/item-detail-popover.model';
import { ItemDetailPopoverDetailReadModel } from '../../core/domain/item/item-detail-popover-detail.model';
import { ItemDetailPopoverCopyReader } from '../../core/services/items/item-detail-popover-copy-reader';
import { ItemDetailReader } from '../../core/services/items/item-detail-reader';
import { itemDetailPopoverViewModel } from '../../core/utils/item-detail-popover-mappers';

@Component({
  selector: 'app-item-detail-popover',
  standalone: true,
  imports: [ButtonModule, Popover],
  templateUrl: './item-detail-popover.html',
})
export class ItemDetailPopover {
  private readonly reader = inject(ItemDetailReader);
  private readonly copyReader = inject(ItemDetailPopoverCopyReader);
  private readonly destroyRef = inject(DestroyRef);
  private requestId = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private loadingItemKey: string | null = null;

  readonly copy = signal<ItemDetailPopoverCopy | null>(null);
  readonly loadedItemKey = signal<string | null>(null);
  readonly itemId = input<string | null>(null);
  readonly fallbackName = input<string | null>(null);
  readonly contextKey = input<ItemPopoverContextKey | null>(null, { alias: 'context' });
  readonly publicToken = input<string | null>(null);
  readonly itemReferenceId = input<string | null>(null);
  readonly contextSourceLabel = input<string | null>(null);
  readonly triggerLabel = input<string | null>(null);
  readonly triggerIcon = input<string | null>(null);
  readonly triggerSeverity = input<'secondary' | 'info' | 'success' | 'warn' | 'danger'>('secondary');
  readonly triggerOutlined = input(false);
  readonly buttonTrigger = input(true);
  readonly triggerFullWidth = input(false);
  readonly triggerTabIndex = input<number | null>(0);
  readonly status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly loadedDetail = signal<ItemDetailPopoverDetailReadModel | null>(null);
  readonly item = computed<ItemDetailPopoverViewModel>(() => {
    const detail = this.loadedDetail();
    const itemId = this.itemId();

    if (
      detail
      && (!itemId || detail.itemId === itemId)
      && this.loadedItemKey() === this.currentItemKey()
    ) {
      return itemDetailPopoverViewModel(detail);
    }

    return {
      itemId,
      name: this.fallbackName() ?? '',
      headerMetaLabels: [],
      iconClass: 'pi pi-box',
      valueDisplay: null,
      itemStats: [],
      modifierRows: [],
      requirementRows: [],
      requirementState: null,
      isLoading: this.status() === 'loading',
      error: this.playerSafeError(),
    };
  });

  openFromPointer(event: Event, popover: Popover): void {
    this.open(event, popover);
  }

  openFromClick(event: Event, popover: Popover): void {
    if (!this.buttonTrigger() && this.isInteractiveTarget(event.target)) {
      return;
    }

    this.open(event, popover);
  }

  scheduleClose(popover: Popover): void {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => popover.hide(), 160);
  }

  keepOpen(): void {
    this.clearHideTimeout();
  }

  private open(event: Event, popover: Popover): void {
    this.keepOpen();
    this.loadDetail();
    popover.show(event);
  }

  rowCode(label: string): string {
    const code = Array.from(label)
      .filter((character) => character.trim().length > 0)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return code || 'IT';
  }

  private loadDetail(): void {
    const itemId = this.itemId();

    if (
      this.status() === 'loaded'
      && (!itemId || this.loadedDetail()?.itemId === itemId)
      && this.loadedItemKey() === this.currentItemKey()
    ) {
      return;
    }

    if (
      this.status() === 'loading'
      && this.loadingItemKey === this.currentItemKey()
    ) {
      return;
    }

    if (!this.canLoadDetail()) {
      this.loadedDetail.set(null);
      this.loadedItemKey.set(null);
      this.status.set('error');
      this.error.set(this.copy()?.access.notFound ?? 'itemDetailPopover.access.notFound');
      this.loadingItemKey = null;
      return;
    }

    const itemKey = this.currentItemKey();

    const requestId = ++this.requestId;
    this.loadingItemKey = itemKey;
    this.status.set('loading');
    this.error.set(null);
    this.loadedDetail.set(null);
    this.loadedItemKey.set(null);

    forkJoin({
      copy: this.copyReader.readCopy(),
      detail: this.reader.readItemDetail(
        itemId,
        this.contextKey(),
        this.publicToken(),
        this.itemReferenceId(),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ copy, detail }) => {
          if (requestId !== this.requestId || itemKey !== this.currentItemKey()) {
            return;
          }

          this.copy.set(copy);
          this.loadedDetail.set(detail);
          this.loadedItemKey.set(itemKey);
          this.status.set('loaded');
          this.loadingItemKey = null;
        },
        error: () => {
          if (requestId !== this.requestId || itemKey !== this.currentItemKey()) {
            return;
          }

          this.loadedDetail.set(null);
          this.loadedItemKey.set(null);
          this.status.set('error');
          this.error.set(this.copy()?.access.notReadable ?? 'itemDetailPopover.access.notReadable');
          this.loadingItemKey = null;
        },
      });
  }

  triggerText(): string {
    return this.triggerLabel() ?? this.fallbackName() ?? '';
  }

  triggerAriaLabel(name: string): string {
    return this.triggerLabel() ?? name;
  }

  private playerSafeError(): string | null {
    if (this.status() !== 'error') {
      return null;
    }

    return this.error() ?? this.copy()?.access.notReadable ?? 'itemDetailPopover.access.notReadable';
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest(
      'button, a, input, select, textarea, p-button, p-checkbox, p-select',
    ));
  }

  private currentItemKey(): string {
    return [
      this.itemId()?.trim() ?? '',
      this.contextKey() ?? '',
      this.publicToken()?.trim() ?? '',
      this.itemReferenceId()?.trim() ?? '',
    ].join(':');
  }

  private canLoadDetail(): boolean {
    return Boolean(
      this.itemId()?.trim()
      || (
        this.contextKey() === 'public_report' &&
        this.publicToken()?.trim() &&
        this.itemReferenceId()?.trim()
      ),
    );
  }
}
