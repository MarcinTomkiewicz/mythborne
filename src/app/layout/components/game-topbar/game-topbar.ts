import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { interval } from 'rxjs';
import { HeroResourceRow, ResourceAmountDisplay } from '../../../core/types/resource-display.types';
import { AuthState } from '../../../core/services/auth/auth-state';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerDashboardShellState } from '../../../core/services/hero/player-dashboard-shell-state';
import { Platform } from '../../../core/services/platform/platform';
import { CORE_RESOURCE_DISPLAY_DEFINITIONS } from '../../../core/config/resource-display.config';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { NotificationBell } from '../notification-bell/notification-bell';
import { StaffNotificationBell } from '../staff-notification-bell/staff-notification-bell';
import { TopbarDropdownCoordinator } from '../topbar-dropdown/topbar-dropdown-coordinator';

@Component({
  selector: 'app-game-topbar',
  imports: [GameBar, NotificationBell, StaffNotificationBell],
  providers: [TopbarDropdownCoordinator],
  templateUrl: './game-topbar.html',
})
export class GameTopbar implements OnInit {
  private readonly authState = inject(AuthState);
  private readonly activeHero = inject(ActiveHero);
  private readonly dashboardShellState = inject(PlayerDashboardShellState);
  private readonly platform = inject(Platform);
  private readonly destroyRef = inject(DestroyRef);

  readonly showHeroContent = input(true);
  readonly currentTime = signal(Date.now());
  readonly dashboardContext = computed(() => {
    const context = this.dashboardShellState.dashboardPageContext();

    return context?.heroId === this.activeHero.state()?.heroId
      ? context
      : null;
  });
  readonly resources = computed<HeroResourceRow[]>(() =>
    this.dashboardContext()?.heroResources ?? [],
  );

  readonly hasHeroContent = computed(
    () => this.showHeroContent() && !!this.authState.hero(),
  );
  readonly shouldRenderTopbarContent = computed(
    () => this.hasHeroContent() || !this.showHeroContent(),
  );
  readonly currentHealthValue = computed(
    () => this.dashboardContext()?.runtimeStats.currentHealth ?? null,
  );
  readonly maxHealthValue = computed(
    () => this.dashboardContext()?.runtimeStats.maxHealth ?? null,
  );
  readonly heroLevelValue = computed(() => this.dashboardContext()?.heroLevel ?? null);
  readonly experienceValue = computed(
    () => this.dashboardContext()?.experience.currentExperience ?? null,
  );
  readonly experienceToNextLevel = computed(
    () => this.dashboardContext()?.experience.experienceToNextLevel ?? null,
  );
  readonly hasExperienceContext = computed(
    () => this.experienceValue() !== null && this.experienceToNextLevel() !== null,
  );
  readonly experienceBarValue = computed(() => this.experienceValue() ?? 0);
  readonly experienceBarMax = computed(() => this.experienceToNextLevel() ?? 0);
  readonly resourceDisplay = computed<ResourceAmountDisplay[]>(() => {
    this.currentTime();

    return this.resources().map((resource) => {
      const definition = CORE_RESOURCE_DISPLAY_DEFINITIONS.find(
        (entry) => entry.type === resource.resource_type,
      );

      if (!definition) {
        return null;
      }

      return {
        ...definition,
        amount: this.getLiveAmount(resource),
        perHour: resource.per_hour,
      };
    }).filter((entry): entry is ResourceAmountDisplay => entry !== null);
  });

  readonly isResourceContextComplete = computed(
    () => !!this.dashboardContext()
      && CORE_RESOURCE_DISPLAY_DEFINITIONS.every((definition) =>
        this.resources().some((resource) => resource.resource_type === definition.type)
      ),
  );

  ngOnInit() {
    if (this.platform.isBrowser) {
      interval(1000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.currentTime.set(Date.now()));
    }
  }

  private getLiveAmount(resource: HeroResourceRow | undefined): number {
    if (!resource) {
      return 0;
    }

    if (!resource.updated_at || resource.per_hour <= 0) {
      return resource.amount;
    }

    const elapsedMs = this.currentTime() - new Date(resource.updated_at).getTime();
    const grownAmount = (Math.max(elapsedMs, 0) / 3600000) * resource.per_hour;

    return Math.floor(resource.amount + grownAmount);
  }
}
