import { earlyLocations as locations } from '../data/earlySlice';
import type { Location } from '../data/gameData';

interface SchematicMapProps {
  currentLocation: string;
  onSelectLocation: (id: string) => void;
  wikiMode: boolean;
  progressLevel: number;
}

// High-quality schematic for Pallet → Pewter vertical slice.
// Styled as a game-like route map with labeled paths and building markers.
// Not authentic tile maps (licensing constraint); interactive and denser than simple circles.
export default function SchematicMap({ currentLocation, onSelectLocation, wikiMode, progressLevel }: SchematicMapProps) {
  const visible = locations.filter(loc => wikiMode || loc.spoilerLevel <= progressLevel);

  // Scale schematic coords (lat/lng stored as 0–50 range) into SVG space
  const scaleX = (lng: number) => 40 + lng * 8;
  const scaleY = (lat: number) => 40 + lat * 8;

  const connections = visible.flatMap(loc =>
    loc.connections
      .map(id => locations.find(l => l.id === id))
      .filter((conn): conn is Location => !!conn && (wikiMode || conn.spoilerLevel <= progressLevel))
      .map(conn => ({ from: loc, to: conn }))
  );

  return (
    <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0, color: '#e3350d' }}>FireRed Schematic Map</h3>
      <p style={{ fontSize: '0.85rem', color: '#9aa0a6', marginBottom: 12 }}>
        Pure SVG layout of location connections. No OpenStreetMap tiles. Positions are schematic (not in-game tile coordinates).
      </p>
      <svg width="100%" height="420" viewBox="0 0 600 420" style={{ background: '#0f0f1a', borderRadius: 8 }}>
        {connections.map((c, i) => (
          <line
            key={i}
            x1={scaleX(c.from.lng)}
            y1={scaleY(c.from.lat)}
            x2={scaleX(c.to.lng)}
            y2={scaleY(c.to.lat)}
            stroke="#e3350d"
            strokeWidth="2"
            opacity="0.6"
          />
        ))}
        {visible.map(loc => {
          const isCurrent = loc.id === currentLocation;
          return (
            <g key={loc.id} onClick={() => onSelectLocation(loc.id)} style={{ cursor: 'pointer' }}>
              <circle
                cx={scaleX(loc.lng)}
                cy={scaleY(loc.lat)}
                r={isCurrent ? 10 : 7}
                fill={isCurrent ? '#ffcb05' : '#3b4cca'}
                stroke="#fff"
                strokeWidth="1.5"
              />
              <text
                x={scaleX(loc.lng) + 12}
                y={scaleY(loc.lat) + 4}
                fill="#eee"
                fontSize="11"
                fontFamily="system-ui, sans-serif"
              >
                {loc.name}
              </text>
            </g>
          );
        })}
      </svg>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 8 }}>
        Click a location to set it as current. Adventure Mode hides later spoilers.
      </p>
    </div>
  );
}
