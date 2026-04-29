import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';

@Component({
  selector: 'app-building-preview-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './building-preview-section.html',
})
export class BuildingPreviewSection {
  readonly page = input.required<BuildingsPageFacade>();
}
