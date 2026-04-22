import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameSidebar } from './features/layout/game-sidebar/game-sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameSidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'mythos-hunter-2-0';
}
