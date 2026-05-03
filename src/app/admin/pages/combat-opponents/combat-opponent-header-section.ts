import { Component, inject, input } from '@angular/core';
import { AdminTagLink } from '../../../core/types/admin-ui.types';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { CombatOpponentsPageState } from './combat-opponents-page.state';

@Component({
  selector: 'app-combat-opponent-header-section',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks],
  templateUrl: './combat-opponent-header-section.html',
})
export class CombatOpponentHeaderSection {
  readonly page = inject(CombatOpponentsPageState);
  readonly links = input.required<readonly AdminTagLink[]>();
}
