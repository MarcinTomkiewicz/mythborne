import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { STAFF_MANAGEMENT_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { StaffAssignmentDraftActions } from '../../../core/services/staff/staff-assignment-draft.actions';
import { StaffAssignmentListState } from '../../../core/services/staff/staff-assignment-list.state';
import { StaffCandidateSearchState } from '../../../core/services/staff/staff-candidate-search.state';
import { StaffManagementPageFacade } from '../../../core/services/staff/staff-management-page.facade';
import { StaffRevokeActions } from '../../../core/services/staff/staff-revoke.actions';

@Component({
  selector: 'app-staff-management-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    LoadingOverlay,
    AdminServerSwitcher,
    AdminTagLinks,
  ],
  providers: [
    StaffManagementPageFacade,
    StaffCandidateSearchState,
    StaffAssignmentListState,
    StaffAssignmentDraftActions,
    StaffRevokeActions,
  ],
  templateUrl: './staff-management-page.html',
})
export class StaffManagementPage implements OnInit {
  readonly page = inject(StaffManagementPageFacade);
  readonly links = STAFF_MANAGEMENT_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
