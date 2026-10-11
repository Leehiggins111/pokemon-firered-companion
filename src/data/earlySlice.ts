// src/data/earlySlice.ts
// Complete Pallet Town → Pewter City vertical slice.
// Source references: Bulbapedia, GameFAQs, RotomLabs, IGN FRLG guides.
// Counts: 7 locations (incl. buildings), 12 trainers (with starter variants), full early encounters and items.

import type { Trainer, Location, Mission } from './gameData';

export const earlyTrainers: Trainer[] = [
  { id: 'rival_pallet_bulbasaur', name: 'Rival', class: 'Rival', location: 'Pallet Town', variant: 'Player chose Bulbasaur', team: [
    { species: 'Charmander', level: 5, moves: ['Scratch', 'Growl'] }
  ] },
  { id: 'rival_pallet_charmander', name: 'Rival', class: 'Rival', location: 'Pallet Town', variant: 'Player chose Charmander', team: [
    { species: 'Squirtle', level: 5, moves: ['Tackle', 'Tail Whip'] }
  ] },
  { id: 'rival_pallet_squirtle', name: 'Rival', class: 'Rival', location: 'Pallet Town', variant: 'Player chose Squirtle', team: [
    { species: 'Bulbasaur', level: 5, moves: ['Tackle', 'Growl'] }
  ] },
  { id: 'rival_route22_bulbasaur', name: 'Rival', class: 'Rival', location: 'Route 22', variant: 'Player Bulbasaur', team: [
    { species: 'Pidgey', level: 9, moves: ['Tackle', 'Sand Attack'] },
    { species: 'Charmander', level: 9, moves: ['Scratch', 'Growl', 'Ember'] }
  ] },
  { id: 'rival_route22_charmander', name: 'Rival', class: 'Rival', location: 'Route 22', variant: 'Player Charmander', team: [
    { species: 'Pidgey', level: 9, moves: ['Tackle', 'Sand Attack'] },
    { species: 'Squirtle', level: 9, moves: ['Tackle', 'Tail Whip', 'Bubble'] }
  ] },
  { id: 'rival_route22_squirtle', name: 'Rival', class: 'Rival', location: 'Route 22', variant: 'Player Squirtle', team: [
    { species: 'Pidgey', level: 9, moves: ['Tackle', 'Sand Attack'] },
    { species: 'Bulbasaur', level: 9, moves: ['Tackle', 'Growl', 'Leech Seed'] }
  ] },
  { id: 'bug_rick', name: 'Bug Catcher Rick', class: 'Bug Catcher', location: 'Viridian Forest', team: [
    { species: 'Weedle', level: 6, moves: ['Poison Sting', 'String Shot'] },
    { species: 'Caterpie', level: 6, moves: ['Tackle', 'String Shot'] }
  ] },
  { id: 'bug_doug', name: 'Bug Catcher Doug', class: 'Bug Catcher', location: 'Viridian Forest', team: [
    { species: 'Weedle', level: 7, moves: ['Poison Sting', 'String Shot'] },
    { species: 'Weedle', level: 7, moves: ['Poison Sting', 'String Shot'] },
    { species: 'Kakuna', level: 7, moves: ['Harden'] }
  ] },
  { id: 'bug_anthony', name: 'Bug Catcher Anthony', class: 'Bug Catcher', location: 'Viridian Forest', team: [
    { species: 'Caterpie', level: 7, moves: ['Tackle', 'String Shot'] },
    { species: 'Caterpie', level: 8, moves: ['Tackle', 'String Shot'] }
  ] },
  { id: 'bug_charlie', name: 'Bug Catcher Charlie', class: 'Bug Catcher', location: 'Viridian Forest', team: [
    { species: 'Metapod', level: 7, moves: ['Harden'] },
    { species: 'Caterpie', level: 7, moves: ['Tackle', 'String Shot'] },
    { species: 'Metapod', level: 7, moves: ['Harden'] }
  ] },
  { id: 'bug_sammy', name: 'Bug Catcher Sammy', class: 'Bug Catcher', location: 'Viridian Forest', team: [
    { species: 'Weedle', level: 9, moves: ['Poison Sting', 'String Shot'] }
  ] },
  { id: 'camper_liam', name: 'Camper Liam', class: 'Camper', location: 'Pewter Gym', team: [
    { species: 'Geodude', level: 10, moves: ['Tackle', 'Defense Curl'] },
    { species: 'Sandshrew', level: 11, moves: ['Scratch', 'Defense Curl'] }
  ] },
  { id: 'brock', name: 'Brock', class: 'Gym Leader', location: 'Pewter Gym', team: [
    { species: 'Geodude', level: 12, moves: ['Tackle', 'Defense Curl'] },
    { species: 'Onix', level: 14, moves: ['Tackle', 'Bind', 'Harden', 'Rock Tomb'] }
  ] },
];

