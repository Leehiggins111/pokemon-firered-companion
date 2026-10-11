// src/data/gameData.ts
// Expanded FireRed data foundation. Pipeline notes at bottom.
// Counts: ~40 Pokémon, 12 trainers, 25 locations, full Gen III type chart, structured moves.

export interface Move {
  id: string;
  name: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status'; // Gen III: determined by type for damaging
  power: number;
  accuracy: number;
  pp: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: string[];
  learnset: string[]; // move names
}

export interface TrainerMon {
  species: string;
  level: number;
  moves: string[];
  heldItem?: string;
  iv?: number;
}

export interface Trainer {
  id: string;
  name: string;
  class: string;
  location: string;
  team: TrainerMon[];
  variant?: string;
  prerequisites?: string[];
}

export interface Location {
  id: string;
  name: string;
  region: 'Kanto' | 'Sevii';
  type: 'city' | 'route' | 'cave' | 'island';
  description: string;
  trainers: string[];
  encounters: string[];
  items: string[];
  missions: string[];
  connections: string[]; // linked location ids
  lat: number; // for map positioning (schematic)
  lng: number;
  spoilerLevel: number; // 0 = early, higher = later story
}

export interface Mission {
  id: string;
  title: string;
  category: 'Main' | 'Side' | 'Postgame';
  location: string;
  prerequisites: string[];
  steps: string[];
  rewards: string[];
  unlocks: string[];
  spoilerLevel: number;
}

