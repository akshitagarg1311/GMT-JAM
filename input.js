const keys={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',Space:'jump',KeyJ:'attack',KeyK:'dodge',ShiftLeft:'dodge',ShiftRight:'dodge',KeyE:'claim',Escape:'pause'}
export const held=new Set(), pressed=new Set()
function press(action){if(action){held.add(action);pressed.add(action)}}
window.addEventListener('keydown',e=>{
  const a=keys[e.code]; if(!a || (e.target.tagName==='BUTTON' && a==='jump'))return
  e.preventDefault();if(!e.repeat)press(a)
})
window.addEventListener('keyup',e=>held.delete(keys[e.code]))
window.addEventListener('blur',()=>{held.clear();pressed.clear()})
window.addEventListener('pointerdown',e=>{if(e.target.tagName==='CANVAS')pressed.add(e.button===2?'dodge':'attack')})
window.addEventListener('contextmenu',e=>e.preventDefault())
export const axis=(a,b)=>Number(held.has(a))-Number(held.has(b))
