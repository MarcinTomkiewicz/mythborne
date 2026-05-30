import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { resolveRouteBackgroundImage } from '../../../core/config/route-backgrounds.config';
import { RouteBackgroundOverride } from '../../../core/services/ui/route-background-override';
import { AppFooter } from '../app-footer/app-footer';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, AppFooter],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly router = inject(Router);
  private readonly routeBackgroundOverride = inject(RouteBackgroundOverride);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly routeBackgroundImage = computed(() => {
    const override = this.routeBackgroundOverride.image();

    if (override) {
      return override;
    }

    return resolveRouteBackgroundImage(this.currentUrl());
  });
}
