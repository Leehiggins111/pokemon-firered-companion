// src/utils/battle.ts
// Pure Generation III battle calculations.
// Physical/Special determined by type. Stats use level, base, IV, EV, nature.

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface NatureMods {
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

const natures: Record<string, NatureMods> = {
  Hardy: { atk: 1, def: 1, spa: 1, spd: 1, spe: 1 },
  Adamant: { atk: 1.1, def: 1, spa: 0.9, spd: 1, spe: 1 },
  Modest: { atk: 0.9, def: 1, spa: 1.1, spd: 1, spe: 1 },
  Jolly: { atk: 1, def: 1, spa: 0.9, spd: 1, spe: 1.1 },
  Timid: { atk: 0.9, def: 1, spa: 1, spd: 1, spe: 1.1 },
  Brave: { atk: 1.1, def: 1, spa: 1, spd: 1, spe: 0.9 },
  // Add more as needed
};

export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureMod: number,
  isHP = false
): number {
  if (isHP) {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  const stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(stat * natureMod);
}

export function calculateBattleStats(
  base: Stats,
  level: number,
  ivs: Partial<Stats> = {},
  evs: Partial<Stats> = {},
  nature = 'Hardy'
): Stats {
  const n = natures[nature] || natures.Hardy;
  const iv = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...ivs };
  const ev = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...evs };
  return {
    hp: calculateStat(base.hp, iv.hp, ev.hp, level, 1, true),
    atk: calculateStat(base.atk, iv.atk, ev.atk, level, n.atk),
    def: calculateStat(base.def, iv.def, ev.def, level, n.def),
    spa: calculateStat(base.spa, iv.spa, ev.spa, level, n.spa),
    spd: calculateStat(base.spd, iv.spd, ev.spd, level, n.spd),
    spe: calculateStat(base.spe, iv.spe, ev.spe, level, n.spe),
  };
}

export function calculateDamage(
  level: number,
  power: number,
  attack: number,
  defense: number,
  stab: boolean,
  typeEff: number,
  critical = false
): { min: number; max: number; notes: string } {
  // Gen III: (((2*Level/5 + 2) * Power * A/D) / 50 + 2) * mods
  let base = Math.floor(((2 * level / 5 + 2) * power * (attack / defense)) / 50 + 2);
  if (stab) base = Math.floor(base * 1.5);
  base = Math.floor(base * typeEff);
  if (critical) base = Math.floor(base * 2);
  const min = Math.floor(base * 0.85);
  const max = base;
  return {
    min,
    max,
    notes: 'Gen III formula. Uses calculated stats. Random 85-100. No burn/screens/items/weather.'
  };
}

export function getTypeEffectiveness(moveType: string, defTypes: string[], typeChart: Record<string, Record<string, number>>): number {
  let mult = 1;
  for (const dt of defTypes) {
    mult *= typeChart[moveType]?.[dt] ?? 1;
  }
  return mult;
}
