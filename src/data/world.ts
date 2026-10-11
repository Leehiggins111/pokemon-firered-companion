import rematches from './rematches.json';
import pokemonJson from './full/pokemon.json';
import movesJson from './full/moves.json';
import mapsJson from './full/maps.json';
import trainersJson from './full/trainers.json';
import tradesJson from './full/trades.json';
import towerJson from './full/tower.json';
import itemsJson from './full/items.json';
import { mapStage } from './journey';
const ultimateTutors:Record<string,string>={VENUSAUR:'FRENZY_PLANT',CHARIZARD:'BLAST_BURN',BLASTOISE:'HYDRO_CANNON'};
export const species=pokemonJson.map(p=>({...p,baseStats:p.key==='DEOXYS'?{hp:50,atk:180,def:20,spa:180,spd:20,spe:150}:p.baseStats,tutors:[...new Set([...p.tutors,...(ultimateTutors[p.key]?[ultimateTutors[p.key]]:[])])]}));
export type Species=typeof species[number];
export const moveData=movesJson;
export const world=mapsJson.map(m=>({...m,region:/MAP_NAVEL_ROCK/.test(m.id)?'Sevii':m.region}));
export type WorldMap=typeof world[number];
export const rematchData:Record<string,{location:string;stage:number}>=rematches;
export const trainerData=trainersJson.map(t=>({...t,locations:rematchData[t.id]?[rematchData[t.id].location]:t.locations,name:/RIVAL|CHAMPION/.test(t.id)?'Rival':t.name}));
export type Trainer=typeof trainerData[number];
export const itemData=itemsJson;
export const tradeData=tradesJson;
const towerPointers:Record<string,string>={Mixed_4:'Double_8',Mixed_6:'Knockout_8',Mixed_7:'Double_3',Mixed_8:'Knockout_2'};
export const towerData=['Single','Double','Knockout','Mixed'].flatMap(challenge=>Array.from({length:8},(_,i)=>{const id=challenge+'_'+(i+1);const source=towerJson.find(x=>x.id===(towerPointers[id]||id))!;return {...source,id,challenge}}));
export const speciesByKey=new Map(species.map(p=>[p.key,p]));
export const mapsById=new Map(world.map(m=>[m.id,m]));
export const movesByKey=new Map(moveData.map(m=>[m.id,m]));
export const trainersById=new Map(trainerData.map(t=>[t.id,t]));
export const human=(s:string)=>s.replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
export const asset=(path:string)=>`${import.meta.env.BASE_URL}game/${path}`;
export function allowedMap(id:string,stage:number,wiki:boolean){return wiki||mapStage(id)<=stage;}
export function trainerStage(t:Trainer){if(/CHAMPION_REMATCH|ELITE_FOUR_.*_2$/.test(t.id))return 11;if(/ROUTE22_LATE/.test(t.id))return 8;if(rematchData[t.id]?.stage)return Math.max(rematchData[t.id].stage,...t.locations.map(mapStage));if(/_(2|3|4|5|6)$/.test(t.id))return 9;return Math.min(...t.locations.map(mapStage));}
export function rivalAllowed(id:string,starter:string){
 if(!/RIVAL|CHAMPION/.test(id))return true;
 // Trainer constants identify the RIVAL'S starter, not the player's.
 const rival=starter==='BULBASAUR'?'CHARMANDER':starter==='CHARMANDER'?'SQUIRTLE':'BULBASAUR';
 return !/CHARMANDER|SQUIRTLE|BULBASAUR/.test(id)||id.includes(rival);
}
export function encounterRows(m:WorldMap){
 const rows=new Map<string,{species:string;method:string;min:number;max:number;chance:number}>();
 for(const e of m.encounters){const key=e.species+e.method;const old=rows.get(key);if(old){old.chance+=e.chance;old.min=Math.min(old.min,e.min);old.max=Math.max(old.max,e.max)}else rows.set(key,{...e});}
 return [...rows.values()];
}

export function trainerLabel(t:Trainer){return /CHAMPION/.test(t.id)?'Champion Rival':/RIVAL/.test(t.id)?'Rival':`${t.trainerClass} ${t.name}`}
