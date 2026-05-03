import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponent-usage-section',
  standalone: true,
  imports: [TableModule, AdminSectionIntro],
  templateUrl: './combat-opponent-usage-section.html',
})
export class CombatOpponentUsageSection {
  readonly page = inject(CombatOpponentsPageState);
}
