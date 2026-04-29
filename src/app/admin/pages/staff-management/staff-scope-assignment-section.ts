import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { StaffPermissionScope } from '../../../core/domain/staff/staff-management.model';
import { StaffScopeAssignmentActions } from '../../../core/services/staff/staff-scope-assignment.actions';
import { MetadataDisplay } from '../../../shared/metadata-display/metadata-display';

@Component({
  selector: 'app-staff-scope-assignment-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    MessageModule,
    MetadataDisplay,
  ],
  templateUrl: './staff-scope-assignment-section.html',
})
export class StaffScopeAssignmentSection {
  readonly scopeAssignment = input.required<StaffScopeAssignmentActions>();
  readonly permissionScopes = input.required<readonly StaffPermissionScope[]>();
  readonly saveScopes = output<void>();
}
