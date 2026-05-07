import { Injectable, inject, signal } from '@angular/core';
import { EquipmentSlot } from '../../domain/item/item-equipment.model';
import { HeroDerivedStats } from '../hero/hero-derived-stats';
import { PlayerEquipment } from './player-equipment';

@Injectable()
export class ArmoryPageFacade {
  private readonly heroDerivedStats = inject(HeroDerivedStats);
  private readonly equipment = inject(PlayerEquipment);

  readonly heroLuck = signal(0);
  readonly equipmentSlots = signal<EquipmentSlot[]>([]);

  loadData(): void {
    this.heroDerivedStats.resolveActiveHeroDerivedStats().subscribe((derived) => {
      this.heroLuck.set(derived.luck ?? 0);
    });
    this.equipment.getEquipmentSlots().subscribe((slots) => {
      this.equipmentSlots.set(slots);
    });
  }
}

