/* ════════════════════════════════════════════
   BAMBOO DRAWING UTILITIES
════════════════════════════════════════════ */
function drawBambooScene(ctx, W, H, opts){
    opts = opts || {};
    const density   = opts.density   || 1;
    const moonY     = opts.moonY     !== undefined ? opts.moonY : H * .3;
    const moonR     = opts.moonR     !== undefined ? opts.moonR : Math.min(W,H)*.06;
    const hasMoon   = opts.moon      !== false;
    const hasMist   = opts.mist      !== false;
    const stalksArr = opts.stalks    || null;
  
    // Background
    ctx.fillStyle = opts.bg || '#0A0C06';
    ctx.fillRect(0,0,W,H);
  
    // Moon glow
    if(hasMoon){
      const mg = ctx.createRadialGradient(W/2, moonY, 0, W/2, moonY, moonR*5);
      mg.addColorStop(0,'rgba(184,132,30,.07)');
      mg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=mg; ctx.fillRect(0,0,W,H);
      // Moon disc
      ctx.save();
      ctx.beginPath(); ctx.arc(W/2,moonY,moonR,0,Math.PI*2);
      const md=ctx.createRadialGradient(W/2-moonR*.2,moonY-moonR*.2,0,W/2,moonY,moonR);
      md.addColorStop(0,'rgba(230,210,170,.16)');
      md.addColorStop(.6,'rgba(200,170,100,.06)');
      md.addColorStop(1,'rgba(170,130,60,.02)');
      ctx.fillStyle=md; ctx.fill();
      ctx.restore();
    }
  
    // Mountain silhouette
    if(opts.mountains !== false){
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0,H);
      ctx.lineTo(0, H*.7);
      ctx.quadraticCurveTo(W*.1,H*.52,W*.2,H*.63);
      ctx.quadraticCurveTo(W*.3,H*.46,W*.4,H*.58);
      ctx.quadraticCurveTo(W*.5,H*.40,W*.5,H*.42);
      ctx.quadraticCurveTo(W*.6,H*.58,W*.7,H*.46);
      ctx.quadraticCurveTo(W*.8,H*.63,W*.9,H*.52);
      ctx.lineTo(W,H*.7); ctx.lineTo(W,H);
      ctx.closePath();
      ctx.fillStyle='rgba(5,8,3,.88)'; ctx.fill();
      ctx.restore();
    }
  
    // Mist band
    if(hasMist){
      const mist=ctx.createLinearGradient(0,H*.5,0,H*.72);
      mist.addColorStop(0,'rgba(10,12,6,0)');
      mist.addColorStop(.5,'rgba(12,16,8,.45)');
      mist.addColorStop(1,'rgba(10,12,6,0)');
      ctx.fillStyle=mist; ctx.fillRect(0,H*.5,W,H*.25);
    }
  
    // Draw bamboo stalks
    const defaultStalks = [];
    const cols = Math.ceil(W / (28*density));
    for(let i=0;i<cols;i++){
      const xPct = (i+.5)/cols;
      const side = xPct < .5 ? 'L':'R';
      const edge = xPct < .5 ? xPct*2 : (1-xPct)*2;
      if(edge > .35 && !opts.fullCover) continue; // only draw near edges unless fullCover
      defaultStalks.push({x:W*xPct, tilt:(Math.random()-.5)*.018, scale:.5+edge*.5+Math.random()*.2, side});
    }
    const stalks = stalksArr || defaultStalks;
    stalks.forEach(s=>{
      const sw  = (10+Math.random()*5)*s.scale;
      const bot = H + 10;
      const h   = (H*.7+Math.random()*H*.18)*s.scale;
      const top = bot - h;
      const tipX= s.x + s.tilt*h;
  
      // Stalk body gradient
      const sg = ctx.createLinearGradient(s.x-sw/2,0,s.x+sw/2,0);
      sg.addColorStop(0,  `rgba(18,30,10,${.92*s.scale})`);
      sg.addColorStop(.3, `rgba(42,68,20,${.96*s.scale})`);
      sg.addColorStop(.55,`rgba(58,90,26,${s.scale})`);
      sg.addColorStop(.75,`rgba(42,68,20,${.96*s.scale})`);
      sg.addColorStop(1,  `rgba(14,24,8,${.92*s.scale})`);
      ctx.fillStyle=sg;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(s.x-sw/2+tipX-s.x, top);
      ctx.quadraticCurveTo(s.x-sw/2+s.tilt*h*.4,bot-h*.5,s.x-sw/2,bot);
      ctx.lineTo(s.x+sw/2,bot);
      ctx.quadraticCurveTo(s.x+sw/2+s.tilt*h*.4,bot-h*.5,s.x+sw/2+tipX-s.x,top);
      ctx.closePath(); ctx.fill();
      // Highlight stripe
      ctx.globalAlpha=.1*s.scale;
      ctx.strokeStyle='#A8D060'; ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.moveTo(s.x+1+tipX-s.x,top);
      ctx.quadraticCurveTo(s.x+1+s.tilt*h*.4,bot-h*.5,s.x+1,bot);
      ctx.stroke();
      ctx.globalAlpha=1;
      ctx.restore();
  
      // Nodes
      const ns = 52+Math.random()*20;
      const no = Math.random()*ns;
      for(let ny=bot-no; ny>top; ny-=ns){
        const nx=s.x+s.tilt*(bot-ny);
        // Node ring
        const rg=ctx.createLinearGradient(nx-sw*.6,ny-3,nx+sw*.6,ny+3);
        rg.addColorStop(0,'rgba(12,20,6,.9)');
        rg.addColorStop(.45,'rgba(40,65,18,.95)');
        rg.addColorStop(.55,'rgba(30,50,14,.95)');
        rg.addColorStop(1,'rgba(12,20,6,.9)');
        ctx.fillStyle=rg;
        ctx.beginPath(); ctx.ellipse(nx,ny,sw*.6,3.2,0,0,Math.PI*2); ctx.fill();
        // Node highlight
        ctx.fillStyle='rgba(100,180,50,.1)';
        ctx.beginPath(); ctx.ellipse(nx,ny-1,sw*.35,1.4,0,0,Math.PI*2); ctx.fill();
  
        // Leaves
        if(Math.random()>.48){
          for(let li=0;li<2;li++){
            const ls=li===0?1:-1;
            const ang=(ls*32+(Math.random()-.5)*22)*Math.PI/180;
            const ll=26+Math.random()*18;
            const lw=4.5+Math.random()*3.5;
            ctx.save();
            ctx.translate(nx,ny);
            // Alternate left/right based on node position
            const baseAng = (s.side==='L') ? 0 : Math.PI;
            ctx.rotate(ang+baseAng);
            const lg=ctx.createLinearGradient(0,0,ll,0);
            lg.addColorStop(0,`rgba(38,70,18,${.88*s.scale})`);
            lg.addColorStop(.4,`rgba(60,100,26,${.92*s.scale})`);
            lg.addColorStop(1,`rgba(28,55,12,${.38*s.scale})`);
            ctx.fillStyle=lg;
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.quadraticCurveTo(ll*.4,-lw,ll,0);
            ctx.quadraticCurveTo(ll*.4,lw*.65,0,0);
            ctx.fill();
            // Vein
            ctx.strokeStyle=`rgba(70,120,30,${.3*s.scale})`; ctx.lineWidth=.6;
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(ll*.82,0); ctx.stroke();
            ctx.restore();
          }
        }
      }
    });
  
    // Ground line
    if(opts.ground !== false){
      const gl=ctx.createLinearGradient(0,H*.85,0,H);
      gl.addColorStop(0,'rgba(10,12,6,0)');
      gl.addColorStop(1,'rgba(5,8,3,.6)');
      ctx.fillStyle=gl; ctx.fillRect(0,H*.85,W,H*.15);
    }
  }
  
  function drawCurtainPanel(cv, side){
    cv.width=0; cv.height=0; // reset
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const parent=cv.parentElement;
    const W=parent.offsetWidth, H=parent.offsetHeight;
    if(!W||!H) return;
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    cv.style.width=W+'px'; cv.style.height=H+'px';
    const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  
    // Full-cover bamboo stalks for curtain
    const stalks=[];
    const cols=Math.ceil(W/20);
    for(let i=0;i<cols;i++){
      stalks.push({
        x:(i+.5)*W/cols,
        tilt:(Math.random()-.5)*.012,
        scale:.65+Math.random()*.5,
        side:side
      });
    }
    drawBambooScene(ctx,W,H,{
      stalks, fullCover:true, moon:false, mountains:false, mist:false, ground:false,
      bg: side==='L'
        ? 'linear-gradient(to right,#0a0e06,#111808)'
        : 'linear-gradient(to left,#0a0e06,#111808)'
    });
    // Fallback bg if gradient string won't work
    ctx.globalCompositeOperation='destination-over';
    const bg=ctx.createLinearGradient(side==='L'?0:W, 0, side==='L'?W:0, 0);
    bg.addColorStop(0,'#0D1409'); bg.addColorStop(1,'#0A0E06');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='source-over';
  
    // Misty edge glow on inner seam
    const eg=ctx.createLinearGradient(side==='L'?W-80:0, 0, side==='L'?W:80, 0);
    eg.addColorStop(0,side==='L'?'rgba(0,0,0,0)':'rgba(0,0,0,.7)');
    eg.addColorStop(1,side==='L'?'rgba(0,0,0,.7)':'rgba(0,0,0,0)');
    ctx.fillStyle=eg; ctx.fillRect(0,0,W,H);
  
    // Gold trim line on inner edge
    const tx=side==='L'?W-1:1;
    const tg=ctx.createLinearGradient(0,0,0,H);
    tg.addColorStop(0,'rgba(184,132,30,0)');
    tg.addColorStop(.25,'rgba(184,132,30,.5)');
    tg.addColorStop(.75,'rgba(184,132,30,.5)');
    tg.addColorStop(1,'rgba(184,132,30,0)');
    ctx.strokeStyle=tg; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(tx,0); ctx.lineTo(tx,H); ctx.stroke();
  }
  
  function drawBgCanvas(id, opts){
    const cv=document.getElementById(id); if(!cv) return;
    const parent=cv.parentElement||cv.closest('section');
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const W=parent.offsetWidth, H=parent.offsetHeight;
    if(!W||!H) return;
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    cv.style.width=W+'px'; cv.style.height=H+'px';
    const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
    drawBambooScene(ctx,W,H,opts);
  }
  
  /* ════ INK WASH BG (intro) ════ */
  (function(){
    const cv=document.getElementById('bgInk'); if(!cv) return;
    function draw(){
      const dpr=Math.min(window.devicePixelRatio||1,2);
      cv.width=Math.round(window.innerWidth*dpr);
      cv.height=Math.round(window.innerHeight*dpr);
      const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
      const W=window.innerWidth, H=window.innerHeight;
      drawBambooScene(ctx,W,H,{
        moon:true, moonY:H*.28, mountains:true, mist:true, ground:true,
        stalks:null, fullCover:false
      });
    }
    draw();
    window.addEventListener('resize',draw,{passive:true});
  })();
  
  /* ════ CURTAINS ════ */
  (function(){
    function init(){
      const cL=document.getElementById('cvL');
      const cR=document.getElementById('cvR');
      if(cL) drawCurtainPanel(cL,'L');
      if(cR) drawCurtainPanel(cR,'R');
    }
    // Fire after a short delay so layout is stable
    setTimeout(init, 50);
    window.addEventListener('resize',()=>setTimeout(init,50),{passive:true});
  })();
  
  /* ════ INTRO SEQUENCE ════ */
  (function(){
    const seal=document.getElementById('sealWrap');
    const openW=document.getElementById('openWrap');
    document.body.style.overflow='hidden';
    setTimeout(()=>seal.classList.add('show'),350);
    setTimeout(()=>openW.classList.add('show'),1500);
  })();
  
  /* ════ OPEN BUTTON ════ */
  (function(){
    const btn=document.getElementById('openBtn');
    const openW=document.getElementById('openWrap');
    const seal=document.getElementById('sealWrap');
    const curtL=document.getElementById('curtainL');
    const curtR=document.getElementById('curtainR');
    const rc=document.getElementById('revealContent');
    const intro=document.getElementById('intro');
    const main=document.getElementById('main');
    const rcEls=['rcEye','rcInit','rcDiv','rcNames','rcDate'].map(id=>document.getElementById(id));
  
    btn.addEventListener('click',()=>{
      openW.classList.add('vanish');
      seal.classList.add('hide');
  
      setTimeout(()=>{
        curtL.classList.add('open');
        curtR.classList.add('open');
      },180);
  
      setTimeout(()=>{
        rcEls.forEach((el,i)=>setTimeout(()=>el&&el.classList.add('in'),i*180));
      },700);
  
      setTimeout(()=>{
        main.classList.remove('hidden');
        document.body.style.overflow='auto';
        // Draw all section bg canvases now that #main is visible
        requestAnimationFrame(()=>{
          drawBgCanvas('heroBg',{moon:true,moonY:0,mountains:false,mist:false,ground:false,fullCover:true,stalks:buildSideStalksFull('heroBg')});
          drawBgCanvas('bambooBg1',{moon:false,mountains:false,mist:false,ground:false,fullCover:true});
          drawBgCanvas('bambooBg2',{moon:false,mountains:false,mist:false,ground:false,fullCover:true});
          drawBgCanvas('bambooBg3',{moon:true,moonY:null,mountains:false,mist:false,ground:false,fullCover:true});
          drawBgCanvas('closeBg',{moon:true,mountains:false,mist:false,ground:false,fullCover:true});
          // Now safe to init scratch cards
          initAllScratch();
        });
      },2000);
  
      setTimeout(()=>{
        intro.style.transition='opacity .7s';
        intro.style.opacity='0';
        intro.style.pointerEvents='none';
      },2400);
      setTimeout(()=>intro.style.display='none',3200);
    });
  
    function buildSideStalksFull(id){
      const cv=document.getElementById(id);
      if(!cv) return null;
      const parent=cv.parentElement;
      const W=parent.offsetWidth||window.innerWidth;
      const H=parent.offsetHeight||window.innerHeight;
      const stalks=[];
      const cols=Math.ceil(W/24);
      for(let i=0;i<cols;i++){
        const xPct=(i+.5)/cols;
        const edgeDist=Math.min(xPct,1-xPct)*2;
        if(edgeDist>.5) continue;
        stalks.push({x:W*xPct,tilt:(Math.random()-.5)*.016,scale:.4+edgeDist*.9+Math.random()*.15,side:xPct<.5?'L':'R'});
      }
      return stalks;
    }
  })();
  
  /* ════ SCRATCH CARDS — FIXED ROOT CAUSE ════
     Root cause: canvas has offsetWidth=0 when #main is display:none.
     Solution: init is called AFTER #main becomes visible (from openBtn handler above).
     The text is drawn to canvas FIRST (layer 0), then gold overlay ON TOP (layer 1).
     Scratching erases layer 1 (destination-out), revealing layer 0 text underneath.
  ════════════════════════════════════════════ */
  function initAllScratch(){
    const canvases=document.querySelectorAll('.s-canvas');
    const revealMsg=document.getElementById('revealMsg');
    const revealed=new Map();
    canvases.forEach(cv=>revealed.set(cv.id,false));
  
    canvases.forEach(cv=>{
      const val=cv.dataset.value;
      // Now #main is visible, offsetWidth is real
      const cssW=cv.offsetWidth||130;
      const cssH=cv.offsetHeight||130;
      if(!cssW||!cssH) return; // safety guard
  
      const dpr=Math.min(window.devicePixelRatio||1,2);
      cv.width=Math.round(cssW*dpr);
      cv.height=Math.round(cssH*dpr);
      cv.style.width=cssW+'px';
      cv.style.height=cssH+'px';
  
      const ctx=cv.getContext('2d');
      ctx.scale(dpr,dpr);
      const W=cssW, H=cssH, cx=W/2, cy=H/2;
      const R=Math.min(W,H)/2-1;
  
      /* ── Step 1: draw dark background + reveal text FIRST ── */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  
      // dark bg matching bamboo theme
      const bg=ctx.createRadialGradient(cx-R*.3,cy-R*.3,0,cx,cy,R);
      bg.addColorStop(0,'#1C2614'); bg.addColorStop(1,'#0D1008');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  
      // inner decorative ring
      ctx.beginPath(); ctx.arc(cx,cy,R-8,0,Math.PI*2);
      ctx.strokeStyle='rgba(184,132,30,.22)'; ctx.lineWidth=.7; ctx.stroke();
  
      // THE VALUE — revealed gold text
      const fs=val.length>2?Math.round(W*.28):Math.round(W*.36);
      ctx.font=`italic ${fs}px "Playfair Display",Georgia,serif`;
      ctx.fillStyle='#D4A83A'; // gold on dark
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(val,cx,cy);
  
      ctx.restore(); // end of clip
  
      /* ── Step 2: gold overlay ON TOP ── */
      paintGoldOverlay(ctx,cx,cy,R,W,H);
  
      /* ── Step 3: interaction ── */
      setupScratch(cv,ctx,W,H,cx,cy,R,revealed,revealMsg);
    });
  }
  
  function paintGoldOverlay(ctx,cx,cy,R,W,H){
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  
    const g=ctx.createRadialGradient(cx-R*.28,cy-R*.28,0,cx,cy,R);
    g.addColorStop(0,'#EAC85A');
    g.addColorStop(.2,'#C8951E');
    g.addColorStop(.5,'#A87010');
    g.addColorStop(.7,'#C4921C');
    g.addColorStop(.88,'#DDB050');
    g.addColorStop(1,'#8A6010');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  
    // shine
    const sh=ctx.createLinearGradient(0,0,W*.55,H*.55);
    sh.addColorStop(0,'rgba(255,255,255,.26)');
    sh.addColorStop(.4,'rgba(255,255,255,.06)');
    sh.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=sh; ctx.fillRect(0,0,W,H);
  
    // grain
    for(let i=0;i<180;i++){
      ctx.fillStyle=`rgba(255,220,80,${Math.random()*.055})`;
      ctx.fillRect(Math.random()*W,Math.random()*H,1.5,1.5);
    }
  
    // edge vignette
    const ev=ctx.createRadialGradient(cx,cy,R*.6,cx,cy,R);
    ev.addColorStop(0,'rgba(0,0,0,0)'); ev.addColorStop(1,'rgba(0,0,0,.2)');
    ctx.fillStyle=ev; ctx.fillRect(0,0,W,H);
  
    // hint text
    ctx.font=`italic 11px "EB Garamond",Georgia,serif`;
    ctx.fillStyle='rgba(60,35,0,.5)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('gosok',cx,cy+1);
  
    ctx.restore();
  
    // outer border (above clip, always visible)
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle='rgba(120,82,10,.6)'; ctx.lineWidth=2; ctx.stroke();
  }
  
  function setupScratch(cv,ctx,W,H,cx,cy,R,revealed,revealMsg){
    let drag=false, lx=0, ly=0;
  
    function pos(e){
      const r=cv.getBoundingClientRect();
      const src=e.touches?e.touches[0]:e;
      return{x:(src.clientX-r.left)*(W/r.width), y:(src.clientY-r.top)*(H/r.height)};
    }
    function erase(x,y){
      ctx.save(); ctx.globalCompositeOperation='destination-out';
      ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill();
      ctx.restore(); check();
    }
    function eraseLine(x1,y1,x2,y2){
      ctx.save(); ctx.globalCompositeOperation='destination-out';
      ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=40;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.restore(); check();
    }
    function check(){
      if(revealed.get(cv.id)) return;
      const dW=cv.width, dH=cv.height;
      const d=ctx.getImageData(0,0,dW,dH).data;
      let tot=0,tr=0;
      for(let y=0;y<dH;y+=4) for(let x=0;x<dW;x+=4){
        if((x-dW/2)**2+(y-dH/2)**2>(Math.min(dW,dH)/2)**2) continue;
        tot++;
        if(d[(y*dW+x)*4+3]<100) tr++;
      }
      if(tot>0&&tr/tot>.6){
        revealed.set(cv.id,true);
        // auto-clear remaining
        ctx.save(); ctx.globalCompositeOperation='destination-out';
        ctx.beginPath(); ctx.arc(W/2,H/2,R,0,Math.PI*2); ctx.fill();
        ctx.restore();
        const hEl=document.getElementById(cv.id.replace('sc-','hint-'));
        if(hEl) hEl.style.opacity='0';
        let all=true; revealed.forEach(v=>{if(!v)all=false;});
        if(all){setTimeout(()=>revealMsg.classList.add('show'),200);setTimeout(launchConfetti,400);}
      }
    }
  
    cv.addEventListener('mousedown',e=>{drag=true;const p=pos(e);lx=p.x;ly=p.y;erase(p.x,p.y);});
    cv.addEventListener('mousemove',e=>{if(!drag)return;const p=pos(e);eraseLine(lx,ly,p.x,p.y);lx=p.x;ly=p.y;});
    cv.addEventListener('mouseup',()=>drag=false);
    cv.addEventListener('mouseleave',()=>drag=false);
    cv.addEventListener('touchstart',e=>{e.preventDefault();drag=true;const p=pos(e);lx=p.x;ly=p.y;erase(p.x,p.y);},{passive:false});
    cv.addEventListener('touchmove',e=>{e.preventDefault();if(!drag)return;const p=pos(e);eraseLine(lx,ly,p.x,p.y);lx=p.x;ly=p.y;},{passive:false});
    cv.addEventListener('touchend',()=>drag=false);
  }
  
  /* ════ CONFETTI ════ */
  function launchConfetti(){
    const box=document.getElementById('confettiBox'); if(!box) return;
    const cols=['#B8841E','#D4A83A','#527A2E','#3D6222','#EAC85A','#2E4A1A','#F5EDD8'];
    const N=65,pieces=[];
    for(let i=0;i<N;i++){
      const el=document.createElement('div');
      const c=cols[i%cols.length],sz=5+Math.random()*7,ir=Math.random()>.5;
      Object.assign(el.style,{position:'absolute',left:Math.random()*100+'%',top:'-20px',
        width:(ir?sz*.5:sz)+'px',height:(ir?sz*2:sz)+'px',background:c,
        borderRadius:Math.random()>.6?'50%':'1px',opacity:(.7+Math.random()*.3).toString(),pointerEvents:'none'});
      box.appendChild(el);
      pieces.push({el,y:-20,vx:(Math.random()-.5)*2.8,vy:2+Math.random()*3,rot:Math.random()*360,rv:(Math.random()-.5)*9,g:.1+Math.random()*.1,done:false});
    }
    const bH=box.offsetHeight||400;
    let aid,f=0;
    function tick(){f++;let alive=false;
      pieces.forEach(p=>{if(p.done)return;p.vy+=p.g;p.vx+=Math.sin(f*.04)*.03;p.y+=p.vy;p.rot+=p.rv;
        if(p.y>bH+30){p.done=true;p.el.remove();return;}alive=true;
        p.el.style.transform=`translate(${p.vx*f*.04}px,${p.y}px) rotate(${p.rot}deg)`;});
      if(alive)aid=requestAnimationFrame(tick); else cancelAnimationFrame(aid);}
    aid=requestAnimationFrame(tick);
  }
  
  /* ════ SCROLL REVEAL ════ */
  (function(){
    const els=document.querySelectorAll('.sr');
    if(!els.length) return;
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});
    },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    els.forEach(el=>obs.observe(el));
  })();
  
  /* ════ COUNTDOWN ════ */
  (function(){
    const target=new Date('2026-06-06T10:00:00+07:00').getTime();
    const els=['cdD','cdH','cdM','cdS'].map(id=>document.getElementById(id));
    const pad=n=>String(Math.max(0,n)).padStart(2,'0');
    function tick(){
      const d=target-Date.now();
      if(d<=0){els.forEach(e=>{if(e)e.textContent='00'});return;}
      if(els[0])els[0].textContent=pad(Math.floor(d/86400000));
      if(els[1])els[1].textContent=pad(Math.floor(d%86400000/3600000));
      if(els[2])els[2].textContent=pad(Math.floor(d%3600000/60000));
      if(els[3])els[3].textContent=pad(Math.floor(d%60000/1000));
    }
    tick(); setInterval(tick,1000);
  })();
  
  /* ════ MISC ════ */
  (function(){
    const btn=document.getElementById('musicBtn');
    const aud=document.getElementById('bgAudio');
    let on=false;
    if(btn) btn.addEventListener('click',()=>{on=!on;btn.classList.toggle('playing',on);if(aud.src&&aud.src!==location.href){on?aud.play().catch(()=>{}):aud.pause();}});
    const cb=document.getElementById('copyBtn'),an=document.getElementById('accNum');
    if(cb&&an) cb.addEventListener('click',()=>{
      navigator.clipboard&&navigator.clipboard.writeText(an.textContent.replace(/\s/g,'')).catch(()=>{});
      const o=cb.textContent;cb.textContent='Tersalin!';cb.classList.add('ok');
      setTimeout(()=>{cb.textContent=o;cb.classList.remove('ok');},2000);
    });
    document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>{
      document.querySelectorAll('.lang-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    }));
    // Parallax hero
    const hf=document.querySelector('.hero-floral');
    if(hf&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
      let t=false;
      window.addEventListener('scroll',()=>{if(!t){requestAnimationFrame(()=>{hf.style.transform=`translateY(${scrollY*.1}px)`;t=false;});t=true;}},{passive:true});
    }
  })();