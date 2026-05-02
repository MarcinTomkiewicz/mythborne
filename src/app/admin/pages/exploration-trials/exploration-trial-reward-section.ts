import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { ExplorationTrialRewardActionsState } from './exploration-trial-reward-actions.state';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

@Component({
  selector: 'app-exploration-trial-reward-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminSectionIntro,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './exploration-trial-reward-section.html',
})
export class ExplorationTrialRewardSection {
  readonly page = inject(ExplorationTrialsPageState);
  readonly actions = inject(ExplorationTrialRewardActionsState);
}
