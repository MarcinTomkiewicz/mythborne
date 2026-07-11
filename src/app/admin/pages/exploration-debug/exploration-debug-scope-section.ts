import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ExplorationDebugPageState } from './exploration-debug-page.state';

@Component({
  selector: 'app-exploration-debug-scope-section',
  standalone: true,
  imports: [AutoCompleteModule, ButtonModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './exploration-debug-scope-section.html',
})
export class ExplorationDebugScopeSection {
  readonly page = inject(ExplorationDebugPageState);
}
