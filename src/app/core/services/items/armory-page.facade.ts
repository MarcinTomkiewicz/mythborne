import { Injectable, inject, signal } from '@angular/core';
import { EquipmentSlot } from '../../domain/item/item-equipment.model';
import { HeroDashboardRuntimeStats } from '../hero/hero-dashboard-runtime-stats';
import { PlayerEquipment } from './player-equipment';

@Injectable()
export class ArmoryPageFacade {
  private readonly runtimeStats = inject(HeroDashboardRuntimeStats);
  private readonly equipment = inject(PlayerEquipment);

  readonly heroLuck = signal(0);
  readonly equipmentSlots = signal<EquipmentSlot[]>([]);

  loadData(): void {
    this.runtimeStats.getActiveHeroRuntimeStats().subscribe((stats) => {
      this.heroLuck.set(stats.luck);
    });
    this.equipment.getEquipmentSlots().subscribe((slots) => {
      this.equipmentSlots.set(slots);
    });
  }
}

