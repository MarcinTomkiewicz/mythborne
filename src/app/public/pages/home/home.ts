import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  HOME_PAGE_AUTHENTICATED_CTA,
  HOME_PAGE_GUEST_CTA,
} from '../../../core/config/home-page-cta.config';
import {
  HOME_PAGE_INFO_CARDS,
  HOME_PAGE_LORE_BLOCKS,
} from '../../../core/config/home-page-content.config';
import { AuthState } from '../../../core/services/auth/auth-state';

@Component({
  selector: 'app-public-home-page',
  imports: [ButtonModule, RouterLink],
  templateUrl: './home.html',
})
export class PublicHomePage {
  private readonly authState = inject(AuthState);

  readonly loreBlocks = HOME_PAGE_LORE_BLOCKS;
  readonly infoCards = HOME_PAGE_INFO_CARDS;
  readonly isLoggedIn = computed(() => !!this.authState.user());
  readonly cta = computed(() =>
    this.isLoggedIn() ? HOME_PAGE_AUTHENTICATED_CTA : HOME_PAGE_GUEST_CTA,
  );
  readonly primaryCta = computed(() =>
    this.cta().primary,
  );
  readonly secondaryCta = computed(() =>
    this.cta().secondary,
  );
}
