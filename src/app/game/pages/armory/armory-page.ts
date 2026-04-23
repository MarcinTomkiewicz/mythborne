import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ItemGeneratorPanel } from '../../components/item-generator-panel/item-generator-panel';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [RouterLink, ItemGeneratorPanel],
  providers: [ArmoryPageFacade],
  templateUrl: './armory-page.html',
})
export class ArmoryPage implements OnInit {
  readonly page = inject(ArmoryPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
