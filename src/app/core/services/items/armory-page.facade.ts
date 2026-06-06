import { Injectable, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Origin } from '../../domain/origin/origin.model';
import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryLoadoutPresetReadModel,
  PlayerArmoryPageCopyReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
} from '../../domain/item/player-armory-page-context.model';
import { Json } from '../../types/database.types';
import { getErrorMessage } from '../../utils/error-message';
import { PlayerArmory } from './player-armory';

@Injectable()
export class ArmoryPageFacade {
  private readonly armory = inject(PlayerArmory);
  private loadToken = 0;

  readonly status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly context = signal<PlayerArmoryPageContextReadModel | null>(null);
  readonly readModel = signal<PlayerArmoryReadModel | null>(null);
  readonly copyJson = signal<PlayerArmoryPageCopyReadModel | null>(null);
  readonly loadoutPresets = signal<PlayerArmoryLoadoutPresetReadModel[]>([]);
  readonly runtimeDerivedStats = signal<Json | null>(null);
  readonly heroLuck = signal(0);
  readonly equipmentSlots = signal<PlayerArmoryEquipmentSlotReadModel[]>([]);
  readonly origin = signal<Origin | null>(null);

  loadData(): void {
    const token = ++this.loadToken;

    this.status.set('loading');
    this.error.set(null);
    this.context.set(null);
    this.readModel.set(null);
    this.copyJson.set(null);
    this.loadoutPresets.set([]);
    this.runtimeDerivedStats.set(null);
    this.equipmentSlots.set([]);
    this.origin.set(null);

    this.armory.getArmoryPageContext().subscribe({
      next: (context) => {
        if (token !== this.loadToken) {
          return;
        }

        this.context.set(context);
        this.readModel.set(context.readModel);
        this.copyJson.set(context.copyJson);
        this.equipmentSlots.set(context.equipmentSlots);
        this.loadoutPresets.set(context.loadoutPresets);
        this.runtimeDerivedStats.set(context.runtimeDerivedStats);
        this.status.set('loaded');
        this.hydrateMissingRequirementStatuses(context, token);
      },
      error: (error: unknown) => {
        if (token !== this.loadToken) {
          return;
        }

        this.context.set(null);
        this.readModel.set(null);
        this.copyJson.set(null);
        this.loadoutPresets.set([]);
        this.runtimeDerivedStats.set(null);
        this.status.set('error');
        this.error.set(getErrorMessage(error, 'Failed to load armory page context.'));
      },
    });
  }

  private hydrateMissingRequirementStatuses(
    context: PlayerArmoryPageContextReadModel,
    token: number,
  ): void {
    const items = context.readModel.visibleItems.filter((item) =>
      item.lifecycleStatusKey === 'active' && item.meetsRequirements == null
    );

    if (!items.length) {
      return;
    }

    forkJoin(
      items.map((item) =>
        this.armory.getItemRequirementPreviewForHero(context.heroId, item.itemId).pipe(
          map((preview) => ({
            itemId: item.itemId,
            meetsRequirements: preview?.meetsRequirements ?? null,
          })),
          catchError(() => of({
            itemId: item.itemId,
            meetsRequirements: null,
          })),
        )
      ),
    ).subscribe((statuses) => {
      if (token !== this.loadToken) {
        return;
      }

      const statusByItemId = new Map(
        statuses.map((status) => [status.itemId, status.meetsRequirements]),
      );
      const readModel = {
        ...context.readModel,
        shelves: context.readModel.shelves.map((shelf) => ({
          ...shelf,
          visibleItems: shelf.visibleItems.map((item) =>
            patchRequirementStatus(item, statusByItemId),
          ),
        })),
        visibleItems: context.readModel.visibleItems.map((item) =>
          patchRequirementStatus(item, statusByItemId),
        ),
      };
      const updatedContext = {
        ...context,
        readModel,
      };

      this.context.set(updatedContext);
      this.readModel.set(readModel);
    });
  }
}

function patchRequirementStatus(
  item: PlayerArmoryItemReadModel,
  statusByItemId: ReadonlyMap<string, boolean | null>,
): PlayerArmoryItemReadModel {
  return statusByItemId.has(item.itemId)
    ? {
        ...item,
        meetsRequirements: statusByItemId.get(item.itemId) ?? null,
      }
    : item;
}

