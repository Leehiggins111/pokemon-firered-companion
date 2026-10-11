# Pokémon FireRed — Ultimate Adventure Companion

Early vertical slice (Pallet Town → Pewter City) of an interactive FireRed companion.

## Verified baseline

- Production build succeeds (`npm run build`)
- 7 Gen III battle calculation tests pass (`npx vitest run`)
- Editable Team Lab with localStorage persistence
- Mission tracking, starter selection, and rival filtering
- Schematic interactive map + optional Leaflet view

## Local development

```bash
npm install --legacy-peer-deps
npm run dev
```

## Production build

```bash
npm run build
# output in dist/
```

## Deployment

This repository is configured for GitHub Pages (`base: '/pokemon-firered-companion/'` in `vite.config.ts`).

After pushing to `main`, enable GitHub Pages in repository settings (Source: GitHub Actions or Deploy from branch `main` / `docs` after a build).

Live URL (once Pages is enabled):  
`https://leehiggins111.github.io/pokemon-firered-companion/`

## Notes

- `node_modules` is gitignored.
- Full pret/pokefirered extraction requires a local clone; the script is ESM-compatible.
- Map is an interactive schematic (not authentic tile maps).
