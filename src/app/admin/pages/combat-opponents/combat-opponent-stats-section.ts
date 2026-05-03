import { Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { AdminReasonPresetField } from '../../components/admin-reason-preset-field/admin-reason-preset-field';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { CombatOpponentStatActionsState } from './combat-opponent-stat-actions.state';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponent-stats-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    AdminReasonPresetField,
    AdminSectionIntro,
  ],
  templateUrl: './combat-opponent-stats-section.html',
})
export class CombatOpponentStatsSection {
  readonly page = inject(CombatOpponentsPageState);
  readonly actions = inject(CombatOpponentStatActionsState);

  constructor() {
    effect(() => this.actions.syncRows(this.page.statGridRows()));
  }
}
