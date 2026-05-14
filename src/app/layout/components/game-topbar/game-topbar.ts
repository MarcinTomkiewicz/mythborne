import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { forkJoin, interval, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FilterOperator } from '../../../core/enums/filter-operators';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { Row } from '../../../core/types/supabase.types';
import {
  HeroResourceRow,
  ResourceAmountDisplay,
} from '../../../core/types/resource-display.types';
import { AuthState } from '../../../core/services/auth/auth-state';
import { Backend } from '../../../core/services/backend/backend';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveHeroVitalsState } from '../../../core/services/hero/active-hero-vitals-state';
import { TABLES } from '../../../core/constants/tables.const';
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
  private readonly vitals = inject(ActiveHeroVitalsState);
  private readonly backend = inject(Backend);
  private readonly platform = inject(Platform);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);

  readonly showHeroContent = input(true);
  readonly currentTime = signal(Date.now());
  readonly hero = signal<Row<'hero'> | null>(null);
  readonly resources = signal<HeroResourceRow[]>([]);

  readonly hasHeroContent = computed(
    () => this.showHeroContent() && !!this.authState.hero(),
  );
  readonly shouldRenderTopbarContent = computed(
    () => this.hasHeroContent() || !this.showHeroContent(),
  );
  readonly currentHealthValue = this.vitals.currentHealth;
  readonly maxHealthValue = this.vitals.maxHealth;
  readonly heroLevelValue = computed(
    () => Math.max(this.vitals.level() ?? 1, 1),
  );
  readonly experienceValue = computed(() =>
    Math.max(this.vitals.currentExperience(), 0),
  );
  readonly experienceToNextLevel = computed(
    () => this.vitals.experienceToNextLevel() ?? 0,
  );
  readonly resourceDisplay = computed<ResourceAmountDisplay[]>(() => {
    this.currentTime();

    return CORE_RESOURCE_DISPLAY_DEFINITIONS.map((definition) => {
      const resource = this.resources().find(
        (entry) => entry.resource_type === definition.type
      );

      return {
        ...definition,
        amount: this.getLiveAmount(resource),
        perHour: resource?.per_hour ?? 0,
      };
    });
  });

  ngOnInit() {
    this.activeHeroState$
      .pipe(
        switchMap((state) => this.loadTopbarState(state)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((payload) => {
        if (!payload) {
          return;
        }

        this.hero.set(payload.hero);
        this.resources.set(payload.resources);
      });

    if (this.platform.isBrowser) {
      interval(1000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.currentTime.set(Date.now()));
    }

    if (this.authState.user() && !this.activeHero.state()) {
      this.activeHero.loadActiveHero()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
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

  private loadTopbarState(state: ActiveHeroState | null): Observable<{
    hero: Row<'hero'>;
    resources: HeroResourceRow[];
  } | null> {
    if (!state?.heroRow || !state.heroId) {
      this.hero.set(null);
      this.resources.set([]);
      return of(null);
    }

    this.vitals.load();

    return forkJoin({
      hero: of(state.heroRow),
      resources: this.loadHeroResources(state.heroId).pipe(catchError(() => of([]))),
    });
  }

  private loadHeroResources(heroId: string): Observable<HeroResourceRow[]> {
    return this.backend.getAll<HeroResourceRow>({
      table: TABLES.hero_resources,
      filters: { heroId: { operator: FilterOperator.EQ, value: heroId } },
      camelCase: false,
    });
  }
}
