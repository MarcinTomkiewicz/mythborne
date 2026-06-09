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
import { HeroResourceRow } from '../../../core/types/resource-display.types';
import {
  PlayerTopbarDisplay,
  PlayerTopbarHeroVitalKey,
} from '../../../core/domain/game-copy/player-topbar-display.model';
import { AuthState } from '../../../core/services/auth/auth-state';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerDashboardShellState } from '../../../core/services/hero/player-dashboard-shell-state';
import { Platform } from '../../../core/services/platform/platform';
import { GameCopyService } from '../../../core/services/game-copy/game-copy.service';
import { semanticIconClass } from '../../../core/utils/semantic-icon-class';
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
  private readonly gameCopy = inject(GameCopyService);
  private readonly platform = inject(Platform);
  private readonly destroyRef = inject(DestroyRef);

  readonly showHeroContent = input(true);
  readonly currentTime = signal(Date.now());
  readonly topbarDisplay = signal<PlayerTopbarDisplay | null>(null);
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
  private readonly heroVitalAdapters = {
    health: {
      chipClass: 'mg-chip mg-chip--health flex-row-center-center gap-sm',
      iconClass: () => this.iconClassForVital('health'),
      progressValue: () => 0,
      progressMax: () => 0,
      valueLabel: () => {
        const stats = this.dashboardContext()?.runtimeStats;

        return stats?.currentHealth !== null
          && stats?.currentHealth !== undefined
          && stats.maxHealth !== null
          && stats.maxHealth !== undefined
            ? `${stats.currentHealth} / ${stats.maxHealth}`
            : null;
      },
    },
    level: {
      chipClass: 'mg-chip flex-row-center-center gap-sm',
      progressValue: () => 0,
      progressMax: () => 0,
      valueLabel: () => {
        const level = this.dashboardContext()?.heroLevel;

        return level !== null && level !== undefined ? `${level}` : null;
      },
    },
    experience: {
      chipClass: 'mg-chip mg-chip--progress mg-chip--xp flex-col gap-xs min-w-250 w-100-xs',
      progressValue: () => this.dashboardContext()?.experience.currentExperience ?? 0,
      progressMax: () => this.dashboardContext()?.experience.experienceToNextLevel ?? 0,
      valueLabel: () => {
        const experience = this.dashboardContext()?.experience;

        return experience?.currentExperience !== null
          && experience?.currentExperience !== undefined
          && experience.experienceToNextLevel !== null
          && experience.experienceToNextLevel !== undefined
            ? `${experience.currentExperience} / ${experience.experienceToNextLevel}`
            : null;
      },
    },
  } satisfies Record<PlayerTopbarHeroVitalKey, {
    chipClass: string;
    iconClass?: () => string | null;
    progressValue: () => number;
    progressMax: () => number;
    valueLabel: () => string | null;
  }>;
  readonly heroVitalsByKey = computed(() =>
    new Map(
      (this.topbarDisplay()?.heroVitals ?? []).map((display) => [
        display.key,
        display,
      ]),
    ),
  );
  readonly heroVitalRows = computed(() => {
    const displaysByKey = this.heroVitalsByKey();
    const health = displaysByKey.get('health');
    const level = displaysByKey.get('level');
    const experience = displaysByKey.get('experience');
    const rows = [];

    if (health) {
      const healthAdapter = this.heroVitalAdapters.health;
      const valueLabel = healthAdapter.valueLabel();

      if (valueLabel !== null) {
        rows.push({
          kind: 'single',
          key: health.key,
          label: health.label,
          ariaLabel: health.ariaLabel,
          iconClass: healthAdapter.iconClass?.() ?? null,
          sortOrder: health.sortOrder,
          valueLabel,
          chipClass: healthAdapter.chipClass,
        } as const);
      }
    }

    if (level && experience) {
      const levelAdapter = this.heroVitalAdapters.level;
      const experienceAdapter = this.heroVitalAdapters.experience;
      const levelValueLabel = levelAdapter.valueLabel();
      const experienceValueLabel = experienceAdapter.valueLabel();
      const progressType = this.gameBarType(experience.progressKind);
      const progressMax = experienceAdapter.progressMax();

      if (levelValueLabel !== null && experienceValueLabel !== null) {
        rows.push({
          kind: 'levelExperience',
          key: `${level.key}:${experience.key}`,
          ariaLabel: `${level.ariaLabel}. ${experience.ariaLabel}`,
          sortOrder: Math.min(level.sortOrder, experience.sortOrder),
          levelLabel: level.label,
          levelValueLabel,
          experienceLabel: experience.label,
          experienceValueLabel,
          chipClass: experienceAdapter.chipClass,
          progressValue: experienceAdapter.progressValue(),
          progressMax,
          progressType,
          shouldRenderProgress: progressMax > 0 && progressType !== null,
        } as const);
      }
    }

    return rows.sort((first, second) => first.sortOrder - second.sortOrder);
  });
  readonly resourceDisplay = computed(() => {
    this.currentTime();

    const topbarDisplay = this.topbarDisplay();
    const resourcesByType = new Map(
      this.resources().map((resource) => [resource.resource_type, resource]),
    );

    if (!topbarDisplay) {
      return [];
    }

    return topbarDisplay.resources.flatMap((display) => {
      const resource = resourcesByType.get(display.key);

      if (!resource) {
        return [];
      }

      return [{
        ...display,
        iconClass: semanticIconClass(display.iconKey),
        amount: this.getLiveAmount(resource),
        perHour: resource.per_hour,
      }];
    });
  });

  ngOnInit() {
    this.gameCopy.getCopy('player.topbar.display', { locale: 'pl' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (display) => {
          this.topbarDisplay.set(display);
        },
        error: (error: unknown) => {
          console.error('Topbar copy load failed.', error);
          this.topbarDisplay.set(null);
        },
      });

    if (this.platform.isBrowser) {
      interval(1000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.currentTime.set(Date.now()));
    }
  }

  private gameBarType(progressKind: string | null): 'hp' | 'xp' | 'chance' | null {
    switch (progressKind) {
      case 'health':
        return 'hp';
      case 'experience':
        return 'xp';
      case 'hp':
      case 'xp':
      case 'chance':
        return progressKind;
      case null:
        return null;
      default:
        console.warn('Unsupported topbar progress kind.', progressKind);
        return null;
    }
  }

  private iconClassForVital(key: PlayerTopbarHeroVitalKey): string | null {
    const iconKey = this.heroVitalsByKey().get(key)?.iconKey ?? '';

    return semanticIconClass(iconKey);
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
