import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { REPORTS_CENTER_FILTER_GROUPS } from '../../../core/configs/reports-center-filter-groups.config';
import {
  ReportsCenterFilterOptionsCopy,
  ReportsCenterFiltersCopy,
} from '../../../core/domain/reports/reports-center-copy.model';
import {
  ReportsCenterCapabilities,
  ReportsCenterFilterOptionView,
  ReportsCenterFilters,
} from '../../../core/domain/reports/reports-center.model';
import { ReportsCenterFilterGroupConfig } from '../../../core/interfaces/reports-center-filter-group-config.interface';

@Component({
  selector: 'app-report-filters-panel',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  templateUrl: './report-filters-panel.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportFiltersPanel {
  readonly filterGroups = REPORTS_CENTER_FILTER_GROUPS;

  readonly copy = input.required<ReportsCenterFiltersCopy>();
  readonly filterOptionsCopy = input.required<ReportsCenterFilterOptionsCopy>();
  readonly filters = input.required<ReportsCenterFilters>();
  readonly capabilities = input.required<ReportsCenterCapabilities['filters']>();
  readonly filterForm = input.required<FormGroup>();
  readonly isLoading = input.required<boolean>();
  readonly apply = output<void>();

  selectFilter(group: ReportsCenterFilterGroupConfig, key: string): void {
    this.filterForm().get(group.controlName)?.setValue(key);
    this.apply.emit();
  }

  changeSelectFilter(): void {
    this.apply.emit();
  }

  isFilterSelected(group: ReportsCenterFilterGroupConfig, key: string): boolean {
    return this.filterForm().get(group.controlName)?.value === key;
  }

  isFilterAvailable(group: ReportsCenterFilterGroupConfig): boolean {
    return this.capabilities()[group.capabilityKey];
  }

  filterOptions(group: ReportsCenterFilterGroupConfig): readonly ReportsCenterFilterOptionView[] {
    return this.filters().options[group.optionsKey].map((option) => ({
      key: option.key,
      label: this.filterOptionLabel(group, option.key),
      enabled: option.enabled,
      disabled: !option.enabled,
    }));
  }

  selectOptions(
    group: ReportsCenterFilterGroupConfig,
  ): ReportsCenterFilterOptionView[] {
    return [...this.filterOptions(group)];
  }

  filterLabel(group: ReportsCenterFilterGroupConfig): string {
    return this.copy()[group.copyLabelKey];
  }

  private filterOptionLabel(
    group: ReportsCenterFilterGroupConfig,
    key: string,
  ): string {
    const label = this.filterOptionsCopy()[group.optionsKey][key];

    if (!label) {
      throw new Error(`reportsCenter.filterOptions.${group.optionsKey}.${key} is missing.`);
    }

    return label;
  }
}
