import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CombatCommonCopy } from '../../../../core/domain/combat/combat-common-copy.model';
import { CombatSourcePresentation } from '../../../../core/domain/combat/combat-source-presentation.model';
import { PvpActionCopy } from '../../../../core/domain/pvp/pvp-action-copy.model';
import { PvpCombatCopy } from '../../../../core/domain/pvp/pvp-combat-copy.model';
import {
  pvpCombatSourcePresentationWithKeyFallbacks,
} from '../../../../core/domain/pvp/pvp-combat-source-presentation.mapper';
import { GameCopy } from '../../../../core/services/game-copy/game-copy';

@Injectable({ providedIn: 'root' })
export class PvpCombatCopyState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopy);

  readonly combatCommonCopy = signal<CombatCommonCopy | null>(null);
  readonly pvpCombatCopy = signal<PvpCombatCopy | null>(null);

  constructor() {
    this.load();
  }

  sourcePresentation(actionCopy: PvpActionCopy): CombatSourcePresentation {
    return pvpCombatSourcePresentationWithKeyFallbacks(
      actionCopy,
      this.combatCommonCopy(),
      this.pvpCombatCopy(),
    );
  }

  private load(): void {
    this.gameCopy.getCopy('player.combat.common', { locale: 'pl' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (copy) => {
          this.combatCommonCopy.set(copy);
        },
        error: () => {
          this.combatCommonCopy.set(null);
        },
      });

    this.gameCopy.getCopy('player.pvp.combat', { locale: 'pl' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (copy) => {
          this.pvpCombatCopy.set(copy);
        },
        error: () => {
          this.pvpCombatCopy.set(null);
        },
      });
  }
}
