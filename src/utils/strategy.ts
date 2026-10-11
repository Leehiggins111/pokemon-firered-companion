import {calculate,Pokemon,Move,Field,Generations,NATURES} from '@smogon/calc';
import {speciesByKey,movesByKey,human} from '../data/world';
import type {PartyMon} from './save';
export const natures=Object.keys(NATURES);
const gen=Generations.get(3);
export function moveName(key:string){return ({VICE_GRIP:'Vise Grip',HI_JUMP_KICK:'High Jump Kick',FAINT_ATTACK:'Feint Attack',SMELLING_SALT:'Smelling Salts'} as Record<string,string>)[key]||movesByKey.get(key)?.name||human(key)}
export function calcName(key:string){return key==='DEOXYS'?'Deoxys-Attack':speciesByKey.get(key)?.name||human(key)}
export function calcMon(m:PartyMon){return new Pokemon(gen,calcName(m.species),{level:m.level,nature:m.nature,ability:m.ability,item:m.item,ivs:m.ivs,evs:m.evs,moves:m.moves.map(moveName)})}
export interface Conditions {weather:string;burn:boolean;reflect:boolean;lightScreen:boolean;crit:boolean;atkBoost:number;defBoost:number;double?:boolean;}
export const defaultConditions:Conditions={weather:'',burn:false,reflect:false,lightScreen:false,crit:false,atkBoost:0,defBoost:0};
export function damage(a:PartyMon,d:PartyMon,key:string,c:Conditions=defaultConditions){
 const attacker=calcMon(a),defender=calcMon(d);attacker.boosts.atk=c.atkBoost;attacker.boosts.spa=c.atkBoost;defender.boosts.def=c.defBoost;defender.boosts.spd=c.defBoost;
 if(c.burn)attacker.status='brn';
 const move=new Move(gen,moveName(key),{isCrit:c.crit});
 const field=new Field({gameType:c.double?'Doubles':'Singles',weather:c.weather as 'Sun'|'Rain'|'Sand'|'Hail'|undefined,defenderSide:{isReflect:c.reflect,isLightScreen:c.lightScreen}});
 const r=calculate(gen,attacker,defender,move,field);const [min,max]=r.range();return{min,max,hp:defender.stats.hp,minPercent:min/defender.stats.hp*100,maxPercent:max/defender.stats.hp*100,description:max>0?r.desc():'No direct damage roll: status, immunity or conditional move effect',speedA:attacker.stats.spe,speedD:defender.stats.spe,category:move.category,ko:max>0?r.kochance().text:'No direct damage roll'};
}
export function effectiveness(type:string,defending:string[]){let result=1;for(const t of defending)result*=gen.types.get(type.toLowerCase() as never)?.effectiveness[t as never]??1;return result}
