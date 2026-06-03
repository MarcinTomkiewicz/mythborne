import { Component, computed, input } from '@angular/core';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';
import { originPaperdollImageUrl } from '../../../../core/utils/origin-mappers';
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
  readonly paperdollImageUrl = computed(() => {
    return originPaperdollImageUrl(this.page().origin()?.key) ?? '/images/warrior.png';
  });
}
