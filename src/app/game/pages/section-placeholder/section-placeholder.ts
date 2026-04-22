import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-section-placeholder-page',
  templateUrl: './section-placeholder.html',
  styleUrl: './section-placeholder.scss',
})
export class GameSectionPlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly title = computed(
    () => this.route.snapshot.data['sectionTitle'] ?? 'Game Section'
  );

  readonly description = computed(
    () => this.route.snapshot.data['sectionDescription'] ?? 'Sekcja w przygotowaniu.'
  );
}
