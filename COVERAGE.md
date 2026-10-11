# Release verification

Production TypeScript compilation and Vite build passed. All 26 unit/data/strategy tests passed. The Chromium end-to-end adventure test passed, including an actual offline reload and JSON backup restoration.

## Verified data

- All 386 Gen III species, numbered uniquely 1–386; all 354 moves.
- FireRed base stats, abilities, evolutions, level-up moves, TMs/HMs, tutors, breeding moves, dex descriptions, sizes and egg groups.
- 605 ordinary/rematch trainer parties, including all starter-dependent rival branches and both League teams.
- 351 exact Vs. Seeker party/map references with native progression points.
- 425 native Kanto/Sevii maps; every map image and species sprite exists locally.
- Original encounter slot weights, including FireRed-specific Viridian Forest Kakuna/Metapod distribution.
- Nine in-game trades and all four eight-floor Trainer Tower challenges, including exact Mixed-mode floor pointers.
- 307 usable items, scripted pickups, hidden-item coordinates, gifts, stationary encounters, connections and warp destinations.

## Browser flow exercised

Command Centre → journal completion → authentic Viridian Forest map → collect Poké Ball → edit party and moves → Brock strategist and damage output → mark defeated → ask Brain for Pikachu's catch location → verify Mewtwo hidden → switch to Wiki → Seven Island's authentic map → full Mewtwo learnset → Trainer Tower → trades/gifts → export → change notes → restore exported JSON → wait for full offline cache → disconnect internet → reload → verify notes and map persistence → 390px mobile layout without horizontal overflow.

Desktop and mobile screenshots were visually inspected. No browser page errors occurred in the complete flow.

## Mechanics checks

All 386 species and 354 moves resolve through the reused Smogon Gen III engine. Tests cover physical/special by type, correct Gen III type interactions, immunity, fixed damage, weather, abilities and held items. Trainer calculations show their assumptions rather than claiming to know hidden nature/personality or predict trainer AI. Status, OHKO and other conditional effects are identified without inventing direct damage rolls.

## Operational boundaries

Progress is local to the browser/device and transferable through JSON backups. The app does not read emulator saves or promise cloud sync. Wiki includes the full National Dex, with trade/version/event requirements explained. The offline Brain retrieves the bundled verified database and journal; it does not use a hosted generative model. First offline use requires one successful online load and completion of caching.

The GitHub Pages workflow reruns tests, build and Chromium browser verification before publication.
