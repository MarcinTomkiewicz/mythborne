import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { CONFIG_CHANGE_SETS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { ConfigChangeSetDraftActions } from './config-change-set-draft.actions';
import { ConfigChangeSetListDetailState } from './config-change-set-list-detail.state';
import { ConfigChangeSetWorkflowActions } from './config-change-set-workflow.actions';
import { ConfigChangeSetsPageFacade } from './config-change-sets-page.facade';
import { ConfigEffectiveValuesState } from './config-effective-values.state';
import { ConfigValueEntryDraftState } from './config-value-entry-draft.state';

@Component({
  selector: 'app-config-change-sets-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AdminTagLinks,
    AdminServerSwitcher,
    LoadingOverlay,
  ],
  providers: [
    ConfigChangeSetsPageFacade,
    ConfigChangeSetDraftActions,
    ConfigChangeSetListDetailState,
    ConfigChangeSetWorkflowActions,
    ConfigEffectiveValuesState,
    ConfigValueEntryDraftState,
  ],
  templateUrl: './config-change-sets-page.html',
})
export class ConfigChangeSetsPage extends ConfigChangeSetsPageFacade implements OnInit {
  readonly links = CONFIG_CHANGE_SETS_PAGE_LINKS;

  ngOnInit(): void {
    this.loadData();
  }
}
