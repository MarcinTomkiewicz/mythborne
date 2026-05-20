import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MgPrimePreset } from './primeng/mg-primeng.preset';
import { Auth } from './core/services/auth/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAppInitializer(() => inject(Auth).initialize()),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    ConfirmationService,
    MessageService,
    providePrimeNG({
      theme: {
        preset: MgPrimePreset,
        options: {
          darkModeSelector: 'html:not([data-theme="light"])',
          cssLayer: {
            name: 'primeng',
            order: 'app-styles, primeng',
          },
        },
      },
    }),
  ],
};
