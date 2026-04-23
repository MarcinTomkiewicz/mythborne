import { Injectable, inject, signal } from '@angular/core';
import { Hero } from '../hero/hero';

@Injectable()
export class ArmoryPageFacade {
  private readonly heroService = inject(Hero);

  readonly heroLuck = signal(0);

  loadData(): void {
    this.heroService.getHeroDerived().subscribe((derived) => {
      this.heroLuck.set(derived.luck ?? 0);
    });
  }
}

