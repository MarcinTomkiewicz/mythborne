import { Injectable, effect, inject, signal } from '@angular/core';
import { Origins } from '../origins/origins';
import { originPaperdollImageUrl } from '../../utils/origin-mappers';
import { ActiveHero } from './active-hero';

@Injectable({ providedIn: 'root' })
export class ActiveHeroPortraitState {
  private readonly activeHero = inject(ActiveHero);
  private readonly origins = inject(Origins);
  private loadToken = 0;

  readonly portraitSrc = signal<string | null>(null);

  private readonly syncPortrait = effect(() => {
    const state = this.activeHero.state();
    const token = ++this.loadToken;
    const profilePicture = state?.hero?.profilePicture ?? null;
    const originId = state?.heroRow?.origin_id ?? null;

    if (profilePicture) {
      this.portraitSrc.set(profilePicture);
      return;
    }

    if (!originId) {
      this.portraitSrc.set(null);
      return;
    }

    this.origins.getOriginWithBonuses(originId).subscribe({
      next: ({ origin }) => {
        if (token === this.loadToken) {
          this.portraitSrc.set(originPaperdollImageUrl(origin.key));
        }
      },
      error: () => {
        if (token === this.loadToken) {
          this.portraitSrc.set(null);
        }
      },
    });
  });
}
