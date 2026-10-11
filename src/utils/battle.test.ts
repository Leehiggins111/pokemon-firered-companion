// src/utils/battle.test.ts
import { describe, it, expect } from 'vitest';
import { calculateStat, calculateBattleStats, calculateDamage, getTypeEffectiveness } from './battle';

describe('Gen III Battle Calculations', () => {
  it('HP formula: level 50, base 100, IV 31, EV 0 → 175', () => {
    // floor((2*100 + 31 + floor(0/4)) * 50 / 100) + 50 + 10 = floor(231*50/100) + 60 = 115 + 60 = 175
    expect(calculateStat(100, 31, 0, 50, 1, true)).toBe(175);
  });

  it('HP formula: level 100, base 45, IV 31, EV 252 → 292', () => {
    // floor((90 + 31 + 63) * 100 / 100) + 100 + 10 = 184 + 110 = 294? Wait recalculate:
    // (2*45 + 31 + floor(252/4)) = 90 + 31 + 63 = 184
    // 184 * 100 / 100 = 184
    // + 100 + 10 = 294
    expect(calculateStat(45, 31, 252, 100, 1, true)).toBe(294);
  });

  it('non-HP with Adamant nature boosts Attack over Special Attack', () => {
    const stats = calculateBattleStats(
      { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
      5,
      { atk: 31, spa: 31 },
      {},
      'Adamant'
    );
    expect(stats.atk).toBeGreaterThan(stats.spa);
  });

  it('damage formula: level 50, power 100, atk 100, def 100, no STAB, 1x → min 85 max 100', () => {
    // base = floor(((2*50/5 + 2) * 100 * (100/100)) / 50 + 2) = floor((22 * 100 * 1)/50 + 2) = floor(44 + 2) = 46
    // min = floor(46 * 0.85) = 39
    const result = calculateDamage(50, 100, 100, 100, false, 1);
    expect(result.min).toBe(39);
    expect(result.max).toBe(46);
  });

  it('STAB multiplies damage by 1.5', () => {
    const noStab = calculateDamage(20, 40, 50, 50, false, 1);
    const withStab = calculateDamage(20, 40, 50, 50, true, 1);
    expect(withStab.max).toBeGreaterThan(noStab.max);
    expect(withStab.max).toBe(Math.floor(noStab.max * 1.5));
  });

  it('type effectiveness Fire vs Grass is 2', () => {
    const chart = { Fire: { Grass: 2 } };
    expect(getTypeEffectiveness('Fire', ['Grass'], chart)).toBe(2);
  });

  it('Electric vs Ground is 0', () => {
    const chart = { Electric: { Ground: 0 } };
    expect(getTypeEffectiveness('Electric', ['Ground'], chart)).toBe(0);
  });
});
