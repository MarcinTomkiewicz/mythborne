import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { REPORTS_CENTER_FILTER_GROUPS } from '../../../core/configs/reports-center-filter-groups.config';
import { ReportsCenterFiltersCopy } from '../../../core/domain/reports/reports-center-copy.model';
import {
  ReportsCenterCapabilitiesV1,
  ReportsCenterFilterOption,
  ReportsCenterFiltersV1,
} from '../../../core/domain/reports/reports-center.model';
import { ReportsCenterFilterGroupConfig } from '../../../core/interfaces/reports-center-filter-group-config.interface';

@Component({
  selector: 'app-report-filters-panel',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
  ],
  templateUrl: './report-filters-panel.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportFiltersPanel {
  readonly filterGroups = REPORTS_CENTER_FILTER_GROUPS;

  readonly copy = input.required<ReportsCenterFiltersCopy>();
  readonly filters = input.required<ReportsCenterFiltersV1>();
  readonly capabilities = input.required<ReportsCenterCapabilitiesV1['filters']>();
  readonly filterForm = input.required<FormGroup>();
  readonly isLoading = input.required<boolean>();
  readonly apply = output<void>();

  selectFilter(group: ReportsCenterFilterGroupConfig, key: string): void {
    this.filterForm().get(group.controlName)?.setValue(key);
    this.apply.emit();
  }

  isFilterSelected(group: ReportsCenterFilterGroupConfig, key: string): boolean {
    return this.filterForm().get(group.controlName)?.value === key;
  }

  isFilterAvailable(group: ReportsCenterFilterGroupConfig): boolean {
    return this.capabilities()[group.capabilityKey];
  }

  filterOptions(group: ReportsCenterFilterGroupConfig): readonly ReportsCenterFilterOption[] {
    return this.filters().options[group.optionsKey];
  }

  filterLabel(group: ReportsCenterFilterGroupConfig): string {
    return this.copy()[group.copyLabelKey];
  }
}
