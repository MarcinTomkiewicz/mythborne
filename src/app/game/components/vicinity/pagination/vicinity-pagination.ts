import { Component, input, output } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import type { SelectItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-vicinity-pagination',
  standalone: true,
  imports: [
    PaginatorModule,
    SelectModule,
  ],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-pagination.html',
})
export class VicinityPagination {
  readonly pageLabel = input.required<string>();
  readonly rangeSummary = input.required<string>();
  readonly pageOptions = input.required<SelectItem<number>[]>();
  readonly first = input.required<number>();
  readonly totalRecords = input.required<number>();
  readonly pageChange = output<{ first?: number | null }>();
}
