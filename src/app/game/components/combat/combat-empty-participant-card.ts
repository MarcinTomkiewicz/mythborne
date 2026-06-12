import { Component, input } from '@angular/core';

@Component({
  selector: 'app-combat-empty-participant-card',
  standalone: true,
  template: `
    <article class="mg-card p-md flex-col gap-md w-100 max-w-350 flex-shrink-0">
      <div class="mg-card flex-col gap-xs text-center radius-md p-md">
        <strong class="color-heading">{{ title() }}</strong>
        <span class="color-text text-sm">{{ text() }}</span>
      </div>
    </article>
  `,
})
export class CombatEmptyParticipantCard {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
}