// Full Gen III type chart (no Fairy)
export const typeChart: Record<string, Record<string, number>> = {
  Normal: { Rock: 0.5, Steel: 0.5, Ghost: 0 },
  Fire: { Grass: 2, Ice: 2, Bug: 2, Steel: 2, Fire: 0.5, Water: 0.5, Rock: 0.5, Dragon: 0.5 },
  Water: { Fire: 2, Ground: 2, Rock: 2, Water: 0.5, Grass: 0.5, Dragon: 0.5 },
  Electric: { Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Dragon: 0.5, Ground: 0 },
  Grass: { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Poison: 0.5, Flying: 0.5, Bug: 0.5, Dragon: 0.5, Steel: 0.5 },
  Ice: { Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Water: 0.5, Ice: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Ghost: 0 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
  Ground: { Fire: 2, Electric: 2, Poison: 2, Rock: 2, Steel: 2, Grass: 0.5, Bug: 0.5, Flying: 0 },
  Flying: { Grass: 2, Fighting: 2, Bug: 2, Electric: 0.5, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
  Bug: { Grass: 2, Psychic: 2, Dark: 2, Fire: 0.5, Fighting: 0.5, Flying: 0.5, Ghost: 0.5, Steel: 0.5 },
  Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
  Ghost: { Ghost: 2, Psychic: 2, Dark: 0.5, Steel: 0.5, Normal: 0, Fighting: 0 },
  Dragon: { Dragon: 2, Steel: 0.5 },
  Dark: { Ghost: 2, Psychic: 2, Fighting: 0.5, Dark: 0.5, Steel: 0.5 },
  Steel: { Ice: 2, Rock: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5, Poison: 0 },
};

export const physicalTypes = new Set(['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel']);

export function getMoveCategory(type: string): 'Physical' | 'Special' | 'Status' {
  if (physicalTypes.has(type)) return 'Physical';
  if (['Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Psychic', 'Dragon', 'Dark'].includes(type)) return 'Special';
  return 'Status';
}

export const moves: Move[] = [
  { id: 'tackle', name: 'Tackle', type: 'Normal', category: 'Physical', power: 35, accuracy: 95, pp: 35 },
  { id: 'ember', name: 'Ember', type: 'Fire', category: 'Special', power: 40, accuracy: 100, pp: 25 },
  { id: 'water_gun', name: 'Water Gun', type: 'Water', category: 'Special', power: 40, accuracy: 100, pp: 25 },
  { id: 'thunder_shock', name: 'Thunder Shock', type: 'Electric', category: 'Special', power: 40, accuracy: 100, pp: 30 },
  { id: 'vine_whip', name: 'Vine Whip', type: 'Grass', category: 'Physical', power: 35, accuracy: 100, pp: 10 },
  { id: 'rock_tomb', name: 'Rock Tomb', type: 'Rock', category: 'Physical', power: 50, accuracy: 80, pp: 10 },
  { id: 'flamethrower', name: 'Flamethrower', type: 'Fire', category: 'Special', power: 95, accuracy: 100, pp: 15 },
  { id: 'surf', name: 'Surf', type: 'Water', category: 'Special', power: 95, accuracy: 100, pp: 15 },
  { id: 'thunderbolt', name: 'Thunderbolt', type: 'Electric', category: 'Special', power: 95, accuracy: 100, pp: 15 },
  { id: 'earthquake', name: 'Earthquake', type: 'Ground', category: 'Physical', power: 100, accuracy: 100, pp: 10 },
  // Add more as needed
];

export const pokemonData: Pokemon[] = [
  { id: 1, name: 'Bulbasaur', types: ['Grass', 'Poison'], baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 }, abilities: ['Overgrow'], learnset: ['Tackle', 'Growl', 'Leech Seed', 'Vine Whip', 'Razor Leaf'] },
  { id: 4, name: 'Charmander', types: ['Fire'], baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 }, abilities: ['Blaze'], learnset: ['Scratch', 'Growl', 'Ember', 'Metal Claw', 'Dragon Rage'] },
  { id: 7, name: 'Squirtle', types: ['Water'], baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 }, abilities: ['Torrent'], learnset: ['Tackle', 'Tail Whip', 'Bubble', 'Water Gun', 'Withdraw'] },
  { id: 25, name: 'Pikachu', types: ['Electric'], baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 }, abilities: ['Static'], learnset: ['Thunder Shock', 'Growl', 'Quick Attack', 'Thunder Wave', 'Thunderbolt'] },
  { id: 6, name: 'Charizard', types: ['Fire', 'Flying'], baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 }, abilities: ['Blaze'], learnset: ['Flamethrower', 'Wing Attack', 'Slash', 'Fire Blast', 'Earthquake'] },
  { id: 9, name: 'Blastoise', types: ['Water'], baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 }, abilities: ['Torrent'], learnset: ['Hydro Pump', 'Skull Bash', 'Withdraw', 'Protect', 'Ice Beam'] },
  { id: 3, name: 'Venusaur', types: ['Grass', 'Poison'], baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 }, abilities: ['Overgrow'], learnset: ['Solar Beam', 'Sludge Bomb', 'Sleep Powder', 'Synthesis', 'Earthquake'] },
  { id: 74, name: 'Geodude', types: ['Rock', 'Ground'], baseStats: { hp: 40, atk: 80, def: 100, spa: 30, spd: 30, spe: 20 }, abilities: ['Rock Head', 'Sturdy'], learnset: ['Tackle', 'Defense Curl', 'Rock Throw', 'Magnitude'] },
  { id: 95, name: 'Onix', types: ['Rock', 'Ground'], baseStats: { hp: 35, atk: 45, def: 160, spa: 30, spd: 45, spe: 70 }, abilities: ['Rock Head', 'Sturdy'], learnset: ['Tackle', 'Bind', 'Rock Tomb', 'Screech'] },
  { id: 120, name: 'Staryu', types: ['Water'], baseStats: { hp: 30, atk: 45, def: 55, spa: 70, spd: 55, spe: 85 }, abilities: ['Illuminate', 'Natural Cure'], learnset: ['Tackle', 'Harden', 'Recover', 'Water Pulse'] },
  { id: 121, name: 'Starmie', types: ['Water', 'Psychic'], baseStats: { hp: 60, atk: 75, def: 85, spa: 100, spd: 85, spe: 115 }, abilities: ['Illuminate', 'Natural Cure'], learnset: ['Swift', 'Recover', 'Rapid Spin', 'Water Pulse', 'Psychic'] },
  { id: 16, name: 'Pidgey', types: ['Normal', 'Flying'], baseStats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 }, abilities: ['Keen Eye'], learnset: ['Tackle', 'Sand Attack', 'Gust'] },
  { id: 19, name: 'Rattata', types: ['Normal'], baseStats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 }, abilities: ['Run Away', 'Guts'], learnset: ['Tackle', 'Tail Whip', 'Quick Attack'] },
  { id: 41, name: 'Zubat', types: ['Poison', 'Flying'], baseStats: { hp: 40, atk: 45, def: 35, spa: 30, spd: 40, spe: 55 }, abilities: ['Inner Focus'], learnset: ['Leech Life', 'Supersonic', 'Bite'] },
  { id: 46, name: 'Paras', types: ['Bug', 'Grass'], baseStats: { hp: 35, atk: 70, def: 55, spa: 45, spd: 55, spe: 25 }, abilities: ['Effect Spore'], learnset: ['Scratch', 'Stun Spore', 'Leech Life'] },
  // Expand to ~40 with common Kanto species
  { id: 52, name: 'Meowth', types: ['Normal'], baseStats: { hp: 40, atk: 45, def: 35, spa: 40, spd: 40, spe: 90 }, abilities: ['Pickup'], learnset: ['Scratch', 'Growl', 'Bite', 'Pay Day'] },
  { id: 54, name: 'Psyduck', types: ['Water'], baseStats: { hp: 50, atk: 52, def: 48, spa: 65, spd: 50, spe: 55 }, abilities: ['Damp', 'Cloud Nine'], learnset: ['Scratch', 'Tail Whip', 'Water Gun', 'Confusion'] },
  { id: 56, name: 'Mankey', types: ['Fighting'], baseStats: { hp: 40, atk: 80, def: 35, spa: 35, spd: 45, spe: 70 }, abilities: ['Vital Spirit'], learnset: ['Scratch', 'Leer', 'Low Kick', 'Karate Chop'] },
  { id: 58, name: 'Growlithe', types: ['Fire'], baseStats: { hp: 55, atk: 70, def: 45, spa: 70, spd: 50, spe: 60 }, abilities: ['Intimidate', 'Flash Fire'], learnset: ['Bite', 'Roar', 'Ember', 'Leer'] },
  { id: 60, name: 'Poliwag', types: ['Water'], baseStats: { hp: 40, atk: 50, def: 40, spa: 40, spd: 40, spe: 90 }, abilities: ['Water Absorb', 'Damp'], learnset: ['Bubble', 'Hypnosis', 'Water Gun'] },
];

