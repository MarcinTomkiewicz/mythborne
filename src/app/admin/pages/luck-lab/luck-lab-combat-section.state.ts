import { Injectable, computed, effect, inject } from '@angular/core';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import {
  combatRngValueText,
  toCombatRngSurfaceRows,
} from './luck-lab-combat-rows';
import { LuckLabCombatComparisonState } from './luck-lab-combat-comparison.state';

@Injectable()
export class LuckLabCombatSectionState {
  private readonly lab = inject(LuckLabState);
  private readonly comparison = inject(LuckLabCombatComparisonState);
  private isLoaded = false;

  readonly preview = computed(() => this.lab.result().combatPreview);
  readonly rows = computed(() => toCombatRngSurfaceRows(this.preview()));
  readonly valueText = combatRngValueText;
  readonly isLoading = computed(() => this.lab.loadingBySection().combat);
  readonly error = computed(() => this.lab.errorsBySection().combat);
  readonly comparisonRows = computed(() => this.comparison.rows());
  readonly isComparisonLoading = computed(() => this.comparison.isLoading());
  readonly comparisonError = computed(() => this.comparison.error());

  constructor() {
    effect(() => {
      const input = this.lab.input();
      input.luckValue;

      if (this.isLoaded) {
        this.comparison.schedule(input);
      }
    });
  }

  load(): void {
    this.isLoaded = true;
    this.comparison.reload(this.lab.input());
  }
}
