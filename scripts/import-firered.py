"""Reproducible FireRed extraction and native tile renderer. Usage: python3 scripts/import-firered.py PATH"""
import json,re,sys,struct,subprocess
from pathlib import Path
from PIL import Image
root=Path(sys.argv[1]); dest=Path(__file__).resolve().parents[1]; out=dest/'src/data/full'; out.mkdir(parents=True,exist_ok=True)
assets=dest/'public/game'; (assets/'maps').mkdir(parents=True,exist_ok=True); (assets/'pokemon').mkdir(exist_ok=True)
def read(p):
 text=(root/p).read_text();text=re.sub(r'#if defined\(FIRERED\)(.*?)#(?:elif defined\(LEAFGREEN\)|else)(.*?)#endif',r'\1',text,flags=re.S);return text
def pretty(s): return s.replace('_',' ').title().replace('Pokemon','Pokémon')
def blocks(text,prefix):
 matches=list(re.finditer(r'\['+prefix+r'_(\w+)\]\s*=',text)); return {m.group(1):text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)] for i,m in enumerate(matches)}
def field(b,k,default=''): 
 m=re.search(r'\.'+k+r'\s*=\s*([^,\n]+)',b); return m.group(1).strip() if m else default
national=re.findall(r'NATIONAL_DEX_(\w+)',read('include/constants/pokedex.h').split('// Hoenn')[0])
# National numbering includes all three generations, excluding trailing Unown forms.
national=re.findall(r'^\s*NATIONAL_DEX_(\w+)\s*[,=]',read('include/constants/pokedex.h'),re.M)[:387]
ids={n:i for i,n in enumerate(national)}
namefix={'NIDORAN_F':'Nidoran-F','NIDORAN_M':'Nidoran-M','MR_MIME':'Mr. Mime','FARFETCHD':"Farfetch’d",'HO_OH':'Ho-Oh'}
def name(n): return namefix.get(n,pretty(n))
physical={'NORMAL','FIGHTING','FLYING','POISON','GROUND','ROCK','BUG','GHOST','STEEL'}
moveblocks=blocks(read('src/data/battle_moves.h'),'MOVE'); moves=[]
for k,b in moveblocks.items():
 if k=='NONE':continue
 typ=field(b,'type').replace('TYPE_',''); power=int(field(b,'power','0'))
 moves.append(dict(id=k,name=pretty(k),type=pretty(typ),category='Status' if power==0 else ('Physical' if typ in physical else 'Special'),power=power,accuracy=int(field(b,'accuracy','0')),pp=int(field(b,'pp','0')),effect=field(b,'effect').replace('EFFECT_',''),priority=int(field(b,'priority','0'))))
