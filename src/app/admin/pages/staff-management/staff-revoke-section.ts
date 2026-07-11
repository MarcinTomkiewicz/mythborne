import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { StaffManagementPageFacade } from '../../../core/services/staff/staff-management-page.facade';

@Component({
  selector: 'app-staff-revoke-section',
  standalone: true,
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './staff-revoke-section.html',
})
export class StaffRevokeSection {
  readonly page = inject(StaffManagementPageFacade);
}
