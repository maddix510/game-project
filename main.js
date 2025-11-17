const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
function resize(){canvas.width = innerWidth; canvas.height = innerHeight}
addEventListener('resize', resize); resize();

// HUD elements
const scrapEl = document.getElementById('scrap');
const timeEl = document.getElementById('timeOfDay');
const deployBtn = document.getElementById('deployUnit');
const buildBtn = document.getElementById('buildLight');

let state = {
  day:1,
  time:0, // 0..1 day cycle (0-0.6 day, 0.6-1 night)
  scrap: 120,
  units: [],
  lights: [],
  enemies: [],
  resources: [],
  base: {x: null, y: null, health: 100}
};

// create base at center
state.base.x = () => canvas.width/2;
state.base.y = () => canvas.height/2;

// generate resource nodes
for(let i=0;i<12;i++){
  state.resources.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    amt: 50 + Math.random()*150
  });
}

// Input
canvas.addEventListener('click', e=>{
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
  // Click near base -> select base (future). For now place a light if buildMode
});

deployBtn.addEventListener('click', ()=>{ if(state.scrap>=50){ spawnUnit(); state.scrap-=50 } });
buildBtn.addEventListener('click', ()=>{ if(state.scrap>=75){ placeLight(canvas.width/2+80, canvas.height/2); state.scrap-=75 } });

function spawnUnit(){
  const u = {x: state.base.x(), y: state.base.y(), speed:1.6, carrying:0, target:null, hp:20}
  state.units.push(u);
}

function placeLight(x,y){ state.lights.push({x,y,range:140}) }

// Enemy spawning at night
function spawnEnemy(){
  // spawn from edges
  const edge = Math.floor(Math.random()*4);
  let x=0,y=0;
  if(edge===0){ x = -20; y = Math.random()*canvas.height }
  if(edge===1){ x = canvas.width+20; y = Math.random()*canvas.height }
  if(edge===2){ x = Math.random()*canvas.width; y = -20 }
  if(edge===3){ x = Math.random()*canvas.width; y = canvas.height+20 }
  state.enemies.push({x,y,speed:0.7+Math.random()*0.8, hp:10})
}

// Utility
function dist(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy) }

// Game loop
let last = 0, enemyTimer=0, dayTimer=0;
function loop(ts){
  const dt = Math.min((ts-last)/1000, 0.05); last = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function update(dt){
  // advance time
  state.time += dt*0.02; // speed of cycle
  if(state.time>=1){ state.time=0; state.day++; }
  timeEl.textContent = state.time<0.6? 'Day' : 'Night';

  // enemy spawn when night
  if(state.time>=0.6){ enemyTimer += dt; if(enemyTimer>1.2){ enemyTimer=0; spawnEnemy(); } }

  // units behavior: if not carrying, go to nearest resource; if carrying, return to base
  for(const u of state.units){
    if(u.carrying>0){ // return to base
      const bx = state.base.x(), by = state.base.y();
      const dx = bx - u.x, dy = by - u.y; const d = Math.hypot(dx,dy);
      if(d<8){ state.scrap += Math.floor(u.carrying); u.carrying=0 }
      else { u.x += (dx/d)*u.speed; u.y += (dy/d)*u.speed }
    } else {
      if(!u.target || u.target.amt<=0) u.target = nearestResource(u);
      if(u.target){ const dx = u.target.x - u.x, dy = u.target.y - u.y, d=Math.hypot(dx,dy);
        if(d<6){ // gather
          const take = Math.min(10*dt, u.target.amt);
          u.target.amt -= take; u.carrying += take*0.6; // inefficiency
        } else { u.x += (dx/d)*u.speed; u.y += (dy/d)*u.speed }
      }
    }
  }

  // enemies move toward nearest lit area or base
  for(const e of state.enemies){
    // find nearest light within influence else move to base
    let illuminated = null; let lxDist = 1e9;
    for(const L of state.lights){ const d = Math.hypot(L.x-e.x, L.y-e.y); if(d < lxDist){ lxDist=d; illuminated=L } }
    let tx = state.base.x(), ty = state.base.y();
    if(illuminated && lxDist < illuminated.range*0.9){ // lights attract or confuse enemies slightly
      tx = illuminated.x; ty = illuminated.y; 
    }
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx,dy);
    e.x += (dx/d)*e.speed; e.y += (dy/d)*e.speed;
  }

  // collisions: enemies vs units/base
  for(const e of state.enemies){
    for(const u of state.units){ if(Math.hypot(e.x-u.x,e.y-u.y)<12){ u.hp -= 10*dt; e.hp -= 7*dt } }
    if(Math.hypot(e.x-state.base.x(), e.y-state.base.y()) < 24){ state.base.health -= 6*dt; }
  }

  // remove dead
  state.enemies = state.enemies.filter(e=>e.hp>0 && inBounds(e));
  state.units = state.units.filter(u=>u.hp>0 && inBounds(u));
  state.resources = state.resources.filter(r=>r.amt>1);

  scrapEl.textContent = Math.floor(state.scrap);
}

function nearestResource(u){ let best=null,bd=1e9; for(const r of state.resources){ const d=Math.hypot(r.x-u.x,r.y-u.y); if(d<bd){bd=d;best=r}} return best }
function inBounds(o){ return o.x>-100 && o.x<canvas.width+100 && o.y>-100 && o.y<canvas.height+100 }

function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // ground
  const grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0,'#0e1220'); grad.addColorStop(1,'#071018');
  ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width,canvas.height);

  // resources
  for(const r of state.resources){ ctx.fillStyle = '#7fb07f'; ctx.beginPath(); ctx.arc(r.x,r.y,6+Math.min(12,r.amt/15),0,Math.PI*2); ctx.fill() }

  // lights (towers)
  for(const L of state.lights){
    // light circle
    const g = ctx.createRadialGradient(L.x,L.y,0,L.x,L.y,L.range);
    g.addColorStop(0,'rgba(255,220,120,0.35)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(L.x,L.y,L.range,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.beginPath(); ctx.arc(L.x,L.y,8,0,Math.PI*2); ctx.fill();
  }

  // base
  ctx.fillStyle = '#ffd1d1'; ctx.beginPath(); ctx.arc(state.base.x(), state.base.y(), 22,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#111'; ctx.font='12px monospace'; ctx.fillText('Base', state.base.x()-18, state.base.y()+4);

  // units
  for(const u of state.units){ ctx.fillStyle='#88c0ff'; ctx.beginPath(); ctx.arc(u.x,u.y,6,0,Math.PI*2); ctx.fill() }

  // enemies
  for(const e of state.enemies){ ctx.fillStyle='#d9534f'; ctx.beginPath(); ctx.arc(e.x,e.y,9,0,Math.PI*2); ctx.fill() }

  // dark overlay at night
  if(state.time>=0.6){
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // carve out lit areas
    ctx.globalCompositeOperation = 'destination-out';
    for(const L of state.lights){ ctx.beginPath(); ctx.arc(L.x,L.y,L.range,0,Math.PI*2); ctx.fill() }
    ctx.globalCompositeOperation = 'source-over';
  }

  // HUD overlays: day count
  ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(8,8,180,42);
}

// simple automatic starting units
spawnUnit(); spawnUnit();