moveby={m['id']:m for m in moves}
learn={k:[dict(level=int(l),move=m) for l,m in re.findall(r'LEVEL_UP_MOVE\((\d+), MOVE_(\w+)\)',b)] for k,b in re.findall(r'static const u16 (\w+)\[\]\s*=\s*\{(.*?)\};',read('src/data/pokemon/level_up_learnsets.h'),re.S)}
pointers=dict(re.findall(r'\[SPECIES_(\w+)\]\s*=\s*(\w+)',read('src/data/pokemon/level_up_learnset_pointers.h')))
tms={k:re.findall(r'TMHM\(((?:TM|HM)\d+)_([A-Z_]+)\)',b) for k,b in re.findall(r'\[SPECIES_(\w+)\]\s*=\s*TMHM_LEARNSET\((.*?)(?=\n\s*\[|\n\};)',read('src/data/pokemon/tmhm_learnsets.h'),re.S)}
tutors={k:re.findall(r'TUTOR\(MOVE_(\w+)\)',b) for k,b in re.findall(r'\[SPECIES_(\w+)\]\s*=\s*(.*?)(?=\n\s*\[|\n\};)',read('src/data/pokemon/tutor_learnsets.h'),re.S)}
evos={k:[dict(method=pretty(a.replace('EVO_','')),condition=pretty(c.replace('ITEM_','')),species=s) for a,c,s in re.findall(r'\{(EVO_\w+),\s*(\w+),\s*SPECIES_(\w+)\}',b)] for k,b in re.findall(r'\[SPECIES_(\w+)\]\s*=\s*(.*?)(?=\n\s*\[|\n\};)',read('src/data/pokemon/evolution.h'),re.S)}
dexblocks=blocks(read('src/data/pokemon/pokedex_entries.h'),'NATIONAL_DEX')
dextexts={k:''.join(re.findall(r'"([^"]*)"',b)).replace('\\n',' ') for k,b in re.findall(r'const u8 (g\w+PokedexText)\[\] = _\((.*?)\);',read('src/data/pokemon/pokedex_text_fr.h'),re.S)}
pokemon=[]
for k,b in blocks(read('src/data/pokemon/species_info.h'),'SPECIES').items():
 if k not in ids or ids[k]==0:continue
 stats={short:int(field(b,long,'0')) for short,long in [('hp','baseHP'),('atk','baseAttack'),('def','baseDefense'),('spa','baseSpAttack'),('spd','baseSpDefense'),('spe','baseSpeed')]}
 if not stats['hp']:continue
 p=dict(id=ids[k],key=k,name=name(k),types=list(dict.fromkeys(pretty(x) for x in re.findall(r'TYPE_(\w+)',field(b,'types')+b.split('.types =')[1].split('\n')[0] if '.types =' in b else ''))),baseStats=stats,abilities=list(dict.fromkeys(pretty(x) for x in re.findall(r'ABILITY_(\w+)',b) if x!='NONE')),learnset=learn.get(pointers.get(k),[]),machines=[dict(machine=a,move=c) for a,c in tms.get(k,[])],tutors=tutors.get(k,[]),evolutions=evos.get(k,[]),catchRate=int(field(b,'catchRate','0')),growth=pretty(field(b,'growthRate').replace('GROWTH_','')))
 # types are read separately, without the comma truncation of field().
 d=dexblocks.get(k,'');p['description']=dextexts.get(field(d,'description'),'');p['height']=int(field(d,'height','0'))/10;p['weight']=int(field(d,'weight','0'))/10;p['eggGroups']=list(dict.fromkeys(pretty(e) for e in re.findall(r'EGG_GROUP_(\w+)',b)));p['heldItems']=[pretty(i) for i in re.findall(r'\.item(?:Common|Rare) = ITEM_(\w+)',b) if i!='NONE']
 p['eggMoves']=re.findall(r'MOVE_(\w+)',next((b for sp,b in re.findall(r'egg_moves\((\w+),(.*?)\),',read('src/data/pokemon/egg_moves.h'),re.S) if sp==k),''))
 p['types']=list(dict.fromkeys(pretty(x) for x in re.findall(r'TYPE_(\w+)',re.search(r'\.types\s*=\s*\{([^}]+)',b).group(1))))
 folder=root/'graphics/pokemon'/k.lower(); front=folder/'front.png'; pal=folder/'normal.pal'
 if k=='UNOWN':front=folder/'a/front.png'
 if k=='CASTFORM':front=folder/'normal/front.png';pal=folder/'normal/normal.pal'
 if front.exists():
  im=Image.open(front); colors=[int(v) for line in pal.read_text().splitlines()[3:] for v in line.split()]; im.putpalette(colors+[0]*(768-len(colors))); im.info['transparency']=0; im.convert('RGBA').crop((0,0,64,64)).save(assets/'pokemon'/f'{k}.png')
 pokemon.append(p)
