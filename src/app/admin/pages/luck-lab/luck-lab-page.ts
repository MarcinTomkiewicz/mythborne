import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { LUCK_LAB_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { LuckLabAutoResolveSection } from './luck-lab-auto-resolve-section';
import { LuckLabComparisonState } from './luck-lab-comparison.state';
import { LuckLabPageState } from './luck-lab-page.state';
import { LuckLabTrialChanceSection } from './luck-lab-trial-chance-section';
import { LuckLabTrialPowerSection } from './luck-lab-trial-power-section';

@Component({
  selector: 'app-luck-lab-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    MessageModule,
    SelectModule,
    SliderModule,
    AdminServerSwitcher,
    AdminTagLinks,
    LuckLabAutoResolveSection,
    LuckLabTrialChanceSection,
    LuckLabTrialPowerSection,
    LoadingOverlay,
  ],
  providers: [
    ExplorationDefinitionsState,
    LuckLabState,
    LuckLabComparisonState,
    LuckLabPageState,
  ],
  templateUrl: './luck-lab-page.html',
})
export class LuckLabPage implements OnInit {
  readonly page = inject(LuckLabPageState);
  readonly links = LUCK_LAB_PAGE_LINKS;

  ngOnInit(): void {
    this.page.load();
  }
}
