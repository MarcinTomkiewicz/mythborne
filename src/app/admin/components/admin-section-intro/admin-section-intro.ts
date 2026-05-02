import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-section-intro',
  standalone: true,
  templateUrl: './admin-section-intro.html',
})
export class AdminSectionIntro {
  readonly legend = input<string | null>(null);
  readonly title = input.required<string>();
  readonly text = input<string | null>(null);
  readonly secondaryText = input<string | null>(null);
}
