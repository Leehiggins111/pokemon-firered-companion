import { useState, useEffect } from 'react';
import { MapPin, Users, Swords, BookOpen, Database, Home } from 'lucide-react';
import { pokemonData, typeChart, moves } from './data/gameData';
import { earlyTrainers, earlyLocations, earlyMissions } from './data/earlySlice';
import { calculateBattleStats, calculateDamage, getTypeEffectiveness } from './utils/battle';
import MapView from './components/MapView';
import SchematicMap from './components/SchematicMap';
import './App.css';

const trainers = earlyTrainers;
const locations = earlyLocations;
const missions = earlyMissions;

interface PartyMon {
  species: string;
  level: number;
  moves: string[];
  nature: string;
  ability: string;
  nickname?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [mapStyle, setMapStyle] = useState<'authentic' | 'schematic' | 'leaflet'>('authentic');
  const [wikiMode, setWikiMode] = useState(false);
  const [progressLevel, setProgressLevel] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('pallet');
  const [defeatedTrainers, setDefeatedTrainers] = useState<Set<string>>(new Set());
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [playerStarter, setPlayerStarter] = useState<'Bulbasaur' | 'Charmander' | 'Squirtle' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerParty, setPlayerParty] = useState<PartyMon[]>([
    { species: 'Charmander', level: 15, moves: ['Ember', 'Scratch', 'Growl', 'Metal Claw'], nature: 'Adamant', ability: 'Blaze' },
    { species: 'Pikachu', level: 12, moves: ['Thunder Shock', 'Quick Attack', 'Growl', 'Thunder Wave'], nature: 'Jolly', ability: 'Static' },
  ]);

  // Persistence — load once on mount, then save only after initial load completes
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('firered-progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.party) setPlayerParty(data.party);
        if (data.defeated) setDefeatedTrainers(new Set(data.defeated));
        if (data.location) setCurrentLocation(data.location);
        if (typeof data.progress === 'number') setProgressLevel(data.progress);
        if (typeof data.wiki === 'boolean') setWikiMode(data.wiki);
        if (data.completed) setCompletedMissions(new Set(data.completed));
        if (data.starter) setPlayerStarter(data.starter);
      } catch (e) {
        console.warn('Failed to parse saved progress', e);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('firered-progress', JSON.stringify({
      party: playerParty,
      defeated: Array.from(defeatedTrainers),
      location: currentLocation,
      progress: progressLevel,
      wiki: wikiMode,
      completed: Array.from(completedMissions),
      starter: playerStarter
    }));
  }, [playerParty, defeatedTrainers, currentLocation, progressLevel, wikiMode, completedMissions, playerStarter, hydrated]);

  const toggleTrainer = (id: string) => {
    setDefeatedTrainers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Advance progress if key trainer
    if (id === 'brock' && !defeatedTrainers.has(id)) setProgressLevel(Math.max(progressLevel, 1));
    if (id === 'misty' && !defeatedTrainers.has(id)) setProgressLevel(Math.max(progressLevel, 2));
  };

  const updatePartyMon = (index: number, updates: Partial<PartyMon>) => {
    setPlayerParty(prev => prev.map((m, i) => i === index ? { ...m, ...updates } : m));
  };

  const addToParty = () => {
    if (playerParty.length < 6) {
      setPlayerParty(prev => [...prev, { species: 'Bulbasaur', level: 5, moves: ['Tackle'], nature: 'Hardy', ability: 'Overgrow' }]);
    }
  };

  const removeFromParty = (index: number) => {
    setPlayerParty(prev => prev.filter((_, i) => i !== index));
  };

  // Gen III damage calculation — pure module (src/utils/battle.ts)
  // Local wrappers removed; uses imported calculateDamage / getTypeEffectiveness

  const analyzeMatchup = (trainer: typeof trainers[0]) => {
    return trainer.team.map(opp => {
      const oppPokemon = pokemonData.find(p => p.name === opp.species);
      if (!oppPokemon) return { opponent: opp.species, level: opp.level, bestCounter: 'Unknown', danger: 'Unknown', calc: null };
      const oppStats = calculateBattleStats(oppPokemon.baseStats, opp.level);
      const best = playerParty.reduce((bestSoFar, myPoke) => {
        const mySpecies = pokemonData.find(p => p.name === myPoke.species);
        if (!mySpecies) return bestSoFar;
        const myStats = calculateBattleStats(mySpecies.baseStats, myPoke.level, {}, {}, myPoke.nature);
        let bestScore = 0;
        let bestMove = '';
        for (const moveName of myPoke.moves) {
          const move = moves.find(m => m.name === moveName);
          if (!move) continue; // skip unknown moves — do not fabricate damage
          const eff = getTypeEffectiveness(move.type, oppPokemon.types, typeChart);
          const stab = mySpecies.types.includes(move.type);
          const atkStat = move.category === 'Physical' ? myStats.atk : myStats.spa;
          const defStat = move.category === 'Physical' ? oppStats.def : oppStats.spd;
          const dmg = calculateDamage(myPoke.level, move.power, atkStat, defStat, stab, eff);
          const score = dmg.max / Math.max(1, oppStats.hp);
          if (score > bestScore) {
            bestScore = score;
            bestMove = moveName;
          }
        }
        return bestScore > bestSoFar.score ? { poke: myPoke.species, score: bestScore, move: bestMove } : bestSoFar;
      }, { poke: 'None', score: 0, move: '' });
      return {
        opponent: opp.species,
        level: opp.level,
        bestCounter: best.poke,
        bestMove: best.move,
        danger: best.score < 0.3 ? 'High' : best.score < 0.6 ? 'Medium' : 'Low',
        calc: best.score > 0 ? 'Uses calculated stats (level/base/nature)' : null
      };
    });
  };

  const visibleMissions = missions.filter(m => wikiMode || m.spoilerLevel <= progressLevel);
  const visibleTrainers = trainers.filter(t => {
    if (!wikiMode && (locations.find(l => l.id === t.location)?.spoilerLevel ?? 0) > progressLevel) return false;
    // Filter rival variants by chosen starter
    if (t.id.startsWith('rival_')) {
      return playerStarter !== null && (t.variant?.includes(playerStarter) ?? false);
    }
    return true;
  });

  const nextMission = missions.find(m => !completedMissions.has(m.id) && (wikiMode || m.spoilerLevel <= progressLevel));
  const selectedLocation = locations.find(l => l.id === currentLocation);
  const locationTrainers = visibleTrainers.filter(t => t.location === selectedLocation?.name);
  const locationMissions = visibleMissions.filter(m => m.location === selectedLocation?.name);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchResults = normalizedSearch ? [
    ...locations.filter(l => (wikiMode || l.spoilerLevel <= progressLevel) && [l.name, l.description, ...l.items, ...l.encounters].some(v => v.toLowerCase().includes(normalizedSearch))).map(l => ({ key: `location-${l.id}`, label: l.name, detail: `${l.encounters.length} encounters · ${l.items.length} items`, tab: 'map', location: l.id })),
    ...visibleTrainers.filter(t => [t.name, t.class, t.location, ...t.team.map(p => p.species)].some(v => v.toLowerCase().includes(normalizedSearch))).map(t => ({ key: `trainer-${t.id}`, label: t.name, detail: `${t.location} · ${t.team.map(p => `${p.species} Lv.${p.level}`).join(', ')}`, tab: 'battle', location: locations.find(l => l.name === t.location)?.id })),
    ...visibleMissions.filter(m => [m.title, m.location, ...m.steps, ...m.rewards].some(v => v.toLowerCase().includes(normalizedSearch))).map(m => ({ key: `mission-${m.id}`, label: m.title, detail: m.location, tab: 'missions', location: locations.find(l => l.name === m.location)?.id }))
  ] : [];

  const toggleMission = (id: string) => {
    setCompletedMissions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🔥 Pokémon FireRed — Ultimate Adventure Companion</h1>
        <div className="mode-toggle">
          <button onClick={() => setWikiMode(!wikiMode)} className={wikiMode ? 'active' : ''}>
            {wikiMode ? 'Full Wiki Mode' : 'Adventure Mode'}
          </button>
          <span style={{ marginLeft: '1rem', fontSize: '0.85rem' }}>Progress: {progressLevel}/10</span>
        </div>
      </header>
      <nav className="nav">
        <button onClick={() => setActiveTab('command')} className={activeTab === 'command' ? 'active' : ''}><Home size={18} /> Command</button>
        <button onClick={() => setActiveTab('map')} className={activeTab === 'map' ? 'active' : ''}><MapPin size={18} /> Map</button>
        <button onClick={() => setActiveTab('team')} className={activeTab === 'team' ? 'active' : ''}><Users size={18} /> Team Lab</button>
        <button onClick={() => setActiveTab('battle')} className={activeTab === 'battle' ? 'active' : ''}><Swords size={18} /> Battle Intel</button>
        <button onClick={() => setActiveTab('missions')} className={activeTab === 'missions' ? 'active' : ''}><BookOpen size={18} /> Missions</button>
        <button onClick={() => setActiveTab('pokedex')} className={activeTab === 'pokedex' ? 'active' : ''}><Database size={18} /> Pokédex</button>
      </nav>
      <main className="main">
        {activeTab === 'command' && (
          <div className="dashboard">
            <h2>Command Center</h2>
            <div className="status-grid">
              <div className="card">
                <h3>Current Location</h3>
                <p>{locations.find(l => l.id === currentLocation)?.name}</p>
                <select value={currentLocation} onChange={e => setCurrentLocation(e.target.value)}>
                  {locations.filter(l => wikiMode || l.spoilerLevel <= progressLevel).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="card">
                <h3>Your Team ({playerParty.length}/6)</h3>
                {playerParty.map((p, i) => <div key={i}>{p.species} Lv.{p.level}</div>)}
              </div>
              <div className="card">
                <h3>Next Objective</h3>
                <p>{nextMission?.title || 'All early missions complete (or switch to Wiki)'}</p>
                {nextMission && <button onClick={() => toggleMission(nextMission.id)}>Mark Complete</button>}
              </div>
              <div className="card">
                <h3>Starter</h3>
                <select value={playerStarter || ''} onChange={e => setPlayerStarter(e.target.value as any || null)}>
                  <option value="">Select starter</option>
                  <option value="Bulbasaur">Bulbasaur</option>
                  <option value="Charmander">Charmander</option>
                  <option value="Squirtle">Squirtle</option>
                </select>
                <p style={{ fontSize: '0.8rem' }}>{playerStarter ? `Rival will use the counter to ${playerStarter}` : 'Choose to filter rival battles'}</p>
              </div>
              <div className="card">
                <h3>Pokémon Brain (search)</h3>
                <input placeholder="Search locations, trainers, items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                {normalizedSearch && (
                  <div className="brain-results" aria-live="polite">
                    <p>{searchResults.length} results in the current early-game dataset</p>
                    {searchResults.length === 0 && <p>No matches. The full FireRed database has not been imported yet.</p>}
                    {searchResults.map(result => <button key={result.key} className="brain-result" onClick={() => { if (result.location) setCurrentLocation(result.location); setActiveTab(result.tab); }}><strong>{result.label}</strong><span>{result.detail}</span></button>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'map' && (
          <div className="map-view">
            <h2>Interactive World Map</h2>
            <div style={{ marginBottom: 12 }}>
              <button onClick={() => setMapStyle('authentic')} className={mapStyle === 'authentic' ? 'active' : ''}>Interactive FireRed maps</button>
              <button onClick={() => setMapStyle('schematic')} className={mapStyle === 'schematic' ? 'active' : ''} style={{ marginLeft: 8 }}>Route overview</button>
              <button onClick={() => setMapStyle('leaflet')} className={mapStyle === 'leaflet' ? 'active' : ''} style={{ marginLeft: 8 }}>Experimental OSM</button>
            </div>
            {mapStyle === 'authentic' ? (
              <div className="authentic-map">
                <div className="map-source-note"><strong>Actual FireRed / LeafGreen game maps</strong><p>Interactive trainer, item and cave navigation provided by the open-source FRLG Ironmon Map. Its markers and progress are managed separately from this companion for now.</p><a href="https://kelseyyoung.github.io/FRLGIronmonMap/" target="_blank" rel="noopener noreferrer">Open full-screen map ↗</a></div>
                <iframe title="Interactive FireRed and LeafGreen maps" src="https://kelseyyoung.github.io/FRLGIronmonMap/" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            ) : mapStyle === 'schematic' ? (
              <SchematicMap
                currentLocation={currentLocation}
                onSelectLocation={setCurrentLocation}
                wikiMode={wikiMode}
                progressLevel={progressLevel}
              />
            ) : (
              <MapView
                currentLocation={currentLocation}
                onSelectLocation={setCurrentLocation}
                wikiMode={wikiMode}
                progressLevel={progressLevel}
              />
            )}
            <div className="location-detail card">
              <h3>{locations.find(l => l.id === currentLocation)?.name}</h3>
              <p>{locations.find(l => l.id === currentLocation)?.description}</p>
              <p>Connections: {selectedLocation?.connections.map(id => locations.find(l => l.id === id)?.name || id).join(' · ')}</p>
              <div className="location-intel">
                <section><h4>Wild encounters ({selectedLocation?.encounters.length ?? 0})</h4>{selectedLocation?.encounters.length ? <ul>{selectedLocation.encounters.map(e => <li key={e}>{e}</li>)}</ul> : <p>No wild encounters listed.</p>}</section>
                <section><h4>Items ({selectedLocation?.items.length ?? 0})</h4>{selectedLocation?.items.length ? <ul>{selectedLocation.items.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p>No items listed.</p>}</section>
                <section><h4>Trainers ({locationTrainers.length})</h4>{locationTrainers.length ? locationTrainers.map(t => <button key={t.id} className="intel-action" onClick={() => setActiveTab('battle')}>{t.name} · {t.team.map(p => `${p.species} Lv.${p.level}`).join(', ')} {defeatedTrainers.has(t.id) ? '✓' : '→'}</button>) : <p>No trainers listed. Choose your starter to reveal rival variants.</p>}</section>
                <section><h4>Objectives ({locationMissions.length})</h4>{locationMissions.length ? locationMissions.map(m => <label key={m.id} className="intel-objective"><input type="checkbox" checked={completedMissions.has(m.id)} onChange={() => toggleMission(m.id)} /> {m.title}</label>) : <p>No objectives listed.</p>}</section>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'team' && (
          <div className="team-lab">
            <h2>Team Lab — Editable Party</h2>
            <button onClick={addToParty} disabled={playerParty.length >= 6}>Add Pokémon</button>
            <div className="party-grid">
              {playerParty.map((p, i) => {
                const data = pokemonData.find(d => d.name === p.species);
                return (
                  <div key={i} className="pokemon-card">
                    <h3>
                      <input value={p.nickname || p.species} onChange={e => updatePartyMon(i, { nickname: e.target.value })} placeholder="Nickname" />
                    </h3>
                    <select value={p.species} onChange={e => updatePartyMon(i, { species: e.target.value, ability: pokemonData.find(d => d.name === e.target.value)?.abilities[0] || '' })}>
                      {pokemonData.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    <label>Level: <input type="number" value={p.level} onChange={e => updatePartyMon(i, { level: parseInt(e.target.value) || 1 })} min={1} max={100} /></label>
                    <label>Nature: <input value={p.nature} onChange={e => updatePartyMon(i, { nature: e.target.value })} /></label>
                    <label>Ability: <input value={p.ability} onChange={e => updatePartyMon(i, { ability: e.target.value })} /></label>
                    <div>Moves:</div>
                    {p.moves.map((m, mi) => (
                      <input key={mi} value={m} onChange={e => {
                        const newMoves = [...p.moves];
                        newMoves[mi] = e.target.value;
                        updatePartyMon(i, { moves: newMoves });
                      }} />
                    ))}
                    <button onClick={() => removeFromParty(i)}>Remove</button>
                    {data && <p>Types: {data.types.join('/')} | Base: {Object.values(data.baseStats).join('/')}</p>}
                  </div>
                );
              })}
            </div>
            <div className="team-analysis card">
              <h3>Team Analysis</h3>
              <p>Coverage, weaknesses, and suggestions update based on your editable party. Persistence via localStorage.</p>
            </div>
          </div>
        )}
        {activeTab === 'battle' && (
          <div className="battle-intel">
            <h2>Battle Intel — Gen III Engine</h2>
            {visibleTrainers.map(t => (
              <div key={t.id} className="trainer-card card">
                <h3>{t.name} ({t.class}) — {t.location} {t.variant && `(${t.variant})`}</h3>
                <button onClick={() => toggleTrainer(t.id)}>{defeatedTrainers.has(t.id) ? 'Defeated ✓' : 'Mark Defeated'}</button>
                <div className="team">
                  {t.team.map((m, i) => {
                    const mon = pokemonData.find(p => p.name === m.species);
                    return <div key={i}>{m.species} Lv.{m.level} — {m.moves.join(', ')} {mon && `(${mon.types.join('/')})`}</div>;
                  })}
                </div>
                <div className="analysis">
                  <h4>Matchup vs Your Team</h4>
                  {analyzeMatchup(t).map((a, i) => (
                    <p key={i}>{a.opponent} Lv.{a.level}: Best {a.bestCounter} ({a.bestMove}) — Danger: {a.danger}</p>
                  ))}
                </div>
              </div>
            ))}
            <div className="mechanics-note card">
              <p><strong>Gen III Damage Formula Implemented:</strong></p>
              <p>((((2 × Level / 5 + 2) × Power × A / D) / 50) + 2) × STAB × Type × Crit × Random(0.85-1.0)</p>
              <p>Physical/Special by type. Full type chart. Uses calculated battle stats (level, base, IV, EV, nature) from src/utils/battle.ts. Transparent assumptions: no burn/screens/items/weather.</p>
              <p>Example calc available in matchup. Move data structured.</p>
            </div>
          </div>
        )}
        {activeTab === 'missions' && (
          <div className="missions">
            <h2>Mission Control</h2>
            {visibleMissions.map(m => (
              <div key={m.id} className="mission-card card">
                <h3>{m.title}</h3>
                <p><strong>Category:</strong> {m.category} | <strong>Location:</strong> {m.location}</p>
                <p><strong>Prerequisites:</strong> {m.prerequisites.join(', ') || 'None'}</p>
                <ol>
                  {m.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <p><strong>Rewards:</strong> {m.rewards.join(', ')}</p>
                <p><strong>Unlocks:</strong> {m.unlocks.join(', ')}</p>
                <button onClick={() => toggleMission(m.id)}>
                  {completedMissions.has(m.id) ? 'Completed ✓' : 'Mark Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'pokedex' && (
          <div className="pokedex">
            <h2>FireRed Pokédex ({pokemonData.length} species)</h2>
            <div className="dex-grid">
              {pokemonData.map(p => (
                <div key={p.id} className="dex-card card">
                  <h3>#{p.id} {p.name}</h3>
                  <p>Types: {p.types.join(' / ')}</p>
                  <p>Abilities: {p.abilities.join(', ')}</p>
                  <p>Learnset: {p.learnset.slice(0, 4).join(', ')}...</p>
                  <div className="base-stats">BST: {Object.values(p.baseStats).reduce((a, b) => a + b, 0)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
