import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import {
  ItemDetailPopoverCopy,
  ItemDetailPopoverViewModel,
} from '../../core/domain/item/item-detail-popover.model';
import { ItemDetailPopoverDetailReadModel } from '../../core/domain/item/item-detail-popover-detail.model';
import { ItemDetailReader } from '../../core/services/items/item-detail-reader';
import { itemDetailPopoverViewModel } from '../../core/utils/item-detail-popover-mappers';
import { replaceTemplateTokens } from '../../core/utils/token-template';

@Component({
  selector: 'app-item-detail-popover',
  standalone: true,
  imports: [ButtonModule, Popover],
  templateUrl: './item-detail-popover.html',
})
export class ItemDetailPopover {
  private readonly reader = inject(ItemDetailReader);
  private readonly destroyRef = inject(DestroyRef);
  private requestId = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private loadingItemId: string | null = null;

  readonly copy = input.required<ItemDetailPopoverCopy>();
  readonly itemId = input<string | null>(null);
  readonly fallbackName = input<string | null>(null);
  readonly contextSourceLabel = input<string | null>(null);
  readonly capturedAt = input<string | null>(null);
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

    if (detail && detail.itemId === itemId) {
      return itemDetailPopoverViewModel(detail, this.context());
    }

    return {
      itemId,
      name: this.fallbackName() ?? '',
      description: null,
      statusLabel: null,
      headerMetaLabels: [],
      iconClass: 'pi pi-box',
      valueDisplay: null,
      itemStats: [],
      modifierRows: [],
      requirementRows: [],
      requirementState: null,
      context: this.context(),
      isLoading: this.status() === 'loading',
      error: this.playerSafeError(),
    };
  });

  openFromPointer(event: Event, popover: Popover): void {
    this.open(event, popover);
  }

  openFromFocus(event: Event, popover: Popover): void {
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
      && this.loadedDetail()?.itemId === itemId
    ) {
      return;
    }

    if (
      this.status() === 'loading'
      && this.loadingItemId === itemId
    ) {
      return;
    }

    if (!itemId?.trim()) {
      this.loadedDetail.set(null);
      this.status.set('error');
      this.error.set(this.copy().unavailableLabel);
      this.loadingItemId = null;
      return;
    }

    const requestId = ++this.requestId;
    this.loadingItemId = itemId;
    this.status.set('loading');
    this.error.set(null);
    this.loadedDetail.set(null);

    this.reader.readItemDetail(itemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          if (requestId !== this.requestId || itemId !== this.itemId()) {
            return;
          }

          this.loadedDetail.set(detail);
          this.status.set('loaded');
          this.loadingItemId = null;
        },
        error: () => {
          if (requestId !== this.requestId || itemId !== this.itemId()) {
            return;
          }

          this.loadedDetail.set(null);
          this.status.set('error');
          this.error.set(this.copy().unavailableLabel);
          this.loadingItemId = null;
        },
      });
  }

  triggerText(): string {
    return this.triggerLabel() ?? this.copy().triggerLabel;
  }

  triggerAriaLabel(name: string): string {
    return replaceTemplateTokens(this.copy().triggerAriaLabelTemplate, {
      itemName: name,
    });
  }

  private playerSafeError(): string | null {
    if (this.status() !== 'error') {
      return null;
    }

    return this.error() ?? this.copy().unavailableLabel;
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

  private context() {
    return {
      kind: 'current' as const,
      label: null,
      capturedAt: this.capturedAt(),
      sourceLabel: this.contextSourceLabel(),
    };
  }
}
