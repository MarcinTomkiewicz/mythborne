import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { StaffManagementPageFacade } from '../../../core/services/staff/staff-management-page.facade';

@Component({
  selector: 'app-staff-candidate-section',
  standalone: true,
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule],
  templateUrl: './staff-candidate-section.html',
})
export class StaffCandidateSection {
  readonly page = inject(StaffManagementPageFacade);
}
