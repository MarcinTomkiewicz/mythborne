import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RouteBackgroundOverride {
  private readonly overrides = signal<Record<string, string>>({});

  readonly image = computed(() => {
    const images = Object.values(this.overrides());

    return images.length ? images[images.length - 1] : null;
  });

  set(source: string, image: string): void {
    this.overrides.update((current) => ({
      ...current,
      [source]: image,
    }));
  }

  clear(source: string): void {
    this.overrides.update((current) => {
      if (!(source in current)) {
        return current;
      }

      const next = { ...current };
      delete next[source];

      return next;
    });
  }
}
