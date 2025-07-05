import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameSidebar } from "./features/layout/game-sidebar/game-sidebar";
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameSidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'mythos-hunter-2-0';
  // private primeng = inject(PrimeNG)

  //     ngOnInit() {
  //       this.primeng.ripple.set(true);
  //   }
}
