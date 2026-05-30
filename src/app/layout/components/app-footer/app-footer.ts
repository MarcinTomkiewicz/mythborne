import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  APP_FOOTER_BRAND,
  APP_FOOTER_LINKS,
  APP_FOOTER_SUBTITLE,
} from '../../../core/config/app-footer.config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  host: {
    class: 'd-block w-100 flex-none',
  },
  templateUrl: './app-footer.html',
})
export class AppFooter {
  readonly brand = APP_FOOTER_BRAND;
  readonly subtitle = APP_FOOTER_SUBTITLE;
  readonly links = APP_FOOTER_LINKS;
  readonly currentYear = new Date().getFullYear();
}
