import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from '../../../core/services/hero/hero';
import { ItemGeneratorPanel } from '../../components/item-generator-panel/item-generator-panel';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [RouterLink, ItemGeneratorPanel],
  templateUrl: './armory-page.html',
})
export class ArmoryPage implements OnInit {
  private readonly heroService = inject(Hero);

  readonly heroLuck = signal(0);

  ngOnInit(): void {
    this.heroService.getHeroDerived().subscribe((derived) => {
      this.heroLuck.set(derived.luck ?? 0);
    });
  }
}
