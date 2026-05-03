import { Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { CombatOpponentDefinitionActionsState } from './combat-opponent-definition-actions.state';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponent-definition-section',
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
  templateUrl: './combat-opponent-definition-section.html',
})
export class CombatOpponentDefinitionSection {
  readonly page = inject(CombatOpponentsPageState);
  readonly actions = inject(CombatOpponentDefinitionActionsState);

  constructor() {
    effect(() => {
      this.page.selectedOpponentId();
      this.page.data();
      this.actions.syncForm();
    });
  }
}
