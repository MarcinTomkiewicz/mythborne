import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { STAFF_MANAGEMENT_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { StaffAssignmentDraftActions } from '../../../core/services/staff/staff-assignment-draft.actions';
import { StaffAssignmentListState } from '../../../core/services/staff/staff-assignment-list.state';
import { StaffCandidateSearchState } from '../../../core/services/staff/staff-candidate-search.state';
import { StaffManagementPageFacade } from '../../../core/services/staff/staff-management-page.facade';
import { StaffRevokeActions } from '../../../core/services/staff/staff-revoke.actions';
import { StaffScopeAssignmentActions } from '../../../core/services/staff/staff-scope-assignment.actions';
import { StaffScopeAssignmentSection } from './staff-scope-assignment-section';
import { StaffAssignmentSection } from './staff-assignment-section';
import { StaffCandidateSection } from './staff-candidate-section';
import { StaffListSection } from './staff-list-section';
import { StaffRevokeSection } from './staff-revoke-section';

@Component({
  selector: 'app-staff-management-page',
  standalone: true,
  imports: [
    MessageModule,
    LoadingOverlay,
    AdminServerSwitcher,
    AdminTagLinks,
    StaffScopeAssignmentSection,
    StaffAssignmentSection,
    StaffCandidateSection,
    StaffListSection,
    StaffRevokeSection,
  ],
  providers: [
    StaffManagementPageFacade,
    StaffCandidateSearchState,
    StaffAssignmentListState,
    StaffAssignmentDraftActions,
    StaffRevokeActions,
    StaffScopeAssignmentActions,
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
