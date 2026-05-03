import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { LEVEL_UP_STAT_BONUSES_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { LevelUpStatBonusesPageState } from './level-up-stat-bonuses-page.state';

@Component({
  selector: 'app-level-up-stat-bonuses-page',
  standalone: true,
  imports: [
    AdminTagLinks,
    LoadingOverlay,
    MessageModule,
    TableModule,
    TagModule,
  ],
  providers: [LevelUpStatBonusesPageState],
  templateUrl: './level-up-stat-bonuses-page.html',
})
export class LevelUpStatBonusesPage implements OnInit {
  readonly page = inject(LevelUpStatBonusesPageState);
  readonly links = LEVEL_UP_STAT_BONUSES_PAGE_LINKS;

  ngOnInit(): void {
    this.page.load();
  }
}
