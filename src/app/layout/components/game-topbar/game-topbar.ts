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
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { IHeroDerived } from '../../../core/domain/hero/hero-derived.model';
import { Row } from '../../../core/types/supabase.types';
import {
  GameTopbarResourceDefinition,
  GameTopbarResourceDisplay,
  HeroResourceRow,
} from '../../../core/types/game-topbar.types';
import { AuthState } from '../../../core/services/auth/auth-state';
import { Hero } from '../../../core/services/hero/hero';
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
  private readonly heroService = inject(Hero);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authHero$ = toObservable(this.authState.hero);

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
    this.heroSubscription = this.authHero$
      .pipe(
        switchMap((authHero) => {
          if (!authHero) {
            this.hero.set(null);
            this.derived.set(null);
            this.currentAddress.set(null);
            this.resources.set([]);
            return of(null);
          }

          return forkJoin({
            hero: this.heroService
              .getHeroData()
              .pipe(catchError(() => of(this.mapAuthHeroToRow(authHero)))),
            derived: this.heroService.getHeroDerived().pipe(catchError(() => of(null))),
            currentAddress: this.heroService
              .getHeroEstateAddress()
              .pipe(catchError(() => of(null))),
            resources: this.heroService.getHeroResources().pipe(catchError(() => of([]))),
          });
        })
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

  private mapAuthHeroToRow(hero: ReturnType<AuthState['hero']>): Row<'hero'> {
    return {
      id: hero!.id,
      user_id: hero!.userId,
      server_id: hero!.serverId,
      name: hero!.name,
      level: hero!.level,
      rank: hero!.rank,
      experience: hero!.experience,
      character_points: hero!.characterPoints,
      total_character_points_earned: hero!.totalCharacterPointsEarned,
      estate_id: hero!.estateId,
      origin_id: hero!.originId,
      profile_picture: hero!.profilePicture,
      created_at: hero!.createdAt,
    };
  }
}
