# FireRed Ultimate Adventure Companion

An offline adventure command centre for Pokémon FireRed, with native interactive Kanto and Sevii tile maps, a six-Pokémon team builder, Generation III battle strategy, a searchable local game Brain, spoiler-safe chapters, an unrestricted Wiki and persistent progress.

## Run

Requires Node 22+ and `tar` (included on GitHub Actions, Linux, macOS and recent Windows).

```sh
npm ci --legacy-peer-deps
npm run dev
```

The predev, pretest and prebuild hooks restore the checksummed data/asset bundle. No ROM, API key, hosted AI or separate map service is required. `npm run build` produces the GitHub Pages deployment in `dist/`, including a versioned service worker that caches the entire application and all game assets.

## Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests cover objective tracking, authentic maps, pickups, team editing, trainer strategy, spoiler filtering, Wiki references, export, offline reload, persistence and mobile layout. Unit tests cover source completeness, references, FireRed-specific encounter slots, starter variants, data migration and Generation III mechanics. CI runs these before publishing.

## Source data

The pinned source is [pret/pokefirered](https://github.com/pret/pokefirered) commit `037335f4c725d7c9aecdac87066f2002b4bd7e14`. Extraction covers 386 species, 354 moves, 605 mapped ordinary/rematch trainer parties, 307 usable items and 425 native maps; Trainer Tower rosters and the nine in-game trades are separate. LeafGreen encounter tables and learnset branches are excluded. Level-up, TM/HM, tutor, egg, evolution, dex, palette, tile, map event and warp data are bundled.

Map pixels are lossless renders of the original source tiles, palettes, metatiles and layouts. Marker coordinates are actual game tiles. Warp links, map pickups and defeated trainers use the same adventure progress as the rest of the application.

To reproduce the data, clone the pinned source and run:

```sh
python3 scripts/import-firered.py /absolute/path/to/pokefirered
```

Requires Pillow. Generated data and assets are packed into the checked asset archive; the checksum and part count are enforced before extraction. The generation pipeline is retained in the repository.

[Smogon damage-calc](https://github.com/smogon/damage-calc) provides the reused MIT-licensed Gen III engine. Its license is distributed at `public/licenses/smogon-calc.txt`. Opponent calculations disclose neutral-nature / first-ability assumptions; trainer IVs, moves, held items and levels come from source. Trainer Tower levels scale and its full source rosters are separately documented in the Wiki. Status and conditional moves are identified rather than given invented damage rolls.

## Progress and offline use

Adventure Mode gates all map, trainer, quest and Brain views by the selected chapter. Major objectives advance chapters; manual selection lets you match an existing game. Wiki Mode reveals everything. All 386 species are included for reference; some require another version, a trade or event access.

The old `firered-progress` save is migrated, keeping the party, location, starter, mission and trainer progress. The new versioned save includes IVs, EVs, natures, moves, held items, caught species, map pickups and field notes. Backups import/export as JSON. Storage is per browser/device; no emulator save reader or cloud sync is implied.

Load once online and wait for “Offline cache available”. The full application then runs offline, including maps, Wiki, Brain and strategy. Service-worker updates use content-addressed cache versions.

## Publish

The existing GitHub Actions workflow publishes to [the companion](https://leehiggins111.github.io/pokemon-firered-companion/) after checks and a production build. This repository keeps the original working components and tests alongside the integrated application.

Unofficial fan project. Pokémon assets and game content belong to their respective owners.
