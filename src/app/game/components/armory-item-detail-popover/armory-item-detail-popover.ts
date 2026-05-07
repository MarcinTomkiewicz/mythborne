import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import {
  ArmoryItemDetailReadModel,
  ArmoryItemSummary,
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerArmory } from '../../../core/services/items/player-armory';

type DetailStatus = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-armory-item-detail-popover',
  standalone: true,
  imports: [ButtonModule, Popover],
  template: `
    @let detail = currentDetail();
    @let displayName = detail?.name ?? itemName();

    <button
      pButton
      type="button"
      severity="secondary"
      size="small"
      label="Details"
      [attr.aria-label]="'Show item details for ' + displayName"
      (click)="open($event, popover)"
    ></button>

    <p-popover #popover>
      <article class="flex-col gap-md min-w-0 max-w-350" [attr.aria-label]="displayName + ' details'">
        <header class="flex-col gap-xs">
          <strong class="heading-color">{{ displayName }}</strong>
          @if (status() === 'loading') {
            <span class="muted-text">Loading item detail...</span>
          }
          @if (status() === 'error') {
            <span class="status-text-warning">{{ error() ?? 'Item detail could not be loaded.' }}</span>
          }
        </header>

        <section class="flex-col gap-xs">
          <strong class="heading-color">Value</strong>
          @if (drachmaValue() !== null) {
            <div class="flex-row-between-center gap-sm">
              <span class="muted-text">Drachma</span>
              <strong>{{ drachmaValue() }} drachma</strong>
            </div>
          } @else {
            <span class="muted-text">No value returned.</span>
          }
        </section>

        <section class="flex-col gap-xs">
          <strong class="heading-color">Item stats</strong>
          @if (itemStats().length) {
            @for (stat of itemStats(); track $index) {
              <div class="flex-row-between-center gap-sm">
                <span class="muted-text">{{ stat.label }}</span>
                <strong>{{ stat.displayValue }}</strong>
              </div>
            }
          } @else {
            <span class="muted-text">No item stats returned.</span>
          }
        </section>

        <section class="flex-col gap-xs">
          <strong class="heading-color">Bonuses</strong>
          @if (bonuses().length) {
            @for (bonus of bonuses(); track $index) {
              <div class="flex-row-between-center gap-sm">
                <span class="muted-text">{{ bonus.label }}</span>
                <strong>{{ bonus.displayValue }}</strong>
              </div>
            }
          } @else {
            <span class="muted-text">No bonuses returned.</span>
          }
        </section>
      </article>
    </p-popover>
  `,
})
export class ArmoryItemDetailPopover {
  private readonly armory = inject(PlayerArmory);
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private requestId = 0;

  readonly item = input.required<ArmoryItemSummary | EquippedItemSummary>();
  readonly status = signal<DetailStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly loadedDetail = signal<ArmoryItemDetailReadModel | null>(null);
  readonly currentDetail = computed(() => {
    const detail = this.loadedDetail();

    return detail?.itemId === this.item().itemId ? detail : null;
  });
  readonly itemStats = computed(() => this.currentDetail()?.itemStats ?? []);
  readonly bonuses = computed(() => this.currentDetail()?.bonuses ?? []);
  readonly drachmaValue = computed(() =>
    this.currentDetail()?.drachmaValue ?? itemDrachmaValue(this.item()),
  );

  itemName(): string {
    const item = this.item();

    return 'itemName' in item ? item.itemName : item.name;
  }

  open(event: Event, popover: Popover): void {
    this.loadDetail();
    popover.toggle(event);
  }

  private loadDetail(): void {
    const itemId = this.item().itemId;
    const requestId = ++this.requestId;
    const contextKey = contextKeyValue(this.activeHero.state());

    this.status.set('loading');
    this.error.set(null);

    this.armory.getArmoryItemDetail(itemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          if (!this.acceptsResponse(requestId, itemId, contextKey)) {
            return;
          }

          this.loadedDetail.set(detail);
          this.status.set('loaded');
        },
        error: (error: unknown) => {
          if (!this.acceptsResponse(requestId, itemId, contextKey)) {
            return;
          }

          this.loadedDetail.set(null);
          this.status.set('error');
          this.error.set(
            error instanceof Error ? error.message : 'Failed to load item detail.',
          );
        },
      });
  }

  private acceptsResponse(
    requestId: number,
    itemId: string,
    contextKey: string | null,
  ): boolean {
    return requestId === this.requestId
      && itemId === this.item().itemId
      && contextKey === contextKeyValue(this.activeHero.state());
  }
}

function contextKeyValue(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.serverId && state.heroId ? `${state.serverId}:${state.heroId}` : null;
}

function itemDrachmaValue(
  item: ArmoryItemSummary | EquippedItemSummary,
): number | null {
  return 'drachmaValue' in item ? item.drachmaValue : null;
}
