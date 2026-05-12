import { toObservable } from '@angular/core/rxjs-interop';
import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HeroExperienceProgress, IHeroDerived } from '../../../core/types/hero.types';
import { FilterOperator } from '../../../core/enums/filter-operators';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { Row } from '../../../core/types/supabase.types';
import {
  GameTopbarResourceDefinition,
  GameTopbarResourceDisplay,
  HeroResourceRow,
} from '../../../core/types/game-topbar.types';
import { AuthState } from '../../../core/services/auth/auth-state';
import { Backend } from '../../../core/services/backend/backend';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { Hero } from '../../../core/services/hero/hero';
import { HeroDerivedStats } from '../../../core/services/hero/hero-derived-stats';
import { EstateAddresses } from '../../../core/services/estate/estate-addresses';
import { TABLES } from '../../../core/constants/tables.const';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { NotificationBell } from '../notification-bell/notification-bell';
import { StaffNotificationBell } from '../staff-notification-bell/staff-notification-bell';

const RESOURCE_DEFINITIONS: GameTopbarResourceDefinition[] = [
  { type: 'drachma', label: 'Drachma' },
  { type: 'materials', label: 'Materials' },
  { type: 'workforce', label: 'Workforce' },
];

@Component({
  selector: 'app-game-topbar',
  imports: [GameBar, NotificationBell, StaffNotificationBell],
  templateUrl: './game-topbar.html',
  host: { class: 'd-block flex-1 w-100' },
})
export class GameTopbar implements OnInit, OnDestroy {
  private readonly authState = inject(AuthState);
  private readonly activeHero = inject(ActiveHero);
  private readonly heroService = inject(Hero);
  private readonly heroDerivedStats = inject(HeroDerivedStats);
  private readonly estateAddresses = inject(EstateAddresses);
  private readonly backend = inject(Backend);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);

  private heroSubscription?: Subscription;
  private tickHandle: number | null = null;

  readonly showHeroContent = input(true);
  readonly currentTime = signal(Date.now());
  readonly hero = signal<Row<'hero'> | null>(null);
  readonly derived = signal<IHeroDerived | null>(null);
  readonly experienceProgress = signal<HeroExperienceProgress | null>(null);
  readonly currentAddress = signal<string | null>(null);
  readonly resources = signal<HeroResourceRow[]>([]);

  readonly hasHeroContent = computed(
    () => this.showHeroContent() && !!this.authState.hero(),
  );
  readonly shouldRenderTopbarContent = computed(
    () => this.hasHeroContent() || !this.showHeroContent(),
  );
  readonly healthValue = computed(() => Math.max(this.derived()?.health ?? 0, 0));
  readonly experienceValue = computed(() => Math.max(this.hero()?.experience ?? 0, 0));
  readonly experienceToNextLevel = computed(
    () => this.experienceProgress()?.experienceToNextLevel ?? 0,
  );
  readonly resourceDisplay = computed<GameTopbarResourceDisplay[]>(() => {
    this.currentTime();

    return RESOURCE_DEFINITIONS.map((definition) => {
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
    this.heroSubscription = this.activeHeroState$
      .pipe(
        switchMap((state) => this.loadTopbarState(state)),
      )
      .subscribe((payload) => {
        if (!payload) {
          return;
        }

        this.hero.set(payload.hero);
        this.derived.set(payload.derived);
        this.experienceProgress.set(payload.experienceProgress);
        this.currentAddress.set(payload.currentAddress);
        this.resources.set(payload.resources);
      });

    if (isPlatformBrowser(this.platformId)) {
      this.tickHandle = window.setInterval(() => {
        this.currentTime.set(Date.now());
      }, 1000);
    }

    if (this.authState.user() && !this.activeHero.state()) {
      this.activeHero.loadActiveHero().subscribe();
    }
  }

  ngOnDestroy() {
    this.heroSubscription?.unsubscribe();

    if (this.tickHandle !== null) {
      window.clearInterval(this.tickHandle);
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
    derived: IHeroDerived | null;
    experienceProgress: HeroExperienceProgress | null;
    currentAddress: string | null;
    resources: HeroResourceRow[];
  } | null> {
    if (!state?.heroRow || !state.heroId) {
      this.hero.set(null);
      this.derived.set(null);
      this.experienceProgress.set(null);
      this.currentAddress.set(null);
      this.resources.set([]);
      return of(null);
    }

    return forkJoin({
      hero: of(state.heroRow),
      derived: this.heroDerivedStats
        .resolveActiveHeroDerivedStats()
        .pipe(catchError(() => of(null))),
      experienceProgress: this.heroService
        .getHeroExperienceProgress()
        .pipe(catchError(() => of(null))),
      currentAddress: this.loadHeroEstateAddress(state.heroRow).pipe(
        catchError(() => of(null)),
      ),
      resources: this.loadHeroResources(state.heroId).pipe(catchError(() => of([]))),
    });
  }

  private loadHeroEstateAddress(hero: Row<'hero'>): Observable<string | null> {
    if (!hero.estate_id) {
      return of(null);
    }

    return this.estateAddresses
      .getCurrentAddress({
        estateId: hero.estate_id,
        heroId: hero.id,
        serverId: hero.server_id,
      })
      .pipe(map((address) => address?.addressLabel ?? null));
  }

  private loadHeroResources(heroId: string): Observable<HeroResourceRow[]> {
    return this.backend.getAll<HeroResourceRow>({
      table: TABLES.hero_resources,
      filters: { heroId: { operator: FilterOperator.EQ, value: heroId } },
      camelCase: false,
    });
  }
}
