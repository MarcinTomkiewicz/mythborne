import { Injectable, inject, signal } from '@angular/core';
import { HeroDerivedStats } from '../hero/hero-derived-stats';

@Injectable()
export class ArmoryPageFacade {
  private readonly heroDerivedStats = inject(HeroDerivedStats);

  readonly heroLuck = signal(0);

  loadData(): void {
    this.heroDerivedStats.resolveActiveHeroDerivedStats().subscribe((derived) => {
      this.heroLuck.set(derived.luck ?? 0);
    });
  }
}

