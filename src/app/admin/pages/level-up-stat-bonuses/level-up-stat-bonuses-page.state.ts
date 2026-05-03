import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LevelUpStatBonusAdminData } from '../../../core/domain/progression/level-up-stat-bonus.model';
import { LevelUpStatBonuses } from '../../../core/services/progression/level-up-stat-bonuses';
import { getErrorMessage } from '../../../core/utils/error-message';

const EMPTY_DATA: LevelUpStatBonusAdminData = {
  rules: [],
  ruleStats: [],
  ruleViews: [],
};

@Injectable()
export class LevelUpStatBonusesPageState {
  private readonly service = inject(LevelUpStatBonuses);

  readonly data = signal<LevelUpStatBonusAdminData>(EMPTY_DATA);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeRuleCount = computed(() =>
    this.data().rules.filter((rule) => rule.isActive).length
  );
  readonly fixedRuleCount = computed(() =>
    this.data().rules.filter((rule) => rule.ruleDisplayKind === 'fixed_stat').length
  );
  readonly randomRuleCount = computed(() =>
    this.data().rules.filter((rule) => rule.ruleDisplayKind === 'random_pool').length
  );

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getAdminData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.data.set(data),
        error: (error: unknown) => {
          this.error.set(getErrorMessage(error, 'Failed to load level-up stat bonus rules.'));
        },
      });
  }
}
