import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { StaffManagementPageFacade } from '../../../core/services/staff/staff-management-page.facade';

@Component({
  selector: 'app-staff-assignment-section',
  standalone: true,
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule, SelectModule],
  templateUrl: './staff-assignment-section.html',
})
export class StaffAssignmentSection {
  readonly page = inject(StaffManagementPageFacade);
}
