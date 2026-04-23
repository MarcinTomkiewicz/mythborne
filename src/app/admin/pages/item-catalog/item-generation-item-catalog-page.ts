import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ItemGenerationItemCatalogPageFacade } from '../../../core/services/items/item-generation-item-catalog-page.facade';

@Component({
  selector: 'app-item-generation-item-catalog-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  providers: [ItemGenerationItemCatalogPageFacade],
  templateUrl: './item-generation-item-catalog-page.html',
})
export class ItemGenerationItemCatalogPage implements OnInit {
  readonly page = inject(ItemGenerationItemCatalogPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