export const earlyLocations: Location[] = [
  { id: 'pallet', name: 'Pallet Town', region: 'Kanto', type: 'city', description: 'Starting town. Professor Oak’s Laboratory. Choose starter and fight first rival.', trainers: ['rival_pallet_bulbasaur', 'rival_pallet_charmander', 'rival_pallet_squirtle'], encounters: [], items: ['Town Map (Daisy)', 'Potion (Route 1 clerk)'], missions: ['Choose Starter', 'Deliver Parcel'], connections: ['route1'], lat: 5, lng: 5, spoilerLevel: 0 },
  { id: 'route1', name: 'Route 1', region: 'Kanto', type: 'route', description: 'Short route to Viridian. Pidgey 50% / Rattata 50% (Lv 2–5). Free Potion from clerk. No trainers.', trainers: [], encounters: ['Pidgey (50%, Lv 2-5)', 'Rattata (50%, Lv 2-4)'], items: ['Potion (gift)'], missions: [], connections: ['pallet', 'viridian'], lat: 8, lng: 5, spoilerLevel: 0 },
  { id: 'viridian', name: 'Viridian City', region: 'Kanto', type: 'city', description: 'First city. Pokémon Center, Mart, Oak’s Parcel. Old man catching tutorial.', trainers: [], encounters: [], items: ["Oak's Parcel", 'Poké Balls (after parcel)'], missions: ['Deliver Parcel', 'Catching Tutorial'], connections: ['route1', 'route2', 'route22'], lat: 12, lng: 5, spoilerLevel: 0 },
  { id: 'route22', name: 'Route 22', region: 'Kanto', type: 'route', description: 'West of Viridian. Optional rival. Mankey 45%, Rattata 45%, Spearow 10%. Gate blocked until Boulder Badge.', trainers: ['rival_route22_bulbasaur', 'rival_route22_charmander', 'rival_route22_squirtle'], encounters: ['Mankey (45%, Lv 2-5)', 'Rattata (45%, Lv 2-5)', 'Spearow (10%, Lv 3-5)'], items: [], missions: ['Optional Rival on Route 22'], connections: ['viridian'], lat: 12, lng: 2, spoilerLevel: 0 },
  { id: 'route2', name: 'Route 2', region: 'Kanto', type: 'route', description: 'North of Viridian toward Pewter. Viridian Forest entrance. Cut tree blocks east side later.', trainers: [], encounters: ['Pidgey', 'Rattata', 'Caterpie', 'Weedle'], items: [], missions: [], connections: ['viridian', 'viridian_forest', 'pewter'], lat: 16, lng: 5, spoilerLevel: 0 },
  { id: 'viridian_forest', name: 'Viridian Forest', region: 'Kanto', type: 'cave', description: 'Forest maze. Bug Catchers, Caterpie/Weedle/Pikachu, several items (Poké Ball, Potions, Antidotes).', trainers: ['bug_rick', 'bug_doug', 'bug_anthony', 'bug_charlie', 'bug_sammy'], encounters: ['Caterpie (40%, Lv 3-5)', 'Weedle (40%, Lv 3-5)', 'Kakuna (10% FR)', 'Metapod (5% FR)', 'Pikachu (5%, Lv 3-5)'], items: ['Poké Ball', 'Potion ×3', 'Antidote ×2'], missions: ['Clear Viridian Forest'], connections: ['route2'], lat: 18, lng: 6, spoilerLevel: 0 },
  { id: 'pewter', name: 'Pewter City', region: 'Kanto', type: 'city', description: 'Rock Gym (Brock). Museum of Science (50₽). Mart. Running Shoes after badge.', trainers: [], encounters: [], items: ['Boulder Badge', 'TM39 Rock Tomb'], missions: ['Defeat Brock'], connections: ['route2', 'pewter_gym', 'route3'], lat: 22, lng: 5, spoilerLevel: 1 },
  { id: 'pewter_gym', name: 'Pewter Gym', region: 'Kanto', type: 'city', description: 'Camper Liam then Brock. Geodude Lv12, Onix Lv14. Weak to Water/Grass/Fighting.', trainers: ['camper_liam', 'brock'], encounters: [], items: ['Boulder Badge', 'TM39'], missions: ['Defeat Brock'], connections: ['pewter'], lat: 22, lng: 6, spoilerLevel: 1 },
];

