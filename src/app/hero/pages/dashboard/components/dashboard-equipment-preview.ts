import { Component, input } from '@angular/core';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';
import { EquipmentPreview } from '../../../../shared/equipment-preview/equipment-preview';

@Component({
  selector: 'app-dashboard-equipment-preview',
  standalone: true,
  imports: [EquipmentPreview],
  host: { class: 'd-block w-100' },
  templateUrl: './dashboard-equipment-preview.html',
})
export class DashboardEquipmentPreview {
  readonly page = input.required<DashboardPageFacade>();
  readonly compact = input(false);
}
