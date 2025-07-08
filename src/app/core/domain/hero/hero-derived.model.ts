export interface IHeroDerived extends Record<string, number> {
  hp: number;
  def: number;
  minDmg: number;
  maxDmg: number;
  luck: number;
  critical: number;
  evasion: number;
  health: number;
}