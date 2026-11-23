import * as T from 'three'
const cube = new T.BoxGeometry()
const materials = new Map()
export function box(parent,x,y,z,w,h,d,color) {
  if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color,flatShading:true}))
  const mesh = new T.Mesh(cube,materials.get(color))
  mesh.position.set(x,y,z); mesh.scale.set(w,h,d); parent.add(mesh)
  return mesh
}
export function sword(parent,x,y,z) {
  const g=new T.Group(); parent.add(g); g.position.set(x,y,z)
  box(g,0,.6,0,.17,1.2,.13,0xffde94); box(g,0,0,0,.65,.12,.15,0xffa23c)
  box(g,0,-.21,0,.12,.35,.12,0x713c30); return g
}
export function actor(parent,boss=false) {
  const g=new T.Group(); parent.add(g)
  box(g,0,.8,0,.8,1.2,.55,boss?0x73332d:0x45939a)
  box(g,0,1.67,0,.57,.56,.55,boss?0x2c2630:0xe7d2ad)
  box(g,0,1.65,-.29,.44,.11,.06,boss?0xff5726:0x243749)
  for(const side of [-1,1]){
    box(g,side*.26,.17,0,.32,.34,.42,0x332b37)
    box(g,side*.45,1.25,0,.38,.35,.55,boss?0xaf6546:0xccc0a1)
    if(boss) box(g,side*.25,2,0,.15,.5,.16,0xe6b080).rotation.z=-side*.35
  }
  g.userData.weapon=sword(g,.57,.85,-.23); if(boss) g.scale.setScalar(1.85)
  return g
}
export function runner(root,cfg){
  const hazards=[], length=cfg.segmentLength
  cfg.route.forEach((type,i)=>{
    const g=new T.Group(); root.add(g); g.position.z=-i*length
    const floor=(a,b)=>box(g,0,-.6,-(a+b)/2,9,1.2,b-a,cfg.stone)
    const middle=length/2
    if(type==='gap'){
      floor(0,middle);floor(middle+3,length)
      box(g,0,.02,-middle+.18,9,.04,.36,0xffb54f)
      hazards.push({type,z:i*length+middle})
    }else floor(0,length)
    for(let k=0;k<4;k++){
      const side=k%2?1:-1
      box(g,side*6,1,-k*length/4,1.5,5+k,1.6,0x472c37).rotation.z=side*.16
      box(g,side*4.3,.07,-k*length/4,.25,.14,4,0xc47b54)
    }
    if(type==='rocks') for(const [offset,x] of [[16,-1.8],[32,1.8]]){
      box(g,x,.9,-offset,4,1.8,2,0xa65d50).rotation.z=.08
      hazards.push({type,z:i*length+offset,x})
    }
    if(type==='fire'){
      box(g,0,.05,-middle,4,.1,2,0xc08146)
      hazards.push({type,z:i*length+middle,mesh:box(g,0,1,-middle,4,2,2,0xff631d)})
    }
  })
  const end=length*cfg.route.length
  arch(root,-end);box(root,0,-5,-end/2,80,.5,end+50,0xce481e)
  return {hazards,end}
}
function arch(g,z){
  for(const x of [-3,3])box(g,x,3,z,1.2,6,1.7,0x856a69)
  box(g,0,6,z,7.2,1.2,1.7,0xa68570)
}
export function arena(g,cfg){
  box(g,0,-.5,0,19,1,19,cfg.stone)
  for(const s of [-1,1])for(const t of [-1,1])box(g,s*9,2,t*8,1,4,1,0x937668)
  arch(g,-9); const door=box(g,0,2.5,-9,5,5,.8,0x834e43)
  const entry=box(g,0,2,9,6,4,.65,0x675465)
  return {door,entry}
}
export function heaven(g){
  for(let i=0;i<26;i++){
    box(g,0,-.5,-i*4,6,1,4,0xfff4d6)
    for(const s of [-1,1]){
      if(i%3===0)box(g,s*3,1,-i*4,.5,3,.5,0xe5b95e)
      box(g,s*(9+i%5),-2+i%3,-i*4,7,2,5,0xfffaf2)
    }
  }
  arch(g,-99)
}
