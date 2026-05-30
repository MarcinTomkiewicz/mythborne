import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  HOME_PAGE_INFO_CARDS,
  HOME_PAGE_LORE_BLOCKS,
} from '../../../core/config/home-page-content.config';

@Component({
  selector: 'app-public-home-page',
  imports: [ButtonModule, RouterLink],
  templateUrl: './home.html',
})
export class PublicHomePage {
  readonly loreBlocks = HOME_PAGE_LORE_BLOCKS;
  readonly infoCards = HOME_PAGE_INFO_CARDS;
}
