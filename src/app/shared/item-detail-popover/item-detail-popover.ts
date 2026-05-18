import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { ArmoryItemDetailReadModel } from '../../core/domain/item/item-equipment.model';
import {
  ItemDetailPopoverSnapshotKind,
  ItemDetailPopoverValueRow,
  ItemDetailPopoverViewModel,
} from '../../core/domain/item/item-detail-popover.model';
import { ItemDetailReader } from '../../core/services/items/item-detail-reader';
import {
  armoryDetailPopover,
  partialItemPopover,
} from '../../core/utils/item-detail-popover-mappers';

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

  readonly itemId = input<string | null>(null);
  readonly fallbackName = input('Item');
  readonly description = input<string | null>(null);
  readonly statusLabel = input<string | null>(null);
  readonly qualityLabel = input<string | null>(null);
  readonly kindLabel = input<string | null>(null);
  readonly slotLabel = input<string | null>(null);
  readonly iconClass = input<string>('pi pi-chest');
  readonly drachmaValue = input<number | null>(null);
  readonly detailLines = input<readonly string[]>([]);
  readonly contextKind = input<ItemDetailPopoverSnapshotKind>('current');
  readonly contextLabel = input('Current item');
  readonly contextSourceLabel = input<string | null>(null);
  readonly capturedAt = input<string | null>(null);
  readonly detailMode = input<'auto' | 'full' | 'partial'>('auto');
  readonly triggerLabel = input('Details');
  readonly triggerIcon = input<string | null>(null);
  readonly triggerSeverity = input<'secondary' | 'info' | 'success' | 'warn' | 'danger'>('secondary');
  readonly triggerOutlined = input(false);
  readonly buttonTrigger = input(true);
  readonly triggerFullWidth = input(false);
  readonly status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly loadedDetail = signal<ArmoryItemDetailReadModel | null>(null);
  readonly item = computed<ItemDetailPopoverViewModel>(() => {
    const detail = this.loadedDetail();
    const itemId = this.itemId();

    if (this.shouldReadFullDetail() && detail && detail.itemId === itemId) {
      return armoryDetailPopover(detail, this.context());
    }

    return partialItemPopover({
      itemId,
      name: this.fallbackName(),
      description: this.description(),
      statusLabel: this.statusLabel(),
      qualityLabel: this.qualityLabel(),
      kindLabel: this.kindLabel(),
      slotLabel: this.slotLabel(),
      iconClass: this.iconClass(),
      drachmaValue: this.drachmaValue(),
      detailRows: this.partialRows(),
      context: this.context(),
      isLoading: this.shouldReadFullDetail() && this.status() === 'loading',
      error: this.playerSafeError(),
    });
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
    if (this.shouldReadFullDetail()) {
      this.loadDetail();
    }
    popover.show(event);
  }

  rowCode(label: string): string {
    return label
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 3) || 'IT';
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
      this.error.set('Full item detail unavailable.');
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
          this.error.set('Full item detail unavailable.');
          this.loadingItemId = null;
        },
      });
  }

  private shouldReadFullDetail(): boolean {
    const mode = this.detailMode();

    if (mode === 'full') {
      return true;
    }

    if (mode === 'partial') {
      return false;
    }

    return this.contextKind() === 'current' || this.contextKind() === 'reward_item';
  }

  private partialRows(): ItemDetailPopoverValueRow[] {
    return this.detailLines().map((line, index) => ({
      key: `detail-${index}`,
      label: line,
      displayValue: '',
      valueParts: [],
      sourceLabel: null,
      isBoosted: false,
      valueTone: 'neutral',
    }));
  }

  private playerSafeError(): string | null {
    if (this.status() !== 'error') {
      return null;
    }

    return this.error() ?? 'Full item detail unavailable.';
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
      kind: this.contextKind(),
      label: this.contextLabel(),
      capturedAt: this.capturedAt(),
      sourceLabel: this.contextSourceLabel(),
    };
  }
}
