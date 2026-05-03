import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { COMBAT_OPPONENTS_PAGE_LINKS } from '../../admin-navigation.config';
import { CombatOpponentAttackActionsState } from './combat-opponent-attack-actions.state';
import { CombatOpponentDefinitionActionsState } from './combat-opponent-definition-actions.state';
import { CombatOpponentEquipmentActionsState } from './combat-opponent-equipment-actions.state';
import { CombatOpponentFamilyActionsState } from './combat-opponent-family-actions.state';
import { CombatOpponentStatActionsState } from './combat-opponent-stat-actions.state';
import { CombatOpponentAttackSection } from './combat-opponent-attack-section';
import { CombatOpponentDefinitionSection } from './combat-opponent-definition-section';
import { CombatOpponentEquipmentSection } from './combat-opponent-equipment-section';
import { CombatOpponentFamilySection } from './combat-opponent-family-section';
import { CombatOpponentHeaderSection } from './combat-opponent-header-section';
import { CombatOpponentOverviewSection } from './combat-opponent-overview-section';
import { CombatOpponentStatsSection } from './combat-opponent-stats-section';
import { CombatOpponentUsageSection } from './combat-opponent-usage-section';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponents-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TextareaModule,
    LoadingOverlay,
    CombatOpponentHeaderSection,
    CombatOpponentOverviewSection,
    CombatOpponentFamilySection,
    CombatOpponentDefinitionSection,
    CombatOpponentStatsSection,
    CombatOpponentAttackSection,
    CombatOpponentEquipmentSection,
    CombatOpponentUsageSection,
  ],
  providers: [
    CombatOpponentsPageState,
    CombatOpponentFamilyActionsState,
    CombatOpponentDefinitionActionsState,
    CombatOpponentStatActionsState,
    CombatOpponentAttackActionsState,
    CombatOpponentEquipmentActionsState,
  ],
  templateUrl: './combat-opponents-page.html',
})
export class CombatOpponentsPage implements OnInit {
  readonly page = inject(CombatOpponentsPageState);
  readonly links = COMBAT_OPPONENTS_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