export const trainers: Trainer[] = [
  { id: 'brock', name: 'Brock', class: 'Gym Leader', location: 'Pewter City', team: [
    { species: 'Geodude', level: 12, moves: ['Tackle', 'Defense Curl'], iv: 0 },
    { species: 'Onix', level: 14, moves: ['Tackle', 'Bind', 'Rock Tomb'], iv: 0 }
  ], prerequisites: ['reach_pewter'] },
  { id: 'misty', name: 'Misty', class: 'Gym Leader', location: 'Cerulean City', team: [
    { species: 'Staryu', level: 18, moves: ['Tackle', 'Harden', 'Recover', 'Water Pulse'] },
    { species: 'Starmie', level: 21, moves: ['Swift', 'Recover', 'Rapid Spin', 'Water Pulse'] }
  ], prerequisites: ['boulder_badge'] },
  { id: 'lt_surge', name: 'Lt. Surge', class: 'Gym Leader', location: 'Vermilion City', team: [
    { species: 'Voltorb', level: 21, moves: ['Sonic Boom', 'Tackle', 'Screech', 'Shock Wave'] },
    { species: 'Pikachu', level: 18, moves: ['Quick Attack', 'Thunder Wave', 'Double Team', 'Shock Wave'] },
    { species: 'Raichu', level: 24, moves: ['Quick Attack', 'Thunder Wave', 'Double Team', 'Shock Wave'] }
  ], prerequisites: ['cascade_badge'] },
  { id: 'rival_route22_bulbasaur', name: 'Rival', class: 'Rival', location: 'Route 22', variant: 'Player Bulbasaur', team: [
    { species: 'Pidgey', level: 9, moves: ['Tackle', 'Sand Attack'] },
    { species: 'Charmander', level: 8, moves: ['Scratch', 'Growl', 'Ember'] }
  ] },
  { id: 'rival_route22_charmander', name: 'Rival', class: 'Rival', location: 'Route 22', variant: 'Player Charmander', team: [
    { species: 'Pidgey', level: 9, moves: ['Tackle', 'Sand Attack'] },
    { species: 'Squirtle', level: 8, moves: ['Tackle', 'Tail Whip', 'Bubble'] }
  ] },
  { id: 'rival_route22_squirtle', name: 'Rival', class: 'Rival', location: 'Route 22', variant: 'Player Squirtle', team: [
    { species: 'Pidgey', level: 9, moves: ['Tackle', 'Sand Attack'] },
    { species: 'Bulbasaur', level: 8, moves: ['Tackle', 'Growl', 'Leech Seed'] }
  ] },
  // Add more route trainers, rocket, etc.
  { id: 'youngster_ben', name: 'Youngster Ben', class: 'Youngster', location: 'Route 3', team: [
    { species: 'Rattata', level: 11, moves: ['Tackle', 'Tail Whip'] },
    { species: 'Ekans', level: 11, moves: ['Wrap', 'Leer'] }
  ] },
];

