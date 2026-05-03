import { Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { CombatOpponentEquipmentActionsState } from './combat-opponent-equipment-actions.state';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponent-equipment-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, AdminSectionIntro],
  templateUrl: './combat-opponent-equipment-section.html',
})
export class CombatOpponentEquipmentSection {
  readonly page = inject(CombatOpponentsPageState);
  readonly actions = inject(CombatOpponentEquipmentActionsState);

  constructor() {
    effect(() => {
      this.page.selectedEquipmentEntryId();
      this.page.data();
      this.actions.syncForm();
    });
  }
}
