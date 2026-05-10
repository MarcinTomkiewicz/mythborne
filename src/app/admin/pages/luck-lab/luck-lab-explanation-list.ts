import { Component, Input } from '@angular/core';

export interface LuckLabExplanationRow {
  key: string;
  label: string;
  text: string;
  metadata?: string;
}

@Component({
  selector: 'app-luck-lab-explanation-list',
  standalone: true,
  template: `
    <div class="grid-2 gap-md">
      @for (row of rows; track row.key) {
        <article class="mg-surface-card p-md flex-col gap-xs">
          <span class="card-legend">{{ row.label }}</span>
          <span>{{ row.text }}</span>
          @if (row.metadata) {
            <span class="muted-text">{{ row.metadata }}</span>
          }
        </article>
      }
    </div>
  `,
})
export class LuckLabExplanationList {
  @Input({ required: true }) rows: readonly LuckLabExplanationRow[] = [];
}
