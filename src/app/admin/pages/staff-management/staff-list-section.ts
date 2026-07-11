import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StaffManagementPageFacade } from '../../../core/services/staff/staff-management-page.facade';

@Component({
  selector: 'app-staff-list-section',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './staff-list-section.html',
})
export class StaffListSection {
  readonly page = inject(StaffManagementPageFacade);
}
