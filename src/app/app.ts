import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from "./features/hero/dashboard/dashboard";
import { GameSidebar } from "./features/layout/game-sidebar/game-sidebar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Dashboard, GameSidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'mythos-hunter-2-0';
}
