import {NATURES} from '@smogon/calc';
import {species,speciesByKey,movesByKey,mapsById} from '../data/world';
export type Stat='hp'|'atk'|'def'|'spa'|'spd'|'spe';
export const stats:Stat[]=['hp','atk','def','spa','spd','spe'];
export interface PartyMon {species:string;nickname:string;level:number;nature:string;ability:string;item:string;moves:string[];ivs:Record<Stat,number>;evs:Record<Stat,number>}
export interface Save {version:2;starter:string;party:PartyMon[];stage:number;wiki:boolean;location:string;completed:string[];defeated:string[];collected:string[];caught:string[];notes:string;}
export const saveKey='firered-ultimate-v2';
export function mon(key='CHARMANDER',level=5):PartyMon {const p=speciesByKey.get(key)!;return{species:key,nickname:'',level,nature:'Hardy',ability:p.abilities[0],item:'',moves:p.learnset.filter(l=>l.level<=level).map(l=>l.move).filter((v,i,a)=>a.indexOf(v)===i).slice(-4),ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31},evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}};}
export function fresh():Save{return {version:2,starter:'CHARMANDER',party:[mon()],stage:0,wiki:false,location:'MAP_PALLET_TOWN',completed:[],defeated:[],collected:[],caught:[],notes:''}}
export function validateSave(input:unknown):Save {
 if(!input||typeof input!=='object')throw Error('Invalid adventure file');
 const v=input as Partial<Save>;if(v.version!==2||!Array.isArray(v.party)||v.party.length>6)throw Error('Use a version 2 adventure backup with up to six Pokémon.');
 const s=fresh();s.starter=speciesByKey.has(v.starter||'')?v.starter!:s.starter;s.stage=Math.max(0,Math.min(11,Math.floor(Number(v.stage)||0)));s.wiki=!!v.wiki;s.location=mapsById.has(v.location||'')?v.location!:s.location;
 s.party=v.party.map(x=>{if(!speciesByKey.has(x.species))throw Error('Unknown species in backup');const p=mon(x.species);return{...p,nickname:String(x.nickname||'').slice(0,30),level:Math.max(1,Math.min(100,Math.floor(Number(x.level)||1))),nature:Object.keys(NATURES).includes(x.nature)?x.nature:'Hardy',ability:speciesByKey.get(x.species)!.abilities.includes(x.ability)?x.ability:p.ability,item:String(x.item||''),moves:(Array.isArray(x.moves)?x.moves:[]).filter(k=>movesByKey.has(k)).slice(0,4),ivs:Object.fromEntries(stats.map(k=>[k,Math.max(0,Math.min(31,Math.floor(Number(x.ivs?.[k])||0)))])) as Record<Stat,number>,evs:Object.fromEntries(stats.map(k=>[k,Math.max(0,Math.min(255,Math.floor(Number(x.evs?.[k])||0)))])) as Record<Stat,number>}});
 for(const k of ['completed','defeated','collected','caught'] as const)s[k]=Array.isArray(v[k])?[...new Set(v[k]!.filter(x=>typeof x==='string'))]:[];
 if(s.party.some(p=>Object.values(p.evs).reduce((a,b)=>a+b,0)>510))throw Error('A party Pokémon exceeds the 510 EV budget.');
 s.notes=String(v.notes||'').slice(0,20000);return s;
}
export function loadSave(storage:Pick<Storage,'getItem'>):Save {
 const current=storage.getItem(saveKey);if(current)return validateSave(JSON.parse(current));
 const legacy=storage.getItem('firered-progress');if(!legacy)return fresh();const v=JSON.parse(legacy);const s=fresh();
 const locate:Record<string,string>={pallet:'MAP_PALLET_TOWN',viridian:'MAP_VIRIDIAN_CITY',route1:'MAP_ROUTE1',route2:'MAP_ROUTE2',pewter:'MAP_PEWTER_CITY',viridian_forest:'MAP_VIRIDIAN_FOREST',route22:'MAP_ROUTE22',pewter_gym:'MAP_PEWTER_CITY_GYM'};
 s.location=locate[v.location]||s.location;s.stage=Math.min(11,Number(v.progress)||0);s.wiki=!!v.wiki;const missions:Record<string,string>={choose_starter:'starter',deliver_parcel:'parcel',defeat_brock:'brock'};const trainers:Record<string,string>={brock:'LEADER_BROCK',camper_liam:'CAMPER_LIAM',bug_rick:'BUG_CATCHER_RICK',bug_doug:'BUG_CATCHER_DOUG',bug_sammy:'BUG_CATCHER_SAMMY',bug_charlie:'BUG_CATCHER_CHARLIE',bug_anthony:'BUG_CATCHER_ANTHONY'};s.completed=(v.completed||[]).map((id:string)=>missions[id]||id);s.defeated=(v.defeated||[]).map((id:string)=>{const r=id.match(/^rival_(pallet|route22)_(bulbasaur|charmander|squirtle)$/);if(r){const opponent:Record<string,string>={bulbasaur:'CHARMANDER',charmander:'SQUIRTLE',squirtle:'BULBASAUR'};return 'RIVAL_'+(r[1]==='pallet'?'OAKS_LAB_':'ROUTE22_EARLY_')+opponent[r[2]]}return trainers[id]||id});s.starter=species.find(p=>p.name===v.starter)?.key||s.starter;
 if(Array.isArray(v.party))s.party=v.party.slice(0,6).flatMap((p:{species:string;level:number;moves:string[];nature:string;ability:string;nickname:string})=>{const sp=species.find(x=>x.name===p.species);if(!sp)return[];return[{...mon(sp.key,Math.max(1,Math.min(100,p.level))),nature:p.nature||'Hardy',ability:p.ability||sp.abilities[0],nickname:p.nickname||'',moves:p.moves.map(n=>[...movesByKey.values()].find(m=>m.name.toLowerCase()===n.toLowerCase())?.id).filter((x):x is string=>!!x).slice(0,4)}]});return s;
}
export function toggle(list:string[],id:string){return list.includes(id)?list.filter(x=>x!==id):[...list,id]}
