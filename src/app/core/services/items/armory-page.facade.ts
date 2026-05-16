import { Injectable, inject, signal } from '@angular/core';
import { Origin } from '../../domain/origin/origin.model';
import { EquipmentSlot } from '../../domain/item/item-equipment.model';
import { HeroDashboardRuntimeStats } from '../hero/hero-dashboard-runtime-stats';
import { Hero } from '../hero/hero';
import { Origins } from '../origins/origins';
import { HeroEquipment } from './hero-equipment';

@Injectable()
export class ArmoryPageFacade {
  private readonly runtimeStats = inject(HeroDashboardRuntimeStats);
  private readonly equipment = inject(HeroEquipment);
  private readonly hero = inject(Hero);
  private readonly origins = inject(Origins);
  private loadToken = 0;

  readonly heroLuck = signal(0);
  readonly equipmentSlots = signal<EquipmentSlot[]>([]);
  readonly origin = signal<Origin | null>(null);

  loadData(): void {
    const token = ++this.loadToken;

    this.origin.set(null);

    this.runtimeStats.getActiveHeroRuntimeStats().subscribe((stats) => {
      if (token !== this.loadToken) {
        return;
      }

      this.heroLuck.set(stats.luck);
    });
    this.equipment.getEquipmentSlots().subscribe((slots) => {
      if (token !== this.loadToken) {
        return;
      }

      this.equipmentSlots.set(slots);
    });
    this.hero.getHeroData().subscribe((hero) => {
      if (token !== this.loadToken) {
        return;
      }

      if (!hero.origin_id) {
        this.origin.set(null);
        return;
      }

      this.origins.getOriginWithBonuses(hero.origin_id).subscribe(({ origin }) => {
        if (token !== this.loadToken) {
          return;
        }

        this.origin.set(origin);
      });
    });
  }
}

