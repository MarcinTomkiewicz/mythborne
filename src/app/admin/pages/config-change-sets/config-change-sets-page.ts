import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfigChangeSetsPageFacade } from '../../../core/services/config/config-change-sets-page.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { CONFIG_CHANGE_SETS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

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
  templateUrl: './config-change-sets-page.html',
})
export class ConfigChangeSetsPage extends ConfigChangeSetsPageFacade implements OnInit {
  readonly links = CONFIG_CHANGE_SETS_PAGE_LINKS;

  ngOnInit(): void {
    this.loadData();
  }
}
