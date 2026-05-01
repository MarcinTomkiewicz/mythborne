import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ExplorationLabPageState } from './exploration-lab-page.state';

@Component({
  selector: 'app-exploration-lab-simulation-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    SelectModule,
    TableModule,
  ],
  templateUrl: './exploration-lab-simulation-section.html',
})
export class ExplorationLabSimulationSection {
  readonly page = inject(ExplorationLabPageState);
}
