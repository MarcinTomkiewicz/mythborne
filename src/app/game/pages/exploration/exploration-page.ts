import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationStartState } from './exploration-start.state';

@Component({
  selector: 'app-exploration-page',
  standalone: true,
  imports: [ButtonModule, MessageModule],
  providers: [
    ExplorationFeedbackState,
    ExplorationPreviewState,
    ExplorationOverviewState,
    ExplorationStartState,
    ExplorationPageState,
  ],
  templateUrl: './exploration-page.html',
})
export class ExplorationPage implements OnInit {
  readonly feedback = inject(ExplorationFeedbackState);
  readonly page = inject(ExplorationPageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