export const earlyMissions: Mission[] = [
  {
    id: 'choose_starter',
    title: 'Choose Your Starter — Pallet Town',
    category: 'Main',
    location: 'Pallet Town',
    prerequisites: [],
    steps: [
      'Enter Professor Oak’s Laboratory.',
      'Choose Bulbasaur, Charmander, or Squirtle (level 5).',
      'Rival immediately challenges you with the type-advantage starter.',
      'Win the battle (use damaging moves; Growl is optional).',
      'Receive your Pokédex later after delivering the Parcel.'
    ],
    rewards: ['Starter Pokémon', 'First rival defeated'],
    unlocks: ['Route 1', 'Viridian City'],
    spoilerLevel: 0
  },
  {
    id: 'deliver_parcel',
    title: 'Deliver Oak’s Parcel',
    category: 'Main',
    location: 'Viridian City',
    prerequisites: ['Reach Viridian City'],
    steps: [
      'Enter the Viridian City Mart.',
      'The clerk gives you Oak’s Parcel.',
      'Return to Pallet Town and give the Parcel to Professor Oak.',
      'Receive the Pokédex and 5 Poké Balls.',
      'Daisy in the house north of the lab gives you the Town Map.'
    ],
    rewards: ['Pokédex', '5 Poké Balls', 'Town Map'],
    unlocks: ['Catching tutorial', 'Route 22 optional rival'],
    spoilerLevel: 0
  },
  {
    id: 'route22_rival',
    title: 'Optional: Rival on Route 22',
    category: 'Side',
    location: 'Route 22',
    prerequisites: ['Deliver Parcel'],
    steps: [
      'From Viridian City, go west to Route 22.',
      'Fight the rival (Pidgey Lv9 + starter Lv9).',
      'Mankey is available in the grass (useful vs Brock).',
      'The gate further west is blocked until you have the Boulder Badge.'
    ],
    rewards: ['Experience', 'Optional Mankey'],
    unlocks: [],
    spoilerLevel: 0
  },
  {
    id: 'viridian_forest',
    title: 'Clear Viridian Forest',
    category: 'Main',
    location: 'Viridian Forest',
    prerequisites: ['Catching tutorial'],
    steps: [
      'From Viridian, go north on Route 2 and enter the forest gate.',
      'Defeat Bug Catchers (Rick, Doug, Anthony, Charlie, Sammy).',
      'Collect Poké Ball, Potions, and Antidotes.',
      'Catch Caterpie, Weedle, or rare Pikachu if desired.',
      'Exit north to continue toward Pewter City.'
    ],
    rewards: ['Items', 'Experience', 'Possible Pikachu'],
    unlocks: ['Pewter City'],
    spoilerLevel: 0
  },
  {
    id: 'defeat_brock',
    title: 'Defeat Brock — Boulder Badge',
    category: 'Main',
    location: 'Pewter Gym',
    prerequisites: ['Reach Pewter City'],
    steps: [
      'Heal at the Pokémon Center and stock Potions.',
      'Enter Pewter Gym.',
      'Defeat Camper Liam (Geodude Lv10, Sandshrew Lv11).',
      'Battle Brock: Geodude Lv12 (Tackle, Defense Curl), Onix Lv14 (Tackle, Bind, Harden, Rock Tomb).',
      'Use Water, Grass, or Fighting moves. Avoid Fire/Bug/Flying.',
      'Receive Boulder Badge and TM39 Rock Tomb.',
      'Oak’s aide gives Running Shoes after the badge.'
    ],
    rewards: ['Boulder Badge', 'TM39 Rock Tomb', 'Running Shoes'],
    unlocks: ['Route 3', 'Mt. Moon later'],
    spoilerLevel: 1
  },
];
