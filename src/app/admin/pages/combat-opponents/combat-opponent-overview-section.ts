import { Component, inject } from '@angular/core';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponent-overview-section',
  standalone: true,
  imports: [AdminSectionIntro],
  templateUrl: './combat-opponent-overview-section.html',
})
export class CombatOpponentOverviewSection {
  readonly page = inject(CombatOpponentsPageState);
}
