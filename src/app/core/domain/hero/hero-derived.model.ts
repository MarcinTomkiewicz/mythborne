export interface IHeroDerived {
  heroId: string;
  hp: number;
  def: number;
  minDmg: number;
  maxDmg: number;
  luck: number;
  critical: number | null;
  evasion: number | null;
  health: number | null;
}