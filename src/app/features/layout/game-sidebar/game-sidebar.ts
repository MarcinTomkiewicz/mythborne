import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-game-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './game-sidebar.html',
  styleUrl: './game-sidebar.scss'
})
export class GameSidebar {
  collapsed = false;

menuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/game/dashboard', icon: 'assets/icons/spartan-helmet.svg' },
  { title: 'Attributes', url: '/game/attributes', icon: 'assets/icons/skills.svg' },
  { title: 'Challenges', url: '/game/challenges', icon: 'assets/icons/hydra.svg' },
  { title: 'Combat', url: '/game/combat', icon: 'assets/icons/swordman.svg' },
  { title: 'Armory', url: '/game/armory', icon: 'assets/icons/battle-gear.svg' },
  { title: 'Mansion', url: '/game/mansion', icon: 'assets/icons/capitol.svg' },
  { title: 'Trade', url: '/game/trade', icon: 'assets/icons/trade.svg' }
];

log(data: any): void {
  console.log(data);      
}

}
