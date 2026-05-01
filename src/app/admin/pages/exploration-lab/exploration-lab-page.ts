import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { EXPLORATION_LAB_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { ExplorationLabChanceSection } from './exploration-lab-chance-section';
import { ExplorationLabPageState } from './exploration-lab-page.state';
import { ExplorationLabRewardSection } from './exploration-lab-reward-section';
import { ExplorationLabSimulationSection } from './exploration-lab-simulation-section';

@Component({
  selector: 'app-exploration-lab-page',
  standalone: true,
  imports: [
    MessageModule,
    AdminTagLinks,
    ExplorationLabChanceSection,
    ExplorationLabRewardSection,
    ExplorationLabSimulationSection,
    LoadingOverlay,
  ],
  providers: [
    ExplorationDefinitionsState,
    ExplorationLabPageState,
  ],
  templateUrl: './exploration-lab-page.html',
})
export class ExplorationLabPage implements OnInit {
  readonly page = inject(ExplorationLabPageState);
  readonly links = EXPLORATION_LAB_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
