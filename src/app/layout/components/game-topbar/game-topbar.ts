import { toObservable } from '@angular/core/rxjs-interop';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { IHeroDerived } from '../../../core/types/hero.types';
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
import { HeroDerivedStats } from '../../../core/services/hero/hero-derived-stats';
import { TABLES } from '../../../core/constants/tables.const';
import { GameBar } from '../../../shared/game-bar/game-bar';

const RESOURCE_DEFINITIONS: GameTopbarResourceDefinition[] = [
  { type: 'drachma', label: 'Drachma' },
  { type: 'materials', label: 'Materials' },
  { type: 'workforce', label: 'Workforce' },
];

@Component({
  selector: 'app-game-topbar',
  imports: [GameBar],
  templateUrl: './game-topbar.html',
})
export class GameTopbar implements OnInit, OnDestroy {
  private readonly authState = inject(AuthState);
  private readonly activeHero = inject(ActiveHero);
  private readonly heroDerivedStats = inject(HeroDerivedStats);
  private readonly backend = inject(Backend);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);

  private heroSubscription?: Subscription;
  private tickHandle: number | null = null;

  readonly currentTime = signal(Date.now());
  readonly hero = signal<Row<'hero'> | null>(null);
  readonly derived = signal<IHeroDerived | null>(null);
  readonly currentAddress = signal<string | null>(null);
  readonly resources = signal<HeroResourceRow[]>([]);

  readonly isVisible = computed(() => !!this.authState.hero());
  readonly healthValue = computed(() => Math.max(this.derived()?.health ?? 0, 0));
  readonly healthMax = computed(() => Math.max(this.healthValue(), 1));
  readonly experienceValue = computed(() => Math.max(this.hero()?.experience ?? 0, 0));
  readonly experienceMax = computed(() => 1000);
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
    currentAddress: string | null;
    resources: HeroResourceRow[];
  } | null> {
    if (!state?.heroRow || !state.heroId) {
      this.hero.set(null);
      this.derived.set(null);
      this.currentAddress.set(null);
      this.resources.set([]);
      return of(null);
    }

    return forkJoin({
      hero: of(state.heroRow),
      derived: this.heroDerivedStats
        .resolveActiveHeroDerivedStats()
        .pipe(catchError(() => of(null))),
      currentAddress: this.loadHeroEstateAddress(state.heroRow).pipe(
        catchError(() => of(null)),
      ),
      resources: this.loadHeroResources(state.heroId).pipe(catchError(() => of([]))),
    });
  }

  private loadHeroEstateAddress(hero: Row<'hero'>): Observable<string | null> {
    return this.backend
      .getAll<Pick<Row<'estates'>, 'address' | 'district_code'>>({
        table: TABLES.estates,
        select: 'address, district_code',
        filters: {
          heroId: { operator: FilterOperator.EQ, value: hero.id },
          serverId: { operator: FilterOperator.EQ, value: hero.server_id },
        },
        range: { from: 0, to: 0 },
        camelCase: false,
      })
      .pipe(
        switchMap((rows) => {
          const estate = rows[0];

          if (!estate?.address) {
            return of(null);
          }

          if (estate.district_code) {
            return of(`${estate.district_code} | ${estate.address}`);
          }

          return of(estate.address);
        }),
      );
  }

  private loadHeroResources(heroId: string): Observable<HeroResourceRow[]> {
    return this.backend.getAll<HeroResourceRow>({
      table: TABLES.hero_resources,
      filters: { heroId: { operator: FilterOperator.EQ, value: heroId } },
      camelCase: false,
    });
  }
}