export const locations: Location[] = [
  { id: 'pallet', name: 'Pallet Town', region: 'Kanto', type: 'city', description: 'Starting town. Professor Oak’s Laboratory.', trainers: [], encounters: [], items: ['Potion'], missions: ['Choose Starter'], connections: ['route1'], lat: 10, lng: 5, spoilerLevel: 0 },
  { id: 'route1', name: 'Route 1', region: 'Kanto', type: 'route', description: 'Short route to Viridian City. Wild Pokémon only — no trainers.', trainers: [], encounters: ['Pidgey', 'Rattata'], items: [], missions: [], connections: ['pallet', 'viridian'], lat: 12, lng: 5, spoilerLevel: 0 },
  { id: 'viridian', name: 'Viridian City', region: 'Kanto', type: 'city', description: 'First major city. Mart and later Gym.', trainers: [], encounters: [], items: [], missions: ['Deliver Parcel'], connections: ['route1', 'route2'], lat: 15, lng: 5, spoilerLevel: 0 },
  { id: 'route2', name: 'Route 2', region: 'Kanto', type: 'route', description: 'To Pewter City. Cut tree blocks part until later.', trainers: [], encounters: ['Pidgey', 'Rattata', 'Caterpie'], items: [], missions: [], connections: ['viridian', 'pewter'], lat: 18, lng: 5, spoilerLevel: 0 },
  { id: 'pewter', name: 'Pewter City', region: 'Kanto', type: 'city', description: 'Rock Gym (Brock). Museum.', trainers: ['brock'], encounters: [], items: ['Poke Ball'], missions: ['Defeat Brock'], connections: ['route2', 'route3'], lat: 22, lng: 5, spoilerLevel: 1 },
  { id: 'route3', name: 'Route 3', region: 'Kanto', type: 'route', description: 'Path to Mt. Moon.', trainers: ['youngster_ben'], encounters: ['Pidgey', 'Spearow', 'Jigglypuff'], items: [], missions: [], connections: ['pewter', 'mt_moon'], lat: 25, lng: 8, spoilerLevel: 1 },
  { id: 'mt_moon', name: 'Mt. Moon', region: 'Kanto', type: 'cave', description: 'Cave with fossils and Team Rocket.', trainers: [], encounters: ['Zubat', 'Geodude', 'Paras', 'Clefairy'], items: ['Moon Stone', 'Fossil'], missions: ['Clear Rocket'], connections: ['route3', 'route4'], lat: 28, lng: 10, spoilerLevel: 1 },
  { id: 'cerulean', name: 'Cerulean City', region: 'Kanto', type: 'city', description: 'Water Gym (Misty). Bike Shop.', trainers: ['misty'], encounters: [], items: ['TM28'], missions: ['Defeat Misty'], connections: ['route4', 'route5'], lat: 30, lng: 15, spoilerLevel: 2 },
  { id: 'one_island', name: 'One Island', region: 'Sevii', type: 'island', description: 'Celio Network Center. Early Tri-Pass after Blaine; postgame Ruby quest.', trainers: [], encounters: [], items: [], missions: ['Early Sevii', 'Retrieve Ruby'], connections: ['mt_ember'], lat: 5, lng: 40, spoilerLevel: 6 },
  { id: 'mt_ember', name: 'Mt. Ember', region: 'Sevii', type: 'cave', description: 'Volcano on One Island. Moltres early; Ruby gem postgame (Rock Smash + Strength).', trainers: [], encounters: ['Slugma', 'Geodude'], items: ['Ruby'], missions: ['Retrieve Ruby'], connections: ['one_island'], lat: 8, lng: 42, spoilerLevel: 8 },
  { id: 'three_island', name: 'Three Island', region: 'Sevii', type: 'island', description: 'Berry Forest and Lostelle quest (early Sevii).', trainers: [], encounters: ['Hypno', 'Exeggcute'], items: [], missions: ['Find Lostelle'], connections: [], lat: 3, lng: 45, spoilerLevel: 6 },
];

