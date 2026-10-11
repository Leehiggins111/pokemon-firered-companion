import {world,species,moveData,itemData,trainerData,allowedMap,encounterRows,rivalAllowed,trainerStage,human,tradeData,trainerLabel} from '../data/world';
import {objectives} from '../data/journey';
import type {Save} from './save';
export interface Hit {id:string;title:string;detail:string;kind:'map'|'pokemon'|'move'|'item'|'trainer'|'mission';target:string;}
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
export function knownSpecies(s:Save){
 if(s.wiki)return species;
 const keys=new Set(['BULBASAUR','CHARMANDER','SQUIRTLE',...s.party.map(p=>p.species),...s.caught]);
 world.filter(m=>allowedMap(m.id,s.stage,false)).forEach(m=>[...m.encounters,...m.scripted].forEach(e=>keys.add(e.species)));
 tradeData.filter(t=>t.locations.some(l=>allowedMap(l,s.stage,false))).forEach(t=>keys.add(t.species));
 for(let i=0;i<3;i++)species.filter(p=>keys.has(p.key)).forEach(p=>p.evolutions.forEach(e=>{const evolved=species.find(x=>x.key===e.species);if(evolved&&(evolved.id<=151||s.stage>=9))keys.add(e.species)}));
 return species.filter(p=>keys.has(p.key));
}
export function brain(query:string,s:Save):Hit[]{
 const text=query.toLowerCase().trim();if(!text)return[];
 const tokens=text.split(/[^a-z0-9]+/).filter(w=>w.length>1&&!['where','can','find','catch','how','the','does','what','get','give','with','my','for','from','learn','evolve','pokemon','pokémon','need','should','use','is','do','to','in','of','a','i','and'].includes(w));
 const visibleMaps=world.filter(m=>allowedMap(m.id,s.stage,s.wiki));
 const candidates:Hit[]=[];
 if(/next|stuck|what should i do/.test(text)){const o=objectives.find(o=>!o.side&&o.stage===s.stage&&!s.completed.includes(o.id));if(o)return [{id:'next-'+o.id,title:o.title,detail:o.steps.join(' '),kind:'mission',target:o.id}]}

 const p=knownSpecies(s).find(p=>norm(text).includes(norm(p.name)));
 if(p){
  candidates.push({id:'p-'+p.key,title:p.name,kind:'pokemon',target:p.key,detail:`${p.types.join(' / ')} · ${p.abilities.join(' / ')}. Evolutions: ${p.evolutions.map(e=>`${human(e.method)} ${human(e.condition)} → ${human(e.species)}`).join('; ')||'Final stage'}.`});
  if(/where|catch|find|location/.test(text))for(const m of visibleMaps){const rows=encounterRows(m).filter(e=>e.species===p.key);if(rows.length)candidates.push({id:'enc-'+m.id,title:m.name,kind:'map',target:m.id,detail:rows.map(e=>`${e.method} · Lv.${e.min}–${e.max} · ${e.chance}% slots`).join('; ')})}
  if(/where|catch|find|location/.test(text)){for(const m of visibleMaps){const events=m.scripted.filter(e=>e.species===p.key);if(events.length)candidates.push({id:'event-'+m.id,title:m.name,kind:'map',target:m.id,detail:events.map(e=>`${e.kind} · ${p.name} Lv.${e.level}`).join('; ')})}for(const t of tradeData.filter(t=>t.species===p.key))for(const l of t.locations){const m=visibleMaps.find(m=>m.id===l);if(m)candidates.push({id:'trade-'+t.id,title:m.name,kind:'map',target:l,detail:`Trade your ${human(t.requested)} for ${p.name}.`})}}
  if(/learn|move|level/.test(text))p.learnset.forEach(l=>candidates.push({id:'learn-'+l.move+l.level,title:human(l.move),detail:`${p.name} learns this at level ${l.level}.`,kind:'move',target:l.move}));
 }
 for(const m of visibleMaps)candidates.push({id:m.id,title:m.name,detail:`${m.encounters.length} encounter slots · ${m.trainers.length} trainers · ${m.items.map(human).join(', ')}`,kind:'map',target:m.id});
 for(const p of knownSpecies(s))candidates.push({id:'species-'+p.key,title:p.name,detail:p.types.join(' / ')+' · '+p.abilities.join(' / '),kind:'pokemon',target:p.key});
 for(const m of moveData)candidates.push({id:'move-'+m.id,title:m.name,detail:`Gen III ${m.type} / ${m.category} · power ${m.power} · accuracy ${m.accuracy||'—'} · PP ${m.pp}`,kind:'move',target:m.id});
 for(const i of itemData){const locations=visibleMaps.filter(m=>m.items.includes(i.id));if(!s.wiki&&!locations.length)continue;candidates.push({id:'item-'+i.id,title:i.name,detail:i.description+' '+(locations.length?'Sources: '+locations.map(m=>m.name).join(', '):'No map event source; may be purchased, held or obtained by exchange.'),kind:'item',target:i.id});}
 for(const t of trainerData.filter(t=>rivalAllowed(t.id,s.starter)&&(s.wiki||trainerStage(t)<=s.stage)))candidates.push({id:t.id,title:trainerLabel(t),detail:t.team.map(m=>`${human(m.species)} Lv.${m.level}`).join(', '),kind:'trainer',target:t.id});
 for(const o of objectives.filter(o=>s.wiki||o.stage<=s.stage))candidates.push({id:o.id,title:o.title,detail:o.steps.join(' '),kind:'mission',target:o.id});
 const rank=(h:Hit)=>tokens.reduce((score,w)=>score+(h.title.toLowerCase().includes(w)?8:h.detail.toLowerCase().includes(w)?2:0),0)+(p&&(/^(enc|event|trade)-/.test(h.id))?30:0)+(h.id==='p-'+p?.key?35:0);
 return candidates.filter(h=>rank(h)>0).sort((a,b)=>rank(b)-rank(a)).filter((h,i,a)=>a.findIndex(x=>x.id===h.id)===i).slice(0,60);
}
