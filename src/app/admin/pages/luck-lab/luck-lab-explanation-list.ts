import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface LuckLabExplanationRow {
  key: string;
  label: string;
  text: string;
  metadata?: string;
  formulaTargetKeys?: readonly string[];
}

@Component({
  selector: 'app-luck-lab-explanation-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="grid-2 gap-md">
      @for (row of rows; track row.key) {
        <article class="mg-card p-md flex-col gap-xs">
          <span class="card-legend">{{ row.label }}</span>
          <span>{{ row.text }}</span>
          @if (row.metadata) {
            <span class="muted-text">{{ row.metadata }}</span>
          }
          @if (row.formulaTargetKeys?.length) {
            <a routerLink="/admin/formulas">
              Open formula governance
            </a>
            <span class="muted-text">
              Formula target keys: {{ formulaTargetText(row) }}
            </span>
          }
        </article>
      }
    </div>
  `,
})
export class LuckLabExplanationList {
  @Input({ required: true }) rows: readonly LuckLabExplanationRow[] = [];

  formulaTargetText(row: LuckLabExplanationRow): string {
    return row.formulaTargetKeys?.join(', ') ?? '';
  }
}
