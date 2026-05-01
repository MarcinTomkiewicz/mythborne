import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

@Component({
  selector: 'app-exploration-trials-list-section',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, TableModule, TagModule],
  templateUrl: './exploration-trials-list-section.html',
})
export class ExplorationTrialsListSection {
  readonly page = inject(ExplorationTrialsPageState);
}