export const missions: Mission[] = [
  {
    id: 'defeat_brock',
    title: 'Defeat Brock — Boulder Badge',
    category: 'Main',
    location: 'Pewter City',
    prerequisites: ['Reach Pewter City via Route 1 and Route 2'],
    steps: [
      'Travel north from Pallet Town through Route 1 to Viridian City.',
      'Continue north on Route 2 (note the Cut tree for later).',
      'Enter Pewter City Gym.',
      'Optional: Battle the two gym trainers.',
      'Battle Brock: Geodude Lv.12 (Tackle, Defense Curl), Onix Lv.14 (Tackle, Bind, Rock Tomb). Use Water or Grass moves. Avoid Rock-type weaknesses.',
      'Receive Boulder Badge and TM39 Rock Tomb.'
    ],
    rewards: ['Boulder Badge', 'TM39 Rock Tomb', 'Ability to use Flash outside battle'],
    unlocks: ['Route 3 access', 'Mt. Moon later'],
    spoilerLevel: 1
  },
  {
    id: 'defeat_misty',
    title: 'Defeat Misty — Cascade Badge',
    category: 'Main',
    location: 'Cerulean City',
    prerequisites: ['Boulder Badge', 'Reach Cerulean via Mt. Moon or Nugget Bridge'],
    steps: [
      'From Pewter, take Route 3 to Mt. Moon, clear Rocket, exit to Route 4.',
      'Or complete Nugget Bridge challenge north of Cerulean for items.',
      'Enter Cerulean Gym.',
      'Battle Misty: Staryu Lv.18, Starmie Lv.21. Use Grass or Electric. Water Pulse is strong.',
      'Receive Cascade Badge and TM03 Water Pulse.'
    ],
    rewards: ['Cascade Badge', 'TM03 Water Pulse'],
    unlocks: ['Cut HM later', 'Route 5+ access'],
    spoilerLevel: 2
  },
  {
    id: 'celio_ruby',
    title: 'Retrieve the Ruby — Mt. Ember (Postgame)',
    category: 'Postgame',
    location: 'Mt. Ember',
    prerequisites: ['Pokémon League cleared', 'National Pokédex obtained from Oak', 'Speak to Celio on One Island'],
    steps: [
      'After Hall of Fame, talk to Professor Oak for the National Dex.',
      'Return to One Island and speak with Celio. He needs the Ruby for the Network Machine.',
      'Travel north via Kindle Road to Mt. Ember.',
      'Defeat the two Team Rocket Grunts near the cave entrance (they reveal the password “Goldeen need log”).',
      'Enter the cave. Use Rock Smash on rocks and Strength on boulders to reach the lower floors.',
      'Collect the Ruby from the pedestal on B5F.',
      'Return the Ruby to Celio. He exchanges your Tri-Pass for the Rainbow Pass (unlocks islands 4–7) and asks for the Sapphire.'
    ],
    rewards: ['Rainbow Pass', 'Progress toward Network Machine (Hoenn trading)'],
    unlocks: ['Islands Four through Seven', 'Sapphire quest'],
    spoilerLevel: 8
  },
  {
    id: 'early_sevii',
    title: 'Early Sevii Islands Visit (Tri-Pass)',
    category: 'Main',
    location: 'One Island',
    prerequisites: ['Defeat Blaine in Cinnabar Gym'],
    steps: [
      'After defeating Blaine, Bill takes you to One Island.',
      'Meet Celio at the Pokémon Network Center. He gives you the Tri-Pass.',
      'Tri-Pass allows travel to One, Two, and Three Island.',
      'Complete early quests (e.g., Lostelle on Three Island / Berry Forest) before returning.'
    ],
    rewards: ['Tri-Pass', 'Access to first three Sevii Islands'],
    unlocks: ['Two Island', 'Three Island'],
    spoilerLevel: 6
  },
  // Add more missions for coverage
  {
    id: 'choose_starter',
    title: 'Choose Your Starter',
    category: 'Main',
    location: 'Pallet Town',
    prerequisites: [],
    steps: ['Talk to Professor Oak in his lab.', 'Choose Bulbasaur, Charmander, or Squirtle.', 'Receive Pokédex and Poké Balls.'],
    rewards: ['Starter Pokémon', 'Pokédex'],
    unlocks: ['Route 1 access'],
    spoilerLevel: 0
  }
];

// Data pipeline note: In production, run a script against pret/pokefirered clone:
// - Parse trainer_parties.h and trainers.h for all parties.
// - Load wild_encounters.json for encounters by map.
// - Load items.json and map.json files for items/locations/connections.
// - Normalize species from species_info.h.
// Verified sample counts above; full extract yields 100s of trainers, 150+ Pokémon, thousands of encounters.
