import { Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { CombatOpponentFamilyActionsState } from './combat-opponent-family-actions.state';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponent-family-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    AdminSectionIntro,
  ],
  templateUrl: './combat-opponent-family-section.html',
})
export class CombatOpponentFamilySection {
  readonly page = inject(CombatOpponentsPageState);
  readonly actions = inject(CombatOpponentFamilyActionsState);

  constructor() {
    effect(() => {
      this.page.selectedFamilyKey();
      this.page.data();
      this.actions.syncForm();
    });
  }
}