pokemon.sort(key=lambda p:p['id']); pb={p['key']:p for p in pokemon}
parties={}
for k,b in re.findall(r'sParty_(\w+)\[\]\s*=\s*\{(.*?)\};',read('src/data/trainer_parties.h'),re.S):
 team=[]
 for mon in re.findall(r'\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}',b,re.S):
  species=field(mon,'species').replace('SPECIES_','')
  if species not in pb:continue
  level=int(field(mon,'lvl','1')); explicit=re.findall(r'MOVE_(\w+)',mon)
  learned=list(dict.fromkeys(x['move'] for x in pb[species]['learnset'] if x['level']<=level))
  team.append(dict(species=species,level=level,moves=[x for x in explicit if x!='NONE'] if explicit else learned[-4:],iv=int(field(mon,'iv','0'))*31//255,item=field(mon,'heldItem','ITEM_NONE').replace('ITEM_','')))
 if team:parties[k]=team
trainers={}
for k,b in blocks(read('src/data/trainers.h'),'TRAINER').items():
 n=re.search(r'\.trainerName\s*=\s*_\("([^"]*)"\)',b); party=re.search(r'sParty_(\w+)',b)
 if not n or not n.group(1) or not party or party.group(1) not in parties:continue
 trainers[k]=dict(id=k,name=n.group(1).title(),trainerClass=pretty(field(b,'trainerClass').replace('TRAINER_CLASS_','')),team=parties[party.group(1)],double=field(b,'doubleBattle')=='TRUE',items=re.findall(r'ITEM_(\w+)',field(b,'items')),locations=[])
items=[dict(id=i['itemId'].replace('ITEM_',''),name=i['english'].title(),price=i['price'],description=i.get('description_english','').replace('\\n',' ').replace('\\p',' '),pocket=pretty(i['pocket'].replace('POCKET_',''))) for i in json.loads(read('src/data/items.json'))['items'] if i['itemId']!='ITEM_NONE' and '?' not in i['english']]
for i in items:
 if re.match(r'^(TM|HM)\d+_',i['id']):i['name']=pretty(i['id']);i['id']=i['id'].split('_')[0]
# Exact ROM encounter slot weights; fishing separated by rod.
encounters={}
for group in json.loads(read('src/data/wild_encounters.json'))['wild_encounter_groups']:
 weights={f['type']:f.get('encounter_rates',[]) for f in group.get('fields',[])}
 for e in group.get('encounters',[]):
  if 'LeafGreen' in e.get('base_label',''):continue
  mid=e.get('map');
  if not mid:continue
  rows=[]
  for kind in ['land_mons','water_mons','rock_smash_mons','fishing_mons']:
   if kind not in e:continue
   for i,m in enumerate(e[kind]['mons']):
    method={'land_mons':'Grass / cave','water_mons':'Surf','rock_smash_mons':'Rock Smash','fishing_mons': 'Old Rod' if i<2 else 'Good Rod' if i<5 else 'Super Rod'}[kind]
    rates=weights.get(kind,[]); weight=rates[i] if i<len(rates) else 0
    rows.append(dict(species=m['species'].replace('SPECIES_',''),min=m['min_level'],max=m['max_level'],method=method,chance=weight))
  encounters[mid]=rows
layouts={l['id']:l for l in json.loads(read('data/layouts/layouts.json'))['layouts'] if 'id' in l}
# Tileset paths are authoritative C includes.
headers=read('src/data/tilesets/headers.h'); meta=read('src/data/tilesets/metatiles.h'); gfx=read('src/data/tilesets/graphics.h')
tilesets={}; tiledirs={}; paldirs={}
for k,b in re.findall(r'const struct Tileset (gTileset_\w+)\s*=\s*\{(.*?)\};',headers,re.S):
 m=re.search(re.escape(field(b,'metatiles'))+r'\[\].*?"([^"]+)"',meta)
 if m:
  tilesets[k]=root/Path(m.group(1)).parent
  gm=re.search(re.escape(field(b,'tiles'))+r'\[\].*?"([^" ]+)"',gfx+'\n'+read('src/graphics.c'))
  pm=re.search(re.escape(field(b,'palettes'))+r'\[\]\[16\].*?"([^" ]+)"',gfx+'\n'+read('src/graphics.c'),re.S)
  tiledirs[k]=root/Path(gm.group(1)).parent if gm else tilesets[k]
  paldirs[k]=root/Path(pm.group(1)).parent if pm else tilesets[k]/'palettes'
cache={}
def render_tiles(primary,secondary):
 key=(primary,secondary)
 if key in cache:return cache[key]
 dirs=[tilesets[primary],tilesets[secondary]]; ims=[Image.open(tiledirs[k]/'tiles.png') for k in key]
 palettes=[]
 for i in range(16):
  d=paldirs[primary] if i<7 else paldirs[secondary]; f=d/f'{i:02}.pal'; colors=[tuple(map(int,l.split())) for l in f.read_text().splitlines()[3:]] if f.exists() else [(0,0,0)]*16; palettes.append(colors)
 data=[struct.unpack('<'+'H'*((d/'metatiles.bin').stat().st_size//2),(d/'metatiles.bin').read_bytes()) for d in dirs]
 rendered=[]
 for idx in range(1024):
  setid=0 if idx<640 else 1; offset=idx if idx<640 else idx-640
  tile=Image.new('RGBA',(16,16)); vals=data[setid][offset*8:offset*8+8]
  for layer in range(2):
   for sub in range(4):
    if layer*4+sub>=len(vals):continue
    val=vals[layer*4+sub]; tid=val&1023; im=ims[0] if tid<640 else ims[1]; ti=tid if tid<640 else tid-640; columns=im.width//8
    crop=im.crop(((ti%columns)*8,(ti//columns)*8,(ti%columns)*8+8,(ti//columns)*8+8))
    if val&1024:crop=crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if val&2048:crop=crop.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    palette=palettes[val>>12]; pix=Image.new('RGBA',(8,8)); pix.putdata([(*palette[int(v)%16],0 if int(v)%16==0 and layer==1 else 255) for v in crop.getdata()]); tile.alpha_composite(pix,((sub%2)*8,(sub//2)*8))
  rendered.append(tile)
 cache[key]=rendered;return rendered
global_scripts='\n'.join(p.read_text() for p in (root/'data/scripts').glob('*.inc'))
global_labels={k:b for k,b in re.findall(r'^(\w+)::\n(.*?)(?=^\w+::|\Z)',global_scripts,re.S|re.M)}
trades=[]
for k,b in blocks(read('src/data/ingame_trades.h'),'INGAME_TRADE').items():
 sp=field(b,'species').replace('SPECIES_','');requested=field(b,'requestedSpecies').replace('SPECIES_','').rstrip('} ')
 if sp in pb and requested in pb:trades.append(dict(id=k,species=sp,requested=requested,item=field(b,'heldItem').replace('ITEM_',''),locations=[]))
tower=[]
for key,b in re.findall(r'static const struct TrainerTowerFloor sTrainerTowerFloor_(\w+) = \{(.*?)\n\};',read('src/trainer_tower_sets.c'),re.S):
 people=[]
 for n,body in re.findall(r'\.name = _\("([^"]+)"\),(.*?)(?=\.name =|\Z)',b,re.S):
  mons=[]
  for sp,body2 in re.findall(r'\.species = SPECIES_(\w+),(.*?)(?=\.species =|\Z)',body,re.S):
   if sp not in pb:continue
   mons.append(dict(species=sp,item=field(body2,'heldItem').replace('ITEM_',''),moves=re.findall(r'MOVE_(\w+)',body2.split('.moves =')[1].split('}')[0] if '.moves =' in body2 else ''),nature=(re.search(r'// (?:MALE|FEMALE|GENDERLESS) (\w+)',body2).group(1).title() if re.search(r'// (?:MALE|FEMALE|GENDERLESS) (\w+)',body2) else 'Hardy'),ivs={short:int(field(body2,long,'0')) for short,long in [('hp','hpIV'),('atk','attackIV'),('def','defenseIV'),('spa','spAttackIV'),('spd','spDefenseIV'),('spe','speedIV')]},evs={short:int(field(body2,long,'0')) for short,long in [('hp','hpEV'),('atk','attackEV'),('def','defenseEV'),('spa','spAttackEV'),('spd','spDefenseEV'),('spe','speedEV')]}))
  if mons:people.append(dict(name=n.title(),team=mons))
 if people:tower.append(dict(id=key,challenge=pretty(field(b,'challengeType').replace('CHALLENGE_TYPE_','')),trainers=people))
maps=[]
for f in sorted((root/'data/maps').glob('*/map.json')):
 m=json.loads(f.read_text()); layout=layouts.get(m['layout']);
 if not layout:continue
 scripts=(f.parent/'scripts.inc').read_text() if (f.parent/'scripts.inc').exists() else ''; text=(f.parent/'text.inc').read_text() if (f.parent/'text.inc').exists() else ''
 scripts += '\n'+'\n'.join(k+'::\n'+b for k,b in global_labels.items() if k.startswith(m['name']+'_'))
 tids=list(dict.fromkeys(re.findall(r'TRAINER_(\w+)',scripts))); tids=[t for t in tids if t in trainers]
 for t in tids:trainers[t]['locations'].append(m['id'])
 objects=[]
 labels={k:b for k,b in re.findall(r'^(\w+)::\n(.*?)(?=^\w+::|\Z)',scripts,re.S|re.M)}
 for i,e in enumerate(m.get('object_events',[])):
  b=labels.get(e.get('script'), global_labels.get(e.get('script'),'')); ts=[t for t in re.findall(r'TRAINER_(\w+)',b) if t in trainers]; its=re.findall(r'(?:giveitem|additem|finditem)\s+(?:ITEM_)?(\w+)',b)
  objects.append(dict(id=f"{m['id']}:object:{i}",x=e['x'],y=e['y'],kind='trainer' if ts else ('item' if its else 'npc'),trainers=ts,items=its,label=pretty(e.get('script','NPC').split('EventScript_')[-1])))
 for i,e in enumerate(m.get('bg_events',[])):
  if e.get('type')=='hidden_item':objects.append(dict(id=f"{m['id']}:hidden:{i}",x=e['x'],y=e['y'],kind='hidden',items=[e.get('item','').replace('ITEM_','')],label='Hidden item'))
 warps=[dict(id=f"{m['id']}:warp:{i}",x=e['x'],y=e['y'],target=e['dest_map'],targetWarp=e['dest_warp_id']) for i,e in enumerate(m.get('warp_events',[]))]
 dialogue=[''.join(re.findall(r'\.string "([^"]*)"',b)).replace('\\n',' ').replace('\\p','\n').replace('\\l',' ').replace('$','') for _,b in re.findall(r'^(\w+)::\n(.*?)(?=^\w+::|\Z)',text,re.S|re.M)]
 region='Sevii' if m['region_map_section'].startswith('MAPSEC_') and ('ISLAND' in m['region_map_section'] and not any(s in m['region_map_section'] for s in ['SEAFOAM','CINNABAR'])) or m['name'].startswith('OneIsland') or m['name'].startswith('TwoIsland') or m['name'].startswith('ThreeIsland') or m['name'].startswith('FourIsland') or m['name'].startswith('FiveIsland') or m['name'].startswith('SixIsland') or m['name'].startswith('SevenIsland') else 'Kanto'
 title=re.sub(r'([a-z])([A-Z0-9])',r'\1 \2',m['name']).replace('_',' · ')
 scripted=[dict(species=sp,level=int(l),kind='Stationary encounter') for sp,l in re.findall(r'setwildbattle SPECIES_(\w+),\s*(\d+)',scripts)] + [dict(species=sp,level=int(l),kind='Gift') for sp,l in re.findall(r'givemon SPECIES_(\w+),\s*(\d+)',scripts)]
 trade_ids=re.findall(r'INGAME_TRADE_(\w+)',scripts)
 for t in trades:
  if t['id'] in trade_ids:t['locations'].append(m['id'])
 record=dict(tradeIds=trade_ids,scripted=scripted,id=m['id'],name=title,section=pretty(m['region_map_section'].replace('MAPSEC_','')),region=region,width=layout['width'],height=layout['height'],trainers=tids,objects=objects,warps=warps,connections=m.get('connections',[]),encounters=encounters.get(m['id'],[]),items=list(dict.fromkeys(re.findall(r'ITEM_(\w+)',scripts))),dialogue=dialogue,flash=m.get('requires_flash',False),image=m['layout']+'.webp')
 # Region of dungeon sections follows map identifiers, including Mt Ember / Icefall.
 if m['name'].startswith(('MtEmber','TrainerTower','OneIsland','TwoIsland','ThreeIsland','FourIsland','FiveIsland','SixIsland','SevenIsland')):record['region']='Sevii'
 target=assets/'maps'/record['image']
 if not target.exists() and (assets/'maps'/(m['layout']+'.png')).exists():
  Image.open(assets/'maps'/(m['layout']+'.png')).save(target,lossless=True,method=6)
 if not target.exists():
  w,h=layout['width'],layout['height']; raw=(root/layout['blockdata_filepath']).read_bytes(); cells=struct.unpack('<'+'H'*(len(raw)//2),raw); tiles=render_tiles(layout['primary_tileset'],layout['secondary_tileset']); im=Image.new('RGBA',(w*16,h*16))
  for i,cell in enumerate(cells[:w*h]):im.alpha_composite(tiles[cell&1023],((i%w)*16,(i//w)*16))
  im.convert('RGB').save(target,lossless=True,method=6)
 maps.append(record)
# Exact Vs. Seeker map and progression references from the native rematch table.
rematches={}
for body,location in re.findall(r'\{\s*\{([^}]+)\},\s*MAP\((MAP_\w+)\)\s*\}',read('src/vs_seeker.c')):
 for index,token in enumerate(body.split(',')):
  key=token.strip().replace('TRAINER_','')
  if key not in ['SKIP','0',''] and key not in rematches:rematches[key]=dict(location=location,stage=[0,2,3,4,9,11][index])
(dest/'src/data/rematches.json').write_text(json.dumps(rematches,separators=(',',':')))
# Only trainers referenced by maps; exclude Ruby/Sapphire dummy parties.
for t in trainers.values():
 if not t['locations']:
  similar=[other for other in trainers.values() if other['name']==t['name'] and other['trainerClass']==t['trainerClass'] and other['locations']]
  if similar:t['locations']=list(dict.fromkeys(loc for other in similar for loc in other['locations']))
trainers=[t for t in trainers.values() if t['locations']]
for key,val in [('pokemon',pokemon),('moves',moves),('trainers',trainers),('items',items),('maps',maps),('trades',trades),('tower',tower)]: (out/f'{key}.json').write_text(json.dumps(val,ensure_ascii=False,separators=(',',':')))
source=dict(repository='https://github.com/pret/pokefirered',commit=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip(),counts=dict(pokemon=len(pokemon),moves=len(moves),trainers=len(trainers),items=len(items),maps=len(maps)),version='FireRed only; LeafGreen encounters excluded')
(out/'provenance.json').write_text(json.dumps(source,indent=2)); print(json.dumps(source,indent=2))
