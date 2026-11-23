import * as T from 'three'
import {actor,runner,arena,heaven,sword} from './world.js'
import {Combat} from './combat.js'
import {stages} from './stage.js'
import {axis,pressed,held} from './input.js'
const $=s=>document.querySelector(s), menu=$('#menu'),hud=$('#hud'),hint=$('#hint')
const renderer=new T.WebGLRenderer({antialias:true})
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));document.body.prepend(renderer.domElement)
const scene=new T.Scene(), camera=new T.PerspectiveCamera(56,1,.1,180)
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
resize();addEventListener('resize',resize)
const light=new T.HemisphereLight(0xffe8ce,0xbc7773,2.1);scene.add(light)
const sun=new T.DirectionalLight(0xffdcba,2.5);sun.position.set(-8,16,5);scene.add(sun)
const group=()=>{const g=new T.Group();scene.add(g);return g}
const track=group(),room=group(),sky=group();heaven(sky)
const player=actor(scene), boss=actor(room,true), loot=sword(room,0,1,0)
let state,prior,cfg,route,doors,combat,age,elapsed,retries,checkpoint,vertical,strafe,clock,stageId
const progress={swords:new Set(),stages:new Set()}
const aim=new T.Vector3(),eye=new T.Vector3(),focus=new T.Vector3()
function set(s){state=s;age=0;hint.textContent='';pressed.clear()}
function panel(title,copy,actions){
  menu.hidden=false;hud.hidden=true;hint.textContent=''
  $('h1').innerHTML=title;$('#copy').textContent=copy;$('#buttons').replaceChildren()
  for(const [name,fn] of actions){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{b.blur();fn()};$('#buttons').append(b)}
}
function play(){menu.hidden=true;hud.hidden=false}
function load(id){
  combat?.dispose();track.clear();room.clear();room.add(boss,loot)
  stageId=id;cfg=stages[id];route=runner(track,cfg);doors=arena(room,cfg)
  scene.background=new T.Color(cfg.sky);scene.fog=new T.FogExp2(cfg.sky,.017)
  checkpoint=0;clock=0;resetRunner();set('run')
}
function resetRunner(){
  track.visible=true;room.visible=sky.visible=false;player.visible=true
  player.rotation.set(0,0,0);player.position.set(0,0,-checkpoint);vertical=strafe=0
  camera.position.set(0,4.8,player.position.z+8);aim.set(0,1,player.position.z-5)
}
function start(){progress.swords.clear();progress.stages.clear();elapsed=retries=0;load('depths');play()}
function title(){start();set('title');panel('From Hell<br><i>to Heaven</i>','Survive the ascent. Defeat the guardian. Reclaim the fallen sword.\nRun · A/D to steer, Space to jump\nFight · WASD to move, J to strike, K to dodge\nEsc to pause',[['Start Ascent',start]])}
function encounter(){
  track.visible=sky.visible=false;room.visible=true;loot.visible=false
  boss.position.set(0,0,-2);boss.rotation.set(0,0,0);boss.visible=boss.userData.weapon.visible=true
  player.position.set(0,0,6);player.rotation.set(0,0,0);player.visible=true
  player.userData.weapon.rotation.set(0,0,0);boss.userData.weapon.rotation.set(0,0,0)
  doors.door.position.y=2.5;doors.entry.position.y=-2
  combat?.dispose();combat=new Combat(room,player,boss,cfg);set('intro')
}
function ascent(){room.visible=false;sky.visible=true;player.position.set(0,0,0);player.rotation.y=0;set('heaven')}
function pause(){
  prior={state,age};set('pause')
  panel('Paused','The ascent can wait.',[['Resume',resume],['Restart section',()=>{
    play()
    if(['run','fall'].includes(prior.state)){checkpoint=0;resetRunner();set('run')}
    else if(prior.state==='heaven')ascent()
    else{progress.swords.delete(cfg.sword);encounter()}
  }],['Return to title',title]])
}
function resume(){play();set(prior.state);age=prior.age}
function bars(label,objective,meters,tip){
  $('#label').textContent=label;$('#objective').textContent=objective
  if($('#meters').innerHTML!==meters)$('#meters').innerHTML=meters
  hint.textContent=tip
}
const meter=(label,value)=>'<label>'+label+'<progress max="100" value="'+Math.round(value)+'"></progress></label>'
function run(dt){
  const p=player.position,z=-p.z
  strafe=T.MathUtils.damp(strafe,axis('right','left')*8,12,dt)
  p.x=T.MathUtils.clamp(p.x+strafe*dt,-4,4)
  if(pressed.has('jump') && p.y===0)vertical=8.8
  vertical-=20*dt;p.y=Math.max(0,p.y+vertical*dt);if(!p.y)vertical=0
  p.z-=dt*cfg.speed;player.rotation.z=-strafe*.015
  for(const h of route.hazards){
    const rel=-p.z-h.z,cycle=(clock+h.z)%3.5
    if(h.type==='fire'){
      const height=cycle>2.2?2.6:cycle>1.5?.33:.06
      h.mesh.scale.y=height;h.mesh.position.y=height/2+.1
    }
    if((h.type==='gap' && rel>0 && rel<3 && !p.y) ||
      (h.type==='rocks' && Math.abs(rel)<1.3 && Math.abs(p.x-h.x)<2.3) ||
      (h.type==='fire' && cycle>2.2 && Math.abs(rel)<1.3 && Math.abs(p.x)<2.3)){
      retries++;set('fall');hint.textContent='Returning to checkpoint';return
    }
  }
  checkpoint=Math.floor(z/cfg.segmentLength)*cfg.segmentLength
  bars(cfg.name,'Reach the gate',meter('Route',100*z/route.end),z<45?'A / D to steer   ·   Space to jump':'')
  if(-p.z>=route.end){camera.position.z+=route.end;aim.z+=route.end;encounter()}
}
function dungeon(dt){
  if(state==='intro'){
    doors.entry.position.y=Math.min(2,-2+age*2)
    bars('Guardian chamber',cfg.guardian,'','WASD to move   ·   J / click to strike   ·   K / Shift to dodge')
    if(age>3.6)set('combat')
  }else if(state==='combat'){
    combat.update(dt)
    bars(cfg.guardian,'Guardian chamber',meter('Vitality',combat.hp)+meter('Guardian',100*combat.bossHp/cfg.hp)+meter('Dodge',100*(1-combat.cooldown)),combat.phase==='wind'?(combat.key==='slam'?'Ground slam — clear the circle':'Heavy swing — dodge'):'')
    if(!combat.bossHp){player.visible=true;set('collapse')}
    else if(!combat.hp){retries++;set('defeat');hint.textContent='You fell · Restarting the encounter'}
  }else if(state==='defeat'){if(age>1.4)encounter()}
  else if(state==='collapse'){
    boss.rotation.z=Math.min(1.5,age*1.5)
    if(age>1.1){boss.userData.weapon.visible=false;loot.position.copy(boss.position);loot.position.y=1;loot.visible=true;set('reward')}
  }else{
    combat.move(dt,false);loot.rotation.y+=dt*2
    const near=player.position.distanceTo(loot.position)<3
    if(state==='reward'){
      bars('Guardian defeated',cfg.sword,'',near?'E · Reclaim the fallen sword':'Approach the golden blade')
      if(near && pressed.has('claim')){progress.swords.add(cfg.sword);loot.visible=false;set('exit')}
    }else{
      doors.door.position.y=Math.min(8,2.5+age*3)
      bars('Sword reclaimed',cfg.sword,'','Walk through the open arch')
      if(Math.abs(player.position.x)<2.5 && player.position.z<-7.8 && age>1){
        progress.stages.add(stageId);if(cfg.next)load(cfg.next);else ascent()
      }
    }
  }
}
function update(dt){
  if(pressed.has('pause')){
    if(state==='pause')resume();else if(!['title','victory'].includes(state))pause()
    return
  }
  if(['title','victory','pause'].includes(state))return
  age+=dt;elapsed+=dt;clock+=dt
  if(state==='run')run(dt)
  else if(state==='fall'){player.position.y-=dt*2;if(age>.7){resetRunner();set('run')}}
  else if(state==='heaven'){
    player.position.z-=dt*4
    scene.background.lerp(new T.Color(0xb6deee),1-Math.exp(-dt));scene.fog.color.copy(scene.background)
    bars('The last ascent','Follow the light','',age<4?'The way is open':'')
    if(-player.position.z>=99){
      set('victory');panel('You Reached<br><i>Heaven</i>',[...progress.swords].join(' · ')+'\n'+Math.floor(elapsed/60)+'m '+Math.floor(elapsed%60)+'s   ·   '+retries+' retries',[['Restart',start],['Return to title',title]])
    }
  }else dungeon(dt)
}
function frameCamera(dt){
  const p=player.position
  if(room.visible){
    eye.set(14,19,14);focus.set(0,0,0)
    if(state==='collapse'){focus.copy(boss.position);eye.multiplyScalar(.8)}
    const aspectScale=Math.max(1,1.35/camera.aspect);eye.multiplyScalar(aspectScale)
  }else{
    eye.set(p.x*.45,4.8+p.y*.15,p.z+8);focus.set(p.x*.3,1,p.z-5)
    if(state==='title'){eye.set(6,5,7);focus.set(0,1,-10)}
  }
  const k=1-Math.exp(-dt*(state==='intro'?1.4:7))
  camera.position.lerp(eye,k);aim.lerp(focus,k);camera.lookAt(aim)
}
title();let prev=performance.now()
renderer.setAnimationLoop(now=>{
  const dt=Math.min(.05,Math.max(0,(now-prev)/1000));prev=now
  update(dt);if(state!=='pause')frameCamera(dt);pressed.clear();renderer.render(scene,camera)
})
window.addEventListener('blur',()=>{held.clear();if(!['title','victory','pause'].includes(state))pause()})
