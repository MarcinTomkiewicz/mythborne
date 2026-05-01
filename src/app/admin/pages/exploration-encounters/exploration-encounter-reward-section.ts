import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ExplorationEncounterRewardActionsState } from './exploration-encounter-reward-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounter-reward-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './exploration-encounter-reward-section.html',
})
export class ExplorationEncounterRewardSection {
  readonly page = inject(ExplorationEncountersPageState);
  readonly rewardActions = inject(ExplorationEncounterRewardActionsState);
}
