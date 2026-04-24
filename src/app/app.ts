import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { GameSidebar } from './layout/components/game-sidebar/game-sidebar';
import { GameTopbar } from './layout/components/game-topbar/game-topbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameSidebar, GameTopbar, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );
  readonly isWideContent = computed(() => this.currentUrl().startsWith('/admin'));

  protected title = 'mythos-hunter-2-0';
}
