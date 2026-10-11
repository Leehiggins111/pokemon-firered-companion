#!/usr/bin/env node
// scripts/extract-data.js
// ESM-compatible extraction pipeline for pret/pokefirered.
// Usage: node scripts/extract-data.js /path/to/pokefirered

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const decompPath = process.argv[2] || './pokefirered';
const outDir = path.join(__dirname, '../src/data/extracted');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('FireRed Data Extraction Pipeline (ESM)');
console.log('Source:', decompPath);
console.log('Output:', outDir);

function safeRead(file) {
  try {
    return fs.readFileSync(path.join(decompPath, file), 'utf8');
  } catch {
    console.log(`Missing: ${file}`);
    return null;
  }
}

function extractTrainers() {
  const content = safeRead('src/data/trainer_parties.h');
  if (!content) return [];
  const parties = [];
  const re = /sParty_(\w+)\s*\[\s*\]\s*=\s*\{([\s\S]*?)\};/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const name = match[1];
    const body = match[2];
    const species = [...body.matchAll(/SPECIES_(\w+)/g)].map(m => m[1]);
    const levels = [...body.matchAll(/\.lvl\s*=\s*(\d+)/g)].map(m => parseInt(m[1], 10));
    const moves = [...body.matchAll(/MOVE_(\w+)/g)].map(m => m[1]);
    parties.push({
      id: name.toLowerCase(),
      name,
      species,
      levels,
      moves: moves.slice(0, 4 * species.length)
    });
  }
  console.log(`Parsed ${parties.length} trainer parties`);
  fs.writeFileSync(path.join(outDir, 'trainers.json'), JSON.stringify(parties, null, 2));
  return parties;
}

function extractEncounters() {
  const content = safeRead('src/data/wild_encounters.json');
  if (!content) return [];
  try {
    const data = JSON.parse(content);
    const encounters = data.wild_encounter_groups?.[0]?.encounters || [];
    const simplified = encounters.map(e => ({
      map: e.map,
      land: (e.land_mons?.mons || []).map(m => ({ species: m.species, min: m.min_level, max: m.max_level })),
      water: (e.water_mons?.mons || []).map(m => ({ species: m.species, min: m.min_level, max: m.max_level }))
    }));
    console.log(`Extracted ${simplified.length} encounter tables`);
    fs.writeFileSync(path.join(outDir, 'encounters.json'), JSON.stringify(simplified, null, 2));
    return simplified;
  } catch (e) {
    console.log('Failed to parse wild_encounters.json', e.message);
    return [];
  }
}

function extractItems() {
  const content = safeRead('src/data/items.json');
  if (!content) return [];
  try {
    const data = JSON.parse(content);
    const items = Array.isArray(data) ? data : Object.values(data);
    console.log(`Extracted ${items.length} items`);
    fs.writeFileSync(path.join(outDir, 'items.json'), JSON.stringify(items, null, 2));
    return items;
  } catch {
    return [];
  }
}

const trainers = extractTrainers();
const encounters = extractEncounters();
const items = extractItems();

console.log('\n=== Extraction Complete ===');
console.log(`Trainers: ${trainers.length}`);
console.log(`Encounters: ${encounters.length}`);
console.log(`Items: ${items.length}`);
console.log('JSON written to src/data/extracted/.');
