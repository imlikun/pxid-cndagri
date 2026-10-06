/* A section-local, photo-based 2.5D rotor preview. The casing is never transformed.
   Coordinates fit the existing artwork; this is not a CAD or engineering simulation. */
(() => {
  'use strict';
  const control = document.querySelector('#advantages [data-motor-gear]');
  if (!control) return;
  const photo = control.querySelector('img');
  const canvas = control.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  if(matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints>0)control.dataset.gearTouch='true';
  const size = 1024;
  // Orthographic projection fitted to the output wheel's slanted front plane.
  const wheel = { x: 849, y: 585, a: 180, c: -42, d: 293, depthX: -70, depthY: -10 };
  const coarse = [], profile = [];
  const teeth = 34;
  const outline = [[0,.912],[.12,.912],[.27,.985],[.34,1],[.61,1],[.68,.985],[.85,.912]];
  for (let tooth = 0; tooth < teeth; tooth++) {
    for (const [fraction,radius] of outline) {
      const theta = (tooth + fraction) / teeth * Math.PI * 2;
      coarse.push([Math.cos(theta)*radius, Math.sin(theta)*radius]);
    }
  }
  // Rounded roots and tiny edge fillets, rather than a flat saw-tooth silhouette.
  for(let i=0;i<coarse.length;i++)for(const t of [0,.5]){
    const p0=coarse[(i+coarse.length-1)%coarse.length],p1=coarse[i],p2=coarse[(i+1)%coarse.length],p3=coarse[(i+2)%coarse.length];
    profile.push([0,1].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t)));
  }
  const base = document.createElement('canvas'); base.width = base.height = size;
  const baseCtx = base.getContext('2d');
  const front = document.createElement('canvas'); front.width = front.height = 768;
  const frontCtx = front.getContext('2d');
  const metalFace = document.createElement('canvas'); metalFace.width = metalFace.height = 768;
  const metalCtx = metalFace.getContext('2d');
  const side = document.createElement('canvas'); side.width=174;side.height=40;
  const sideCtx=side.getContext('2d');
  let ready=false, near=false, visible=true, manual=false, speed=0, angle=0, frame=0, last=0, blend=0;
  let lastDraw=0;
  const projected = (u,v,back=false) => [
    wheel.x + u*wheel.a + v*wheel.c + (back ? wheel.depthX : 0),
    wheel.y + v*wheel.d + (back ? wheel.depthY : 0)
  ];
  const points = phase => {
    const c=Math.cos(phase),s=Math.sin(phase);
    return profile.map(([u,v])=>[u*c-v*s,u*s+v*c]);
  };
  const trace = (context, vertices, back=false) => {
    context.beginPath(); vertices.forEach(([u,v],i)=>{
      const [x,y]=projected(u,v,back); if(i)context.lineTo(x,y); else context.moveTo(x,y);
    }); context.closePath();
  };
  const circle = (context,radius,back=false) => {
    context.save();context.transform(wheel.a,0,wheel.c,wheel.d,wheel.x+(back?wheel.depthX:0),wheel.y+(back?wheel.depthY:0));
    context.beginPath();context.arc(0,0,radius,0,Math.PI*2);context.restore();
  };
  const prepare = () => {
    // Static shell layer. Remove only the sweep occupied by the output wheel;
    // retain the original flange, screws and case, plus the unchanged alpha background.
    baseCtx.drawImage(photo,0,0,size,size);
    baseCtx.save();baseCtx.globalCompositeOperation='destination-out';
    circle(baseCtx,1.018);baseCtx.fill();circle(baseCtx,1.085,true);baseCtx.fill();
    const rim=[];
    for(let i=0;i<120;i++){const t=i/120*Math.PI*2;rim.push(projected(Math.cos(t)*1.018,Math.sin(t)*1.018));rim.push(projected(Math.cos(t)*1.018,Math.sin(t)*1.018,true));}
    // Convex silhouette of a cylindrical rotor along the same fixed axis.
    rim.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    const lower=[],upper=[];
    for(const p of rim){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
    for(const p of rim.slice().reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
    const hull=lower.slice(0,-1).concat(upper.slice(0,-1));baseCtx.beginPath();hull.forEach(([x,y],i)=>i?baseCtx.lineTo(x,y):baseCtx.moveTo(x,y));baseCtx.closePath();baseCtx.fill();baseCtx.restore();
    // Restore a stationary backing plate inside the removed sweep. It appears
    // only between moving teeth, behind the rotor's extrusion.
    const plate=baseCtx.createLinearGradient(660,270,850,950);plate.addColorStop(0,'#8b8b88');plate.addColorStop(.2,'#333634');plate.addColorStop(.6,'#1a1c1b');plate.addColorStop(1,'#8c8b84');
    circle(baseCtx,1.085,true);baseCtx.fillStyle=plate;baseCtx.fill();
    // Unproject the original brushed-metal face into wheel-local coordinates.
    // Its highlights remain fixed in screen space, as an axially symmetric face should.
    const scale=384;
    frontCtx.setTransform(scale/wheel.a,0,scale*(-wheel.c)/(wheel.a*wheel.d),scale/wheel.d,
      scale-scale/wheel.a*wheel.x-scale*(-wheel.c)/(wheel.a*wheel.d)*wheel.y,
      scale-scale/wheel.d*wheel.y);
    frontCtx.drawImage(photo,0,0,size,size);
    // Extend the photographed face's brushed metal to the new moving tooth tips.
    // This stays in the runtime renderer; the source PNG is never rewritten.
    const source=frontCtx.getImageData(0,0,768,768),texture=metalCtx.createImageData(768,768);
    for(let y=0;y<768;y++)for(let x=0;x<768;x++){
      const u=(x-384)/384,v=(y-384)/384,r=Math.hypot(u,v);
      let sx=x,sy=y;
      if(r>.825){const sample=.773+Math.min(r-.825,.22)*.2;sx=Math.round(384+u/r*sample*384);sy=Math.round(384+v/r*sample*384);}
      const dest=(y*768+x)*4,src=(sy*768+sx)*4;
      const grain=r>.825?Math.sin(x*13.37+y*23.71)*1.2:0;
      for(let k=0;k<3;k++)texture.data[dest+k]=source.data[src+k]+grain;
      texture.data[dest+3]=255;
    }
    metalCtx.putImageData(texture,0,0);
    const ratio=photo.naturalWidth/1024;
    sideCtx.drawImage(photo,609*ratio,497*ratio,87*ratio,20*ratio,0,0,174,40);
    canvas.width=canvas.height=size;
    ready=true;control.dataset.gearReady='true';wake();
  };
  const draw = phase => {
    ctx.clearRect(0,0,size,size);ctx.drawImage(base,0,0);
    const vertices=points(phase),quads=[];
    // Back face, then visible axial tooth surfaces from back to front.
    trace(ctx,vertices,true);ctx.fillStyle='#30312f';ctx.fill();
    vertices.forEach((p,i)=>{
      const q=vertices[(i+1)%vertices.length];
      const a=projected(...p),b=projected(...q),c=projected(...q,true),d=projected(...p,true);
      if((b[0]-a[0])*wheel.depthY-(b[1]-a[1])*wheel.depthX<=0)return;
      const nx=q[1]-p[1],ny=p[0]-q[0],length=Math.hypot(nx,ny)||1;
      quads.push({a,b,c,d,y:(a[1]+b[1])/2,nx:nx/length,ny:ny/length});
    });
    quads.sort((a,b)=>a.y-b.y);
    for(const face of quads){
      const diffuse=Math.max(0,-face.nx*.62-face.ny*.62);
      const reflection=Math.max(0,-face.nx*.965-face.ny*.26)**24;
      const shade=Math.round(13+diffuse*45+reflection*150);
      const g=ctx.createLinearGradient(face.d[0],face.d[1],face.a[0],face.a[1]);
      g.addColorStop(0,`rgb(${shade*.48},${shade*.49},${shade*.46})`);
      g.addColorStop(.18,`rgb(${shade},${shade+2},${shade-2})`);
      g.addColorStop(.8,`rgb(${shade*.57},${shade*.59},${shade*.54})`);
      g.addColorStop(1,`rgb(${shade+64},${shade+65},${shade+60})`);
      ctx.beginPath();ctx.moveTo(...face.a);ctx.lineTo(...face.b);ctx.lineTo(...face.c);ctx.lineTo(...face.d);ctx.closePath();ctx.fillStyle=g;ctx.fill();
      ctx.save();ctx.clip();ctx.globalAlpha=.38;
      ctx.transform(wheel.depthX,wheel.depthY,face.b[0]-face.a[0],face.b[1]-face.a[1],face.a[0],face.a[1]);ctx.drawImage(side,0,0,1,1);ctx.restore();
      ctx.strokeStyle='#c4c5bb88';ctx.lineWidth=.95;ctx.beginPath();ctx.moveTo(...face.a);ctx.lineTo(...face.d);ctx.stroke();
    }
    trace(ctx,vertices);ctx.save();ctx.clip();
    ctx.transform(wheel.a,0,wheel.c,wheel.d,wheel.x,wheel.y);ctx.drawImage(metalFace,-1,-1,2,2);ctx.restore();
    trace(ctx,vertices);ctx.strokeStyle='#deded5ad';ctx.lineWidth=1.1;ctx.stroke();
    // Axially symmetric machining and studio reflections retain their original
    // appearance while the photographed axial ribs and toothed geometry rotate.
    ctx.save();circle(ctx,.825);ctx.clip();ctx.transform(wheel.a/384,0,wheel.c/384,wheel.d/384,wheel.x-wheel.a-wheel.c,wheel.y-wheel.d);ctx.drawImage(front,0,0);ctx.restore();
    // A restrained rotating machining witness mark makes slow rotation legible.
    ctx.save();ctx.transform(wheel.a,0,wheel.c,wheel.d,wheel.x,wheel.y);ctx.rotate(phase);
    ctx.strokeStyle='#e7e3d08c';ctx.lineWidth=.004;ctx.beginPath();ctx.moveTo(.846,0);ctx.lineTo(.884,0);ctx.stroke();ctx.restore();
  };
  const wanted = () => visible && !document.hidden && (manual || (near && hover.matches && !reduced.matches));
  const updateLabel = () => {
    const on=wanted();control.setAttribute('aria-pressed',String(on));control.setAttribute('aria-label',on?'暂停电机输出齿轮旋转':'预览电机输出齿轮旋转');
    control.dataset.gearPlaying=String(on);
  };
  const tick = now => {
    frame=0;const dt=Math.min((now-(last||now))/1000,.1);last=now;
    const target=wanted()?1.04:0; // Ten RPM: readable, restrained product motion.
    speed+=(target-speed)*(1-Math.exp(-dt/(target?.44:.52)));
    angle=(angle+speed*dt)%(Math.PI*2);
    if(speed>.004||target){blend=Math.min(1,blend+dt*2.5);if(now-lastDraw>=1000/30){draw(angle);lastDraw=now;canvas.style.opacity=String(blend);photo.style.opacity=String(1-blend);}}
    if(speed>.004||target)frame=requestAnimationFrame(tick);else{speed=0;control.dataset.gearSettled='true';last=0;}
  };
  const wake = () => {updateLabel();control.dataset.gearSettled='false';if(ready&&!frame){last=0;frame=requestAnimationFrame(tick);}};
  control.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){near=true;wake();}});
  control.addEventListener('pointerleave',()=>{near=false;wake();});
  control.addEventListener('click',()=>{manual=!wanted();near=false;wake();});
  control.addEventListener('keydown',e=>{if(e.key==='Escape'){manual=false;near=false;wake();}});
  const stopOffscreen = () => {if(frame)cancelAnimationFrame(frame);frame=0;speed=0;last=0;control.dataset.gearSettled='true';updateLabel();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopOffscreen();else wake();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){manual=false;near=false;stopOffscreen();}else wake();},{threshold:.08}).observe(control);
  reduced.addEventListener('change',()=>{near=false;manual=false;wake();});
  photo.decode().then(prepare).catch(()=>{control.disabled=true;control.dataset.gearReady='false';});
})();
