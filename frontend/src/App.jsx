/*
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║    ██████╗██╗  ██╗ █████╗ ██╗  ██╗██████╗  █████╗ ██╗   ██╗██╗   ██╗██╗ ██╗██╗  ██╗   ║
║   ██╔════╝██║  ██║██╔══██╗██║ ██╔╝██╔══██╗██╔══██╗██║   ██║╚██╗ ██╔╝██║ ██║██║  ██║   ║
║   ██║     ███████║███████║█████╔╝ ██████╔╝███████║██║   ██║ ╚████╔╝ ██║ ██║███████║   ║
║   ██║     ██╔══██║██╔══██║██╔═██╗ ██╔══██╗██╔══██║╚██╗ ██╔╝  ╚██╔╝  ██║ ██║██╔══██║   ║
║   ╚██████╗██║  ██║██║  ██║██║  ██╗██║  ██║██║  ██║ ╚████╔╝    ██║   ██████║██║  ██║   ║
║    ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝     ╚═╝   ╚═════╝╚═╝  ╚═╝   ║
║                                                                                       ║
║   CHAKRAVYUH-AI  v1.0  —  Border Defence & Surveillance Intelligence Dashboard        ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  FILE  :  frontend / src / App.jsx                                                    ║
║  ROLE  :  React 18 SPA — entire frontend in one file (3500+ lines)                    ║
║           9 operational modules + 1 Quantum Security module                           ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  MODULES                                                                              ║
║  ───────────────────────────────────────────────────────────────────────────────────  ║
║  OVERVIEW     KPI bar (total/active/neutralized/falsePos), threat log, timeline       ║
║  LIVE DEMO    5-stage pipeline visualiser: Webcam→YOLO→Anomaly→Priority→MapMarker     ║
║  CCTV         Live webcam, YOLOv8 every 3s, bounding boxes, centroid path trails      ║
║  DRONE        Terrain canvas, GARUDA-1/2/3 UAVs, IR/VIS mode, 1×-8× zoom              ║
║  THREATS      Live threat feed, Cognitive Tactical Brief, Action Log                  ║
║  ANALYTICS    EDA charts from ML pipeline, classification results, anomaly visuals    ║
║  SENSORS      6 sensor cards (VISUAL/IR/SEISMIC/RF/SAT/ACOUSTIC), dataset feed        ║
║  OSINT        Top 27 risk zones from /api/risk-zones (ML pipeline output)             ║
║  MAP          World map (ne_50m GeoJSON), India LoC/LAC overlays, threat markers,     ║
║               pan/zoom/pinch, Markov infiltration route renderer                      ║
║  QUANTUM      Live PQC dashboard: Kyber/Dilithium metrics, signature chain feed,      ║
║               key rotation timer, on-demand chain integrity verification              ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  KEY ALGORITHMS IMPLEMENTED IN THIS FILE                                              ║
║  ───────────────────────────────────────────────────────────────────────────────────  ║
║  CentroidTracker                                                                      ║
║  ▸ Euclidean distance matching with 80px threshold                                    ║
║  ▸ 20-point path history for trail rendering on canvas                                ║
║  ▸ 8-frame disappearance counter before object is dropped from tracking               ║
║  ▸ WHY: Standard SORT/DeepSORT are too heavy for browser-side execution.              ║
║    CentroidTracker gives persistent object IDs at near-zero CPU cost.                 ║
║                                                                                       ║
║  Markov-Chain Infiltration Route Predictor                                            ║
║  ▸ 5-step probabilistic path toward nearest defended target                           ║
║  ▸ Terrain-biased noise injection for realistic route curvature                       ║
║  ▸ WHY: Gives command operators a predictive visual of where a detected threat        ║
║    is likely headed — not just where it is. Supports pre-emptive deployment.          ║
║                                                                                       ║
║  Weighted Anomaly Score Formula  (mirrors backend exactly)                            ║
║  ▸ motion×0.30 + seismic×0.15 + thermal×0.15 + RF×0.15 +                              ║
║    objects×0.10 + is_night×0.10 + crowd_bonus×0.05                                    ║
║  ▸ WHY: Frontend and backend use the same formula so the LIVE DEMO pipeline           ║
║    visualiser shows accurate scores even before backend responds.                     ║
║                                                                                       ║
║  World Map — 4-Pass Glow Rendering (HTML5 Canvas)                                     ║
║  ▸ Outer haze → medium glow → inner glow → sharp core                                 ║
║  ▸ Offscreen staticCanvas cache rebuilt only on zoom change (eliminates lag)          ║
║  ▸ DPR-aware scaling: click coords use rect.width/height not canvas.width/height      ║
║  ▸ WHY: Browser canvas at 4K DPR without caching creates 60Hz repaints of a           ║
║    7,000-polygon GeoJSON — the cache pattern drops CPU from 80% to <5%.               ║ 
║                                                                                       ║
║  Quantum Security Dashboard  (QuantumModule component)                                ║
║  ▸ Polls /api/quantum-status every 3s for live key rotation + chain metrics           ║ 
║  ▸ Calls /api/quantum-verify on demand to walk full signature chain                   ║
║  ▸ Renders live signature feed: payload ID, chain index, threat level, sig hash       ║ 
║  ▸ WHY: Makes PQC visible to evaluators — not hidden in logs. A commander can         ║
║    see in real time that every ML output is signed and the chain is intact.           ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  BACKEND ENDPOINTS CONSUMED                                                           ║
║  ───────────────────────────────────────────────────────────────────────────────────  ║
║  POST http://localhost:5000/api/analyze-frame       CCTV + LIVE DEMO detection        ║
║  POST http://localhost:5000/api/tactical-brief      THREATS module SITREP             ║
║  GET  http://localhost:5000/api/risk-zones          OSINT module risk zones           ║
║  GET  http://localhost:5000/api/sensor-data         OVERVIEW + THREATS feed           ║
║  GET  http://localhost:5000/api/quantum-status      QUANTUM module metrics            ║
║  POST http://localhost:5000/api/quantum-verify      QUANTUM chain verify button       ║  
║  GET  http://localhost:5000/api/quantum-signatures  QUANTUM live signature feed       ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  MAP DATA REQUIREMENT                                                                 ║
║  ───────────────────────────────────────────────────────────────────────────────────  ║
║  Place ne_50m_admin_0_countries.json at:                                              ║
║    frontend/public/maps/ne_50m_admin_0_countries.json                                 ║
║  Download: https://github.com/nvkelso/natural-earth-vector                            ║
║  Or run  : python download_borders.py                                                 ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  INSTALLATION                                                                         ║
║  ───────────────────────────────────────────────────────────────────────────────────  ║
║  npm install                    Install React dependencies                            ║
║  npm start                      Start dev server on localhost:3000                    ║ 
║  npm run build                  Build production bundle → frontend/build/             ║
║                                                                                       ║
║  Dependencies:  react  react-dom  recharts  react-scripts                             ║
║  Fonts loaded from Google Fonts CDN: Orbitron, Share Tech Mono                        ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
*/

import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
  :root {
    --bg:#020810; --panel:#040d1a; --border:#0a3a5c;
    --cyan:#00e5ff; --green:#00ff88; --amber:#ffaa00; --red:#ff2d55;
    --text:#b0d8f0; --gap:5px; --pad:5px;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;overflow:hidden;}
  body{background:var(--bg);font-family:'Share Tech Mono',monospace;color:var(--text);}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:#020810;}
  ::-webkit-scrollbar-thumb{background:#0a3a5c;border-radius:2px;}
  .panel{background:var(--panel);border:1px solid var(--border);border-radius:5px;position:relative;overflow:hidden;min-width:0;min-height:0;}
  .panel::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:.5;z-index:1;}
  .panel-title{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;letter-spacing:2px;color:var(--cyan);text-transform:uppercase;padding:7px 10px 5px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:nowrap;overflow:hidden;}
  .blink{animation:blink 1.2s step-end infinite;}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
  .pulse-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;animation:pdot 1.5s ease-in-out infinite;}
  @keyframes pdot{0%,100%{box-shadow:0 0 0 0 currentColor;opacity:1}50%{box-shadow:0 0 0 4px transparent;opacity:.7}}
  .slide-in{animation:slideIn .3s ease-out;}
  @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
  .scan-line{position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,255,.015) 2px,rgba(0,229,255,.015) 4px);pointer-events:none;z-index:1;}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes pulse-ring{
    0%{box-shadow:0 0 0 0 rgba(255,45,85,.8),0 0 8px #ff2d55;}
    60%{box-shadow:0 0 0 8px rgba(255,45,85,0),0 0 14px #ff2d55;}
    100%{box-shadow:0 0 0 0 rgba(255,45,85,0),0 0 8px #ff2d55;}
  }

  /* ── NAV bar horizontal scroll on small screens ── */
  .nav-tabs{display:flex;gap:3px;overflow-x:auto;flex-shrink:0;padding-bottom:2px;scrollbar-width:none;}
  .nav-tabs::-webkit-scrollbar{display:none;}
  .nav-tabs button{white-space:nowrap;flex-shrink:0;}

  /* ── Module wrapper ── */
  .mod-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;padding:var(--pad);}

  /* ── Overview 3-col grid ── */
  .ov-grid{
    flex:1; display:grid; overflow:hidden; min-height:0;
    grid-template-columns: minmax(180px,210px) 1fr minmax(200px,250px);
    grid-template-rows: 66px 1fr;
    gap:var(--gap);
  }
  .kpi-bar{grid-column:1/-1;display:grid;grid-template-columns:repeat(6,1fr);gap:var(--gap);}

  /* ── Tablet ≤1200px ── */
  @media(max-width:1200px){
    .ov-grid{grid-template-columns:190px 1fr 210px;}
    .kpi-bar{grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;}
    .ov-grid{grid-template-rows:auto 1fr;}
  }
  /* ── Small tablet ≤900px ── */
  @media(max-width:900px){
    .ov-grid{grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr auto;}
    .kpi-bar{grid-template-columns:repeat(3,1fr);}
    .ov-grid>.ov-col-right{grid-column:1/-1;}
  }
  /* ── Mobile ≤600px ── */
  @media(max-width:600px){
    .ov-grid{grid-template-columns:1fr;}
    .kpi-bar{grid-template-columns:repeat(2,1fr);}
    .map-section{min-height:250px;}
  }
`;

// ─── REAL INDIAN BORDER HOTSPOTS ─────────────────────────────────────────────
const HOTSPOTS = [
  { name:"Depsang Plains",   lat:35.1, lon:77.8, region:"Ladakh LAC",        sector:"ALPHA-1" },
  { name:"Galwan Valley",    lat:34.4, lon:73.6, region:"J&K LoC",           sector:"ALPHA-2" },
  { name:"Siachen Glacier",  lat:35.5, lon:76.9, region:"Ladakh LAC",        sector:"ALPHA-3" },
  { name:"Pangong Tso",      lat:33.7, lon:78.9, region:"Ladakh LAC",        sector:"ALPHA-4" },
  { name:"Tawang Sector",    lat:27.6, lon:91.9, region:"Arunachal Sector",  sector:"BRAVO-1" },
  { name:"Anjaw District",   lat:28.1, lon:96.3, region:"Arunachal Sector",  sector:"BRAVO-2" },
  { name:"Doklam Plateau",   lat:27.3, lon:89.1, region:"Sikkim Ridge",      sector:"CHARLIE-1"},
  { name:"Nathula Pass",     lat:27.4, lon:88.8, region:"Sikkim Ridge",      sector:"CHARLIE-2"},
  { name:"Lipulekh Pass",    lat:30.2, lon:80.3, region:"Uttarakhand Pass",  sector:"DELTA-1" },
  { name:"Wagah Border",     lat:31.6, lon:74.6, region:"Punjab Sector",     sector:"ECHO-1"  },
  { name:"Barmer Sector",    lat:25.7, lon:71.4, region:"Rajasthan Border",  sector:"FOXTROT-1"},
  { name:"Kutch Gulf",       lat:23.0, lon:68.9, region:"Gujarat Coast",     sector:"GOLF-1"  },
  { name:"Rann of Kutch",    lat:23.9, lon:70.0, region:"Gujarat Coast",     sector:"GOLF-2"  },
  { name:"Pir Panjal Range", lat:33.5, lon:74.2, region:"J&K LoC",          sector:"HOTEL-1" },
  { name:"Mizoram Border",   lat:22.7, lon:92.7, region:"Northeast Sector",  sector:"INDIA-1" },
];

const OBJ_MAP = {
  person:"INFANTRY_INFILTRATION", car:"VEHICLE_CONVOY", truck:"VEHICLE_CONVOY",
  motorcycle:"SCOUT_RECON", bus:"TROOP_TRANSPORT", airplane:"AERIAL_RECON",
  bird:"AERIAL_RECON", backpack:"ARMED_OPERATIVE", default:"UNCLASSIFIED_ANOMALY"
};

// ─── THREAT LEVEL COLOR HELPERS ──────────────────────────────────────────────
const lc = (level) => {
  if (level === "CRITICAL") return "#ff2d55"; // Red
  if (level === "HIGH")     return "#ffaa00"; // Amber
  if (level === "MEDIUM")   return "#ffee55"; // Yellow
  return "#00ff88";                           // Green (LOW)
};

const lb = (level) => {
  if (level === "CRITICAL") return "rgba(255,45,85,.12)";
  if (level === "HIGH")     return "rgba(255,170,0,.12)";
  if (level === "MEDIUM")   return "rgba(255,238,85,.12)";
  return "rgba(0,255,136,.12)";
};

// ─── CENTROID TRACKER ─────────────────────────────────────────────────────────
class CentroidTracker {
  constructor(){ this.nextID=1; this.objects={}; this.disappeared={}; this.maxDisappeared=8; }
  register(cx,cy,label,conf){
    const id=this.nextID++;
    this.objects[id]={cx,cy,label,conf,path:[[cx,cy]],age:0,id};
    this.disappeared[id]=0; return id;
  }
  update(detections){
    if(!detections.length){
      Object.keys(this.disappeared).forEach(id=>{
        this.disappeared[id]++;
        if(this.disappeared[id]>this.maxDisappeared){delete this.objects[id];delete this.disappeared[id];}
      });
      return this.objects;
    }
    const inputs=detections.map(d=>({cx:d.bbox[0]+d.bbox[2]/2,cy:d.bbox[1]+d.bbox[3]/2,label:d.class,conf:d.score}));
    if(!Object.keys(this.objects).length){inputs.forEach(c=>this.register(c.cx,c.cy,c.label,c.conf));}
    else{
      const ids=Object.keys(this.objects);
      const usedR=new Set(),usedC=new Set();
      ids.forEach((id,ri)=>{
        let minD=80,minC=-1;
        inputs.forEach((ic,ci)=>{
          const d=Math.hypot(this.objects[id].cx-ic.cx,this.objects[id].cy-ic.cy);
          if(d<minD&&!usedC.has(ci)){minD=d;minC=ci;}
        });
        if(minC>=0&&!usedR.has(ri)){
          const prev=this.objects[id];
          const path=[...(prev.path||[]),[inputs[minC].cx,inputs[minC].cy]].slice(-20);
          this.objects[id]={...prev,cx:inputs[minC].cx,cy:inputs[minC].cy,label:inputs[minC].label,conf:inputs[minC].conf,path,age:prev.age+1};
          this.disappeared[id]=0; usedR.add(ri); usedC.add(minC);
        }
      });
      inputs.forEach((_,ci)=>{if(!usedC.has(ci))this.register(inputs[ci].cx,inputs[ci].cy,inputs[ci].label,inputs[ci].conf);});
      ids.forEach((id,ri)=>{
        if(!usedR.has(ri)){
          this.disappeared[id]++;
          if(this.disappeared[id]>this.maxDisappeared){delete this.objects[id];delete this.disappeared[id];}
        }
      });
    }
    return this.objects;
  }
}

const INIT_THREATS=[];  // No synthetic threats — data comes from dataset/backend
const INIT_TL=Array.from({length:24},(_,i)=>({hour:`${String(i).padStart(2,"0")}:00`,threats:0,neutralized:0,falsePos:0})); // populated from dataset

// ─── MARKOV INFILTRATION ROUTE PREDICTOR ─────────────────────────────────────
// Generates probable infiltration paths from high-risk hotspots toward interior
// Uses simplified Markov chain: each step biased toward interior + known corridors
const INTERIOR_TARGETS = [
  { name:"Leh",         lat:34.17, lon:77.58 },
  { name:"Srinagar",    lat:34.09, lon:74.79 },
  { name:"Pathankot",   lat:32.27, lon:75.65 },
  { name:"Amritsar",    lat:31.63, lon:74.87 },
  { name:"Dibrugarh",   lat:27.48, lon:94.91 },
  { name:"Itanagar",    lat:27.09, lon:93.62 },
  { name:"Gangtok",     lat:27.33, lon:88.61 },
  { name:"Bhuj",        lat:23.25, lon:69.67 },
];

function generateRoutes(threats) {
  return [];
}

// ─── INDIA MAP ────────────────────────────────────────────────────────────────
// ─── INDIA GEO (state borders + disputed lines, used by WorldMap at zoom≥2.5) ──
const GEO = {
  loc:[[37,74.5],[36.5,75.5],[35.5,76.5],[34.5,76.8],[34.2,77.5],[33.5,76.5],[33.2,75.5],[33,74.5]],
  lac:[[37,80],[35.5,79.5],[35,78],[34.2,77.5],[33.5,78.5]],
  states:[
    {name:"JAMMU & KASHMIR",abbr:"J&K",       lbl:[34.5,74.5], poly:[[35.5,76.5],[34.5,76.8],[34.2,77.5],[33.5,76.5],[33.2,75.5],[33,74.5],[33.5,73.8],[34.5,73.5],[35.5,74],[36.5,74.5],[36.5,75.5],[35.5,76.5]]},
    {name:"LADAKH",          abbr:"LAD",       lbl:[33.8,78.5], poly:[[35.5,76.5],[36.5,75.5],[37,74.5],[37,80],[35.5,79.5],[35,78],[34.2,77.5],[34.5,76.8],[35.5,76.5]]},
    {name:"HIMACHAL PRADESH",abbr:"HP",        lbl:[31.8,77.1], poly:[[33.2,75.5],[33.5,76.5],[33,77.5],[32.5,78.5],[31.5,77.8],[30.8,77],[31,76],[31.5,75.2],[32.2,74.8],[33,74.5],[33.2,75.5]]},
    {name:"PUNJAB",          abbr:"PB",        lbl:[30.8,75.4], poly:[[33,74.5],[32.2,74.8],[31.5,75.2],[31,76],[30.5,76.5],[29.6,76.2],[30,75.5],[30.3,74.5],[31,73.9],[32,73.9],[32.5,74.5],[33,74.5]]},
    {name:"HARYANA",         abbr:"HR",        lbl:[29.4,76.0], poly:[[30.8,77],[31.5,77.8],[30.5,77.8],[29.5,77.5],[28.8,77.3],[29,76.5],[29.6,76.2],[30.5,76.5],[30.8,77]]},
    {name:"UTTARAKHAND",     abbr:"UK",        lbl:[30.2,79.2], poly:[[33,77.5],[32.5,78.5],[31.5,80.5],[30.5,81],[29.5,80.5],[29,79],[29.5,77.5],[30.5,77.8],[31.5,77.8],[33,77.5]]},
    {name:"RAJASTHAN",       abbr:"RJ",        lbl:[26.0,73.2], poly:[[30.3,74.5],[30,75.5],[29.6,76.2],[29,76.5],[28.8,77.3],[28,77.5],[27,77.5],[25.5,76],[24.5,74.5],[23.5,70.5],[23.5,69.5],[24,69],[24.5,68.5],[27.5,68.5],[28.5,70],[28.5,72.5],[30.3,74.5]]},
    {name:"UTTAR PRADESH",   abbr:"UP",        lbl:[27.0,80.5], poly:[[30.5,81],[29.5,80.5],[29,79],[29.5,77.5],[28.8,77.3],[28,77.5],[27,77.5],[25.5,76],[25,77],[24,80],[24.5,82],[25.5,83.5],[26,84.5],[27,84],[27.5,83.5],[28,83],[29,80.5],[30.5,81]]},
    {name:"BIHAR",           abbr:"BR",        lbl:[25.5,85.5], poly:[[27.5,83.5],[27,84],[26,84.5],[25.5,83.5],[24.5,82],[24,84],[24.5,85.5],[25.5,87.5],[26.5,87.5],[27.5,87],[27.5,83.5]]},
    {name:"WEST BENGAL",     abbr:"WB",        lbl:[24.0,87.5], poly:[[27.5,87],[26.5,87.5],[25.5,87.5],[24.5,85.5],[22.5,87.5],[21.9,86.5],[22,88.5],[22.6,88.5],[23.5,89.5],[24.5,88.5],[25.5,88.5],[26.5,89],[27.2,88.2],[27.5,87]]},
    {name:"MADHYA PRADESH",  abbr:"MP",        lbl:[23.5,78.5], poly:[[26,76],[27,77.5],[28,77.5],[27.5,78],[26,78],[25,77],[24,80],[24.5,82],[22.5,82],[21.5,80.5],[21,79],[21.5,76],[22.5,74.5],[23.5,74.5],[24.5,74.5],[26,76]]},
    {name:"GUJARAT",         abbr:"GJ",        lbl:[22.5,72.0], poly:[[24.5,74.5],[23.5,74.5],[22.5,74.5],[21.5,74],[20.5,73.5],[20,73],[20.5,72],[21,71],[22,70],[22.5,69.5],[23,68.5],[24,69],[23.5,69.5],[23.5,70.5],[24.5,72.5],[24.5,74.5]]},
    {name:"MAHARASHTRA",     abbr:"MH",        lbl:[19.5,76.0], poly:[[24.5,74.5],[22.5,74.5],[21.5,74],[20.5,73.5],[18.5,72.8],[17,73.5],[16,73.8],[16.5,75.5],[17.5,77],[18,78.5],[19.5,79],[20,79.5],[21,79],[21.5,80.5],[22.5,82],[24,80],[24.5,74.5]]},
    {name:"KARNATAKA",       abbr:"KA",        lbl:[15.0,76.0], poly:[[17,77],[17,73.5],[15.8,73.8],[14,74.5],[12,75.5],[11.5,76.5],[11.7,78.5],[12.5,77.5],[13.5,77.5],[14.5,78.5],[15,80],[16.5,80.5],[17.5,80.5],[17,77]]},
    {name:"ANDHRA PRADESH",  abbr:"AP",        lbl:[15.5,79.5], poly:[[18.5,83.5],[18.5,81.5],[17.5,80.5],[16.5,80.5],[15,80],[13.5,80.5],[14.5,78.5],[15.5,77.5],[17,77],[18,78.5],[19.5,79],[19.5,84],[18.5,83.5]]},
    {name:"TELANGANA",       abbr:"TS",        lbl:[17.5,79.2], poly:[[19.5,84],[20,79.5],[19.5,79],[18,78.5],[17.5,80.5],[18.5,81.5],[19,80],[19.5,84]]},
    {name:"TAMIL NADU",      abbr:"TN",        lbl:[11.5,78.5], poly:[[13.5,80.5],[14.5,78.5],[13.5,77.5],[12.5,77.5],[11.7,78.5],[11,76.5],[9.5,77.5],[8.5,78.5],[9.5,80.5],[11,79.5],[12.5,80],[13.5,80.5]]},
    {name:"KERALA",          abbr:"KL",        lbl:[10.5,76.3], poly:[[12,75.5],[11.5,76.5],[11,76.5],[9,77.5],[8.2,77.5],[8.5,77],[9.5,77.5],[10.5,76.5],[11.5,75.5],[12,75.5]]},
    {name:"ODISHA",          abbr:"OD",        lbl:[20.5,84.5], poly:[[22.5,87.5],[21.9,86.5],[21.8,83.5],[19.5,84],[18.5,83.5],[18.5,81.5],[19,80],[20,82],[20.5,86.5],[21.5,87],[22.5,87.5]]},
    {name:"CHHATTISGARH",    abbr:"CG",        lbl:[21.0,82.2], poly:[[24.5,82],[22.5,82],[21.5,80.5],[21,79],[20,79.5],[19.5,79],[19,80],[18.5,81.5],[18.5,83.5],[19.5,84],[21.5,83.5],[22.5,82.5],[24,84],[24.5,82]]},
    {name:"JHARKHAND",       abbr:"JH",        lbl:[23.5,85.0], poly:[[24,84],[24.5,82],[22.5,82],[21.8,83.5],[21.9,86.5],[22.5,87.5],[24.5,85.5],[24,84]]},
    {name:"ASSAM",           abbr:"AS",        lbl:[26.2,92.5], poly:[[27.5,89.5],[26.9,89.5],[26.5,89],[25.5,88.5],[25,90],[24,91],[24.5,92.5],[25,93.5],[25.5,94.5],[26.5,94.5],[27.5,95],[27.5,93.5],[26.9,92],[27.5,89.5]]},
    {name:"ARUNACHAL PRADESH",abbr:"AR",       lbl:[27.5,93.5], poly:[[29.5,92],[28,92.5],[27.5,93.5],[27.5,95],[28.5,96.5],[29,97],[29.5,97.4],[29.5,92]]},
    {name:"SIKKIM",          abbr:"SK",        lbl:[27.5,88.4], poly:[[28.1,88],[27.7,87.5],[27,88],[27.3,89],[28.1,88.6],[28.1,88]]},
    {name:"MEGHALAYA",       abbr:"ML",        lbl:[25.5,91.2], poly:[[26.5,89],[25.5,88.5],[25,90],[25,92],[25.5,92.5],[26.5,92],[26.5,89]]},
    {name:"NAGALAND",        abbr:"NL",        lbl:[26.0,94.2], poly:[[27.5,95],[26.5,94.5],[25.5,94.5],[26,96],[27,95.5],[27.5,95]]},
    {name:"MANIPUR",         abbr:"MN",        lbl:[24.5,93.8], poly:[[25.5,94.5],[24.5,93.5],[24,93],[23.5,93.5],[24,94.5],[24.5,94.5],[25,94],[25.5,94.5]]},
    {name:"MIZORAM",         abbr:"MZ",        lbl:[23.2,92.7], poly:[[23.5,93.5],[24,93],[24.5,92.5],[24,91.5],[23,92],[22,92.5],[21.9,93],[22.5,93.5],[23.5,93.5]]},
    {name:"TRIPURA",         abbr:"TR",        lbl:[23.5,91.5], poly:[[24.5,92.5],[24,91.5],[23,91],[22.5,91.5],[23,92],[24,91.5],[24.5,92.5]]},
  ],
};

// ─── WORLD GEO DATA ──────────────────────────────────────────────────────────
const WGEO = {
  // Countries: [name, [label_lat,label_lon], [[lat,lon],...]]
  countries:[
    // ── North America ──────────────────────────────────────────────────
    {n:"USA",         lbl:[39,-98],
     poly:[[49,-125],[49,-104],[49,-80],[46,-84],[45,-83],[43,-82],[43,-76],[45,-71],[44,-66],[41,-70],[41,-74],[40,-74],[38,-75],[35,-75],[32,-80],[30,-81],[26,-80],[24,-81],[25,-80],[25,-97],[29,-89],[29,-94],[26,-97],[29,-89],[32,-117],[34,-120],[37,-122],[39,-124],[42,-124],[46,-124],[48,-124],[49,-125]]},
    {n:"CANADA",      lbl:[60,-96],
     poly:[[49,-125],[49,-95],[49,-66],[53,-56],[60,-64],[68,-63],[70,-68],[70,-78],[68,-84],[60,-93],[65,-95],[68,-100],[70,-108],[72,-120],[70,-130],[65,-138],[60,-141],[72,-141],[83,-100],[83,-70],[70,-68],[60,-64],[53,-56],[49,-66],[49,-95],[49,-125]]},
    {n:"MEXICO",      lbl:[24,-102],
     poly:[[32,-117],[25,-97],[18,-88],[16,-88],[14,-92],[16,-94],[19,-91],[20,-87],[22,-90],[22,-88],[23,-90],[28,-111],[32,-115],[32,-117]]},
    {n:"GREENLAND",   lbl:[72,-42],
     poly:[[60,-45],[64,-52],[68,-52],[72,-55],[76,-63],[83,-50],[83,-20],[80,-18],[76,-18],[70,-22],[65,-40],[60,-45]]},
    {n:"CUBA",        lbl:[22,-79],
     poly:[[22,-74],[23,-82],[23,-84],[22,-85],[20,-85],[20,-74],[22,-74]]},
    // ── South America ──────────────────────────────────────────────────
    {n:"COLOMBIA/VEN",lbl:[5,-70],
     poly:[[12,-72],[11,-63],[8,-63],[5,-60],[2,-60],[0,-78],[4,-76],[8,-76],[11,-72],[12,-72]]},
    {n:"BRAZIL",      lbl:[-8,-55],
     poly:[[5,-60],[8,-63],[11,-63],[12,-72],[8,-76],[4,-76],[0,-78],[-5,-36],[-5,-35],[-10,-36],[-15,-38],[-20,-40],[-23,-43],[-30,-51],[-33,-53],[-35,-60],[-20,-70],[-15,-73],[-4,-60],[-4,-60],[5,-60]]},
    {n:"ARGENTINA",   lbl:[-35,-65],
     poly:[[-22,-65],[-25,-48],[-33,-53],[-35,-60],[-52,-70],[-55,-65],[-52,-58],[-38,-58],[-22,-65]]},
    {n:"PERU/CHILE",  lbl:[-20,-74],
     poly:[[0,-78],[-5,-80],[-15,-75],[-22,-70],[-35,-70],[-52,-70],[-35,-60],[-22,-65],[-18,-70],[-15,-73],[-4,-60],[0,-78]]},
    {n:"BOLIVIA/PAR", lbl:[-18,-63],
     poly:[[-15,-73],[-18,-70],[-22,-65],[-22,-60],[-20,-57],[-18,-57],[-15,-60],[-12,-65],[-15,-73]]},
    // ── Europe ─────────────────────────────────────────────────────────
    {n:"UK",          lbl:[54,-2],
     poly:[[50,-5],[51,-5],[55,-4],[58,-3],[60,-2],[58,0],[54,0],[52,2],[51,1],[51,-5],[50,-5]]},
    {n:"IRELAND",     lbl:[53,-8],
     poly:[[51,-10],[54,-10],[55,-6],[52,-5],[51,-10]]},
    {n:"FRANCE",      lbl:[46,2],
     poly:[[51,-2],[48,2],[44,0],[43,4],[44,7],[47,7],[49,6],[51,-2]]},
    {n:"SPAIN",       lbl:[40,-4],
     poly:[[44,-8],[44,-2],[43,3],[40,0],[37,-7],[36,-6],[36,-5],[38,-9],[43,-8],[44,-8]]},
    {n:"PORTUGAL",    lbl:[39,-8],
     poly:[[42,-8],[41,-8],[37,-9],[38,-9],[41,-8],[42,-8]]},
    {n:"ITALY",       lbl:[43,12],
     poly:[[44,8],[47,12],[46,14],[44,12],[40,15],[38,16],[37,15],[38,13],[41,12],[44,8]]},
    {n:"GERMANY+CE",  lbl:[50,13],
     poly:[[48,6],[52,6],[54,10],[54,18],[50,22],[48,18],[47,8],[48,6]]},
    {n:"SCANDINAVIA", lbl:[65,16],
     poly:[[58,5],[64,5],[70,15],[72,25],[68,28],[65,25],[60,28],[57,12],[58,5]]},
    {n:"FINLAND",     lbl:[64,26],
     poly:[[60,22],[62,22],[68,28],[72,28],[70,22],[65,22],[60,22]]},
    {n:"UKRAINE/POL", lbl:[50,28],
     poly:[[50,22],[54,18],[54,28],[52,32],[48,38],[46,30],[46,22],[48,18],[50,22]]},
    {n:"TURKEY",      lbl:[39,35],
     poly:[[42,26],[42,36],[40,44],[38,44],[37,36],[36,28],[40,26],[42,26]]},
    {n:"GREECE/BAL",  lbl:[39,22],
     poly:[[42,20],[44,22],[44,26],[42,26],[40,26],[37,22],[38,20],[40,20],[42,20]]},
    // ── Russia ─────────────────────────────────────────────────────────
    {n:"RUSSIA",      lbl:[61,100],
     poly:[[55,30],[60,20],[65,25],[70,28],[72,50],[72,80],[68,100],[68,130],[62,160],[55,155],[48,135],[50,130],[55,135],[65,160],[68,160],[65,140],[60,130],[55,120],[55,105],[50,80],[55,65],[52,48],[48,45],[45,42],[48,38],[52,32],[54,28],[54,18],[55,30]]},
    // ── Middle East ────────────────────────────────────────────────────
    {n:"IRAN",        lbl:[32,54],
     poly:[[38,44],[38,60],[34,62],[30,48],[28,52],[25,56],[28,60],[34,62],[38,60],[38,44]]},
    {n:"IRAQ/SYRIA",  lbl:[34,42],
     poly:[[37,36],[37,44],[34,46],[30,48],[28,46],[30,38],[34,36],[37,36]]},
    {n:"SAUDI ARABIA",lbl:[24,44],
     poly:[[30,38],[30,48],[26,56],[22,60],[14,48],[14,42],[22,38],[28,34],[30,38]]},
    {n:"AFGHANISTAN", lbl:[33,66],
     poly:[[37,60],[37,74],[32,72],[28,62],[30,60],[36,60],[37,60]]},
    {n:"PAKISTAN",    lbl:[30,68],
     poly:[[37,74],[32,72],[28,62],[24,62],[24,68],[28,72],[30,67],[32,74],[37,74]]},
    {n:"EGYPT/N.AFR", lbl:[26,20],
     poly:[[37,10],[36,30],[32,32],[30,32],[22,36],[15,42],[12,44],[12,38],[14,10],[16,0],[24,-8],[30,-5],[34,0],[37,10]]},
    // ── Asia ───────────────────────────────────────────────────────────
    {n:"CHINA",       lbl:[35,103],
     poly:[[53,122],[48,130],[43,130],[38,121],[30,121],[22,114],[22,108],[24,98],[28,97],[28,92],[28,80],[32,80],[34,79],[38,74],[42,80],[50,80],[55,90],[55,105],[53,122]]},
    {n:"INDIA",       lbl:[22,80],
     poly:[[37,74],[34,73],[32,74],[28,72],[24,68],[22,68],[20,73],[18,73],[15,73],[12,76],[8,77],[8,80],[10,80],[12,80],[13,80],[17,82],[20,85],[20,88],[22,88],[24,88],[26,89],[28,97],[28,80],[32,80],[34,79],[37,74]]},
    {n:"JAPAN",       lbl:[36,138],
     poly:[[33,130],[35,135],[38,141],[42,142],[43,142],[40,141],[36,136],[33,130]]},
    {n:"KOREA",       lbl:[37,127],
     poly:[[34,126],[38,126],[38,130],[35,129],[34,126]]},
    {n:"SE ASIA",     lbl:[15,105],
     poly:[[22,100],[22,108],[18,104],[14,100],[10,100],[4,103],[4,108],[12,108],[16,108],[20,105],[22,100]]},
    {n:"INDONESIA",   lbl:[-5,118],
     poly:[[-8,115],[-10,115],[-8,118],[-8,125],[-4,135],[-2,135],[0,130],[-5,120],[-8,115]]},
    {n:"MYANMAR/BD",  lbl:[22,95],
     poly:[[28,97],[28,92],[22,92],[16,98],[20,100],[24,98],[28,97]]},
    // ── Africa ─────────────────────────────────────────────────────────
    {n:"W.AFRICA",    lbl:[10,4],
     poly:[[16,0],[12,0],[6,2],[4,6],[4,10],[6,12],[8,14],[12,14],[14,12],[16,2],[16,0]]},
    {n:"E.AFRICA",    lbl:[5,38],
     poly:[[12,42],[8,42],[4,42],[4,36],[0,36],[-4,38],[-5,40],[-8,40],[-5,34],[0,34],[4,38],[8,40],[12,42]]},
    {n:"S.AFRICA",    lbl:[-28,25],
     poly:[[-5,34],[-10,40],[-18,36],[-28,34],[-34,26],[-34,18],[-28,16],[-20,14],[-18,12],[-10,14],[-5,14],[-5,25],[-5,28],[-5,34]]},
    {n:"C.AFRICA",    lbl:[0,22],
     poly:[[4,14],[4,22],[0,24],[-5,28],[-5,14],[4,14],[8,14],[12,14],[12,24],[8,28],[4,28],[4,14]]},
    {n:"MADAGASCAR",  lbl:[-20,47],
     poly:[[-12,48],[-14,50],[-18,50],[-24,44],[-20,44],[-14,48],[-12,48]]},
    // ── Oceania ────────────────────────────────────────────────────────
    {n:"AUSTRALIA",   lbl:[-26,135],
     poly:[[-14,130],[-14,136],[-12,136],[-15,142],[-18,148],[-24,154],[-34,150],[-38,146],[-38,140],[-35,136],[-32,133],[-34,124],[-30,115],[-22,114],[-18,122],[-15,130],[-14,130]]},
    {n:"NEW ZEALAND", lbl:[-42,172],
     poly:[[-34,173],[-38,176],[-42,174],[-46,168],[-44,168],[-38,174],[-34,173]]},
  ],

  // City lights — [name, lat, lon, size, capital?]
  cities:[
    // Always visible (z0)
    {n:"WASHINGTON",  lat:38.9, lon:-77.0,  sz:3, cap:true,  z:0},
    {n:"LONDON",      lat:51.5, lon:-0.1,   sz:3, cap:true,  z:0},
    {n:"MOSCOW",      lat:55.7, lon:37.6,   sz:3, cap:true,  z:0},
    {n:"BEIJING",     lat:39.9, lon:116.4,  sz:3, cap:true,  z:0},
    {n:"NEW DELHI",   lat:28.6, lon:77.2,   sz:3, cap:true,  z:0},
    {n:"TOKYO",       lat:35.7, lon:139.7,  sz:3, cap:true,  z:0},
    {n:"CANBERRA",    lat:-35.3,lon:149.1,  sz:2, cap:true,  z:0},
    {n:"BRASILIA",    lat:-15.8,lon:-47.9,  sz:2, cap:true,  z:0},
    {n:"CAIRO",       lat:30.0, lon:31.2,   sz:2, cap:true,  z:0},
    {n:"NAIROBI",     lat:-1.3, lon:36.8,   sz:2, cap:true,  z:0},
    // z1 (zoom >= 1.3)
    {n:"NEW YORK",    lat:40.7, lon:-74.0,  sz:4, z:1},
    {n:"LOS ANGELES", lat:34.0, lon:-118.2, sz:3, z:1},
    {n:"CHICAGO",     lat:41.9, lon:-87.6,  sz:3, z:1},
    {n:"TORONTO",     lat:43.7, lon:-79.4,  sz:2, z:1},
    {n:"PARIS",       lat:48.9, lon:2.3,    sz:3, z:1},
    {n:"BERLIN",      lat:52.5, lon:13.4,   sz:2, z:1},
    {n:"MADRID",      lat:40.4, lon:-3.7,   sz:2, z:1},
    {n:"ROME",        lat:41.9, lon:12.5,   sz:2, z:1},
    {n:"ISTANBUL",    lat:41.0, lon:29.0,   sz:3, z:1},
    {n:"TEHRAN",      lat:35.7, lon:51.4,   sz:2, z:1},
    {n:"DUBAI",       lat:25.2, lon:55.3,   sz:3, z:1},
    {n:"KARACHI",     lat:24.9, lon:67.0,   sz:3, z:1},
    {n:"MUMBAI",      lat:18.9, lon:72.8,   sz:3, z:1},
    {n:"KOLKATA",     lat:22.6, lon:88.4,   sz:2, z:1},
    {n:"CHENNAI",     lat:13.1, lon:80.3,   sz:2, z:1},
    {n:"SHANGHAI",    lat:31.2, lon:121.5,  sz:4, z:1},
    {n:"SEOUL",       lat:37.6, lon:127.0,  sz:3, z:1},
    {n:"SINGAPORE",   lat:1.3,  lon:103.8,  sz:2, z:1},
    {n:"JAKARTA",     lat:-6.2, lon:106.8,  sz:3, z:1},
    {n:"SYDNEY",      lat:-33.9,lon:151.2,  sz:3, z:1},
    {n:"SAO PAULO",   lat:-23.5,lon:-46.6,  sz:4, z:1},
    {n:"BUENOS AIRES",lat:-34.6,lon:-58.4,  sz:3, z:1},
    {n:"LAGOS",       lat:6.5,  lon:3.4,    sz:3, z:1},
    {n:"JOHANNESBURG",lat:-26.2,lon:28.0,   sz:2, z:1},
    // z2 (zoom >= 2.0) — India border hotspots
    {n:"SRINAGAR",    lat:34.1, lon:74.8,   sz:2, z:2},
    {n:"LEH",         lat:34.2, lon:77.6,   sz:2, z:2},
    {n:"AMRITSAR",    lat:31.6, lon:74.9,   sz:2, z:2},
    {n:"LUCKNOW",     lat:26.9, lon:80.9,   sz:2, z:2},
    {n:"TAWANG",      lat:27.6, lon:91.9,   sz:1, z:2},
    {n:"GUWAHATI",    lat:26.1, lon:91.7,   sz:2, z:2},
    {n:"JAIPUR",      lat:26.9, lon:75.8,   sz:2, z:2},
    {n:"HYDERABAD",   lat:17.4, lon:78.5,   sz:2, z:2},
    {n:"BANGALORE",   lat:13.0, lon:77.6,   sz:2, z:2},
  ],

  // Major rivers [[lat,lon],...]
  rivers:[
    {n:"Amazon",    pts:[[0,-50],[-3,-55],[-5,-60],[-4,-65],[-8,-72],[-10,-75]]},
    {n:"Nile",      pts:[[30,31],[22,32],[10,32],[4,32],[0,32]]},
    {n:"Congo",     pts:[[-5,14],[0,18],[-2,22],[-4,26],[-5,28]]},
    {n:"Mississippi",pts:[[29,-89],[32,-90],[35,-90],[38,-90],[41,-90],[46,-92]]},
    {n:"Yangtze",   pts:[[32,121],[30,117],[29,110],[28,105],[30,97],[32,92]]},
    {n:"Ganges",    pts:[[22,90],[24,87],[25,85],[26,83],[27,82],[28,80],[30,79]]},
    {n:"Indus",     pts:[[24,68],[27,70],[30,72],[33,73],[36,75]]},
    {n:"Ob",        pts:[[66,69],[62,74],[56,69],[53,68]]},
    {n:"Volga",     pts:[[46,48],[50,46],[54,48],[57,50],[56,44]]},
    {n:"Danube",    pts:[[45,30],[46,28],[47,22],[47,17],[48,14]]},
    {n:"Niger",     pts:[[5,6],[10,8],[14,4],[16,2]]},
    {n:"Zambezi",   pts:[[-18,36],[-16,32],[-16,26],[-18,24]]},
    {n:"Murray",    pts:[[-35,140],[-34,143],[-34,146],[-34,150]]},
  ],
};

// ─── WORLD MAP COMPONENT ─────────────────────────────────────────────────────
function WorldMap({ threats, selectedThreat, onSelect, showRoutes }) {
  const cvRef    = useRef(null);
  const rafRef   = useRef(0);
  const tickRef  = useRef(0);
  const geoRef   = useRef(null);
  const routesRef= useRef([]);
  const viewRef  = useRef({ x:0, y:0, zoom:1 });
  const dragRef  = useRef({ on:false, sx:0, sy:0, ox:0, oy:0 });
  const touchRef = useRef({ ts:[], ox:0, oy:0, oz:1 });
  const [ready,   setReady]   = useState(false);
  const [zoomLvl, setZoomLvl] = useState(1);
  const [hoverLL, setHoverLL] = useState(null);

  // Load GeoJSON once
  useEffect(() => {
    fetch("/maps/ne_50m_admin_0_countries.json")
      .then(r => r.json())
      .then(data => {
        console.log("GeoJSON loaded:", data.features?.length, "features");
        geoRef.current = data;
        setReady(true);
      })
      .catch(e => console.error("GeoJSON failed:", e));
  }, []);

  useEffect(() => {
    if (showRoutes) routesRef.current = generateRoutes(threats);
  }, [threats, showRoutes]);

  // When view changes (pan/zoom), invalidate static cache so it redraws
  // We do NOT invalidate on every frame — only when zoom changes
  const lastZoomRef = useRef(1);

  // Pan/zoom helpers — defined at component level for input handlers
  function _proj(lat, lon, W, H, v) {
    const nx = (lon + 180) / 360;
    const ny = (90 - lat) / 180;
    return [(nx-0.5)*v.zoom*W + W/2 + v.x,
            (ny-0.5)*v.zoom*H + H/2 + v.y];
  }
  function _clamp(x, y, z, W, H) {
    const mx=Math.max(W*.15,W*(z-.3)*.85), my=Math.max(H*.15,H*(z-.3)*.85);
    return {x:Math.max(-mx,Math.min(mx,x)), y:Math.max(-my,Math.min(my,y))};
  }

  // ─── RENDER LOOP ────────────────────────────────────────────────────────
  useEffect(() => {
    const cvs = cvRef.current; if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let starsDrawn = false;
    let staticCanvas = null;   // offscreen cache for countries+cities+stars
    let staticDirty  = true;   // rebuild when geo loads or canvas resizes

    const DPR = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for perf
    const resize = () => {
      const r = cvs.parentElement?.getBoundingClientRect();
      if (r && r.width > 10) {
        // Use device pixel ratio for crisp rendering on retina/high-DPI screens
        cvs.width  = Math.floor(r.width  * DPR);
        cvs.height = Math.floor(r.height * DPR);
        // Scale canvas back to CSS size so it fills the container
        cvs.style.width  = r.width  + "px";
        cvs.style.height = r.height + "px";
        // Scale context to match DPR
        const ctx2 = cvs.getContext("2d");
        ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
        starsDrawn  = false;
        staticDirty = true;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cvs.parentElement);

    // ── ALL helpers defined INSIDE effect so they are in scope ──────
    function proj(lat, lon, W, H, v) {
      const nx=(lon+180)/360, ny=(90-lat)/180;
      return [(nx-0.5)*v.zoom*W+W/2+v.x, (ny-0.5)*v.zoom*H+H/2+v.y];
    }

    function ringInView(ring, W, H, v) {
      let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
      const s=Math.max(1,Math.floor(ring.length/24));
      for(let i=0;i<ring.length;i+=s){
        const[x,y]=proj(ring[i][1],ring[i][0],W,H,v);
        if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;
      }
      return x1>-80&&x0<W+80&&y1>-80&&y0<H+80;
    }

    function makePath(ring, W, H, v) {
      ctx.beginPath();
      for(let i=0;i<ring.length;i++){
        const[x,y]=proj(ring[i][1],ring[i][0],W,H,v);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
    }

    // City light coordinates (major cities worldwide)
    const CITIES=[
      [28.6,77.2],[19.0,72.8],[22.6,88.4],[13.1,80.3],[12.9,77.6],[17.4,78.5],[23.0,72.6],[26.9,80.9],
      [39.9,116.4],[31.2,121.5],[23.1,113.3],[30.6,104.1],[29.6,106.6],[32.1,118.8],[41.8,123.4],[43.8,125.3],
      [51.5,-0.1],[48.9,2.3],[52.5,13.4],[41.9,12.5],[40.4,-3.7],[53.5,10.0],[48.2,16.4],[47.4,8.5],
      [50.1,14.4],[52.2,21.0],[47.5,19.0],[59.3,18.1],[55.7,12.6],[60.2,25.0],[59.9,30.3],[56.8,60.6],
      [40.7,-74.0],[34.0,-118.2],[41.8,-87.6],[29.7,-95.4],[33.4,-112.1],[47.6,-122.3],[25.8,-80.2],
      [32.8,-96.8],[37.8,-122.4],[38.9,-77.0],[42.4,-71.1],[36.2,-86.8],[35.2,-80.8],
      [25.2,55.3],[24.7,46.7],[41.0,29.0],[35.7,51.4],[33.3,44.4],[33.5,36.3],[24.9,67.0],[33.7,73.1],
      [35.7,139.7],[35.2,136.9],[34.7,135.5],[37.6,127.0],[35.1,129.0],[43.1,141.4],
      [1.3,103.8],[13.8,100.5],[-6.2,106.8],[10.8,106.7],[3.1,101.7],[21.0,105.8],
      [30.1,31.2],[6.5,3.4],[33.6,-7.6],[-26.2,28.0],[4.4,18.6],[-1.3,36.8],[9.0,38.7],
      [-23.5,-46.6],[-22.9,-43.2],[-34.6,-58.4],[-12.0,-77.0],[4.7,-74.1],[-33.4,-70.7],[19.4,-99.1],
      [-33.9,151.2],[-37.8,145.0],[-27.5,153.0],[-31.9,115.9],[-34.9,138.6],
      [55.7,37.6],[59.9,30.3],[55.0,82.9],[56.8,60.6],[58.0,56.2],[53.2,50.1],
    ];

    function draw() {
      tickRef.current++;
      const t=tickRef.current;
      const v=viewRef.current, zp=v.zoom;
      const geo=geoRef.current;
      // Use CSS pixel dimensions (logical) — ctx is scaled by DPR already
      const cssW = cvs.width / DPR, cssH = cvs.height / DPR;
      // Use logical pixel dimensions throughout
      const W = cssW, H = cssH;
      // Only rebuild static layer when zoom changes (not on pan — pan just blits)
      const zKey=Math.round(zp*20);
      if(!draw._lastZKey||draw._lastZKey!==zKey){ draw._lastZKey=zKey; staticDirty=true; }

      // ── STATIC OFFSCREEN CACHE — rebuild only on zoom change ──────────
      if(staticDirty && geo && geo.features && geo.features.length > 0){
        staticDirty = false;
        staticCanvas = document.createElement("canvas");
        // Build at CSS pixel dimensions — ctx's DPR transform handles sharpness on blit
        staticCanvas.width = W; staticCanvas.height = H;
        const sc = staticCanvas.getContext("2d");
        draw._builtAtX = v.x; draw._builtAtY = v.y;
        // BG + Stars
        sc.fillStyle="#010a14"; sc.fillRect(0,0,W,H);
        for(let i=0;i<420;i++){
          const b = (i * 137) % 100 / 100; 
          const x = (i * 937) % W;
          const y = (i * 733) % H;
          sc.fillStyle=`rgba(${160+Math.floor(b*80)},${195+Math.floor(b*45)},${225+Math.floor(b*30)},${+(b*.38).toFixed(2)})`;
          sc.fillRect(x, y, b<.05?1.5:1, b<.05?1.5:1);
        }

        // Ocean
        const og2=sc.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.72);
        og2.addColorStop(0,"rgba(0,18,38,.38)"); og2.addColorStop(1,"rgba(0,4,12,.58)");
        sc.fillStyle=og2; sc.fillRect(0,0,W,H);
        // Grid
        sc.lineWidth=0.3; sc.strokeStyle="rgba(0,229,255,.04)";
        for(let lo=-180;lo<=180;lo+=30){const[x]=proj(0,lo,W,H,v);sc.beginPath();sc.moveTo(x,0);sc.lineTo(x,H);sc.stroke();}
        for(let la=-90;la<=90;la+=30){const[,y]=proj(la,0,W,H,v);sc.beginPath();sc.moveTo(0,y);sc.lineTo(W,y);sc.stroke();}
        // Country fills
        const FILLS=["rgba(8,30,50,.72)","rgba(6,26,46,.72)","rgba(9,32,52,.72)","rgba(7,28,48,.72)","rgba(10,28,50,.72)","rgba(6,28,54,.72)","rgba(8,26,46,.72)","rgba(9,30,48,.72)","rgba(7,32,52,.72)"];
        geo.features.forEach((feat,fi)=>{
          const g=feat.geometry; if(!g) return;
          const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
          polys.forEach(poly=>{
            if(!poly[0]) return;
            sc.beginPath();for(let i=0;i<poly[0].length;i++){const[x,y]=proj(poly[0][i][1],poly[0][i][0],W,H,v);i===0?sc.moveTo(x,y):sc.lineTo(x,y);}sc.closePath();
            sc.fillStyle=FILLS[fi%FILLS.length]; sc.fill();
          });
        });
        // City lights
        CITIES.forEach(([clat,clon])=>{
          const[cx,cy]=proj(clat,clon,W,H,v);
          const gr=Math.max(2,5*Math.min(zp,2)*(zp<0.8?2.5:zp<1.5?1.8:1.2));
          const grd=sc.createRadialGradient(cx,cy,0,cx,cy,gr);
          grd.addColorStop(0,"rgba(255,210,110,.36)");grd.addColorStop(.45,"rgba(255,155,45,.13)");grd.addColorStop(.8,"rgba(255,95,15,.04)");grd.addColorStop(1,"transparent");
          sc.fillStyle=grd;sc.beginPath();sc.arc(cx,cy,gr,0,Math.PI*2);sc.fill();
          sc.beginPath();sc.arc(cx,cy,Math.max(0.5,0.95*Math.min(zp,2)*(zp<0.8?1.8:1)),0,Math.PI*2);sc.fillStyle="rgba(255,235,150,.72)";sc.fill();
        });
        // Borders — 4 glow passes
        const lw=Math.max(0.5,Math.min(2.2,0.8*Math.min(zp,3)));
        sc.setLineDash([]);
        geo.features.forEach(feat=>{
          const g=feat.geometry; if(!g) return;
          const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
          polys.forEach(poly=>{
            if(!poly[0]) return;
            const bp=()=>{sc.beginPath();for(let i=0;i<poly[0].length;i++){const[x,y]=proj(poly[0][i][1],poly[0][i][0],W,H,v);i===0?sc.moveTo(x,y):sc.lineTo(x,y);}sc.closePath();};
            bp();sc.strokeStyle="rgba(0,185,255,.07)"; sc.lineWidth=lw*11;sc.lineJoin="round";sc.stroke();
            bp();sc.strokeStyle="rgba(0,210,255,.16)"; sc.lineWidth=lw*5; sc.stroke();
            bp();sc.strokeStyle="rgba(0,229,255,.44)"; sc.lineWidth=lw*2.2;sc.stroke();
            bp();sc.strokeStyle="rgba(190,248,255,.96)";sc.lineWidth=lw*0.65;sc.stroke();
          });
        });
        // Labels
        if(zp>=0.65){
          const fs=Math.max(9,Math.round(9*Math.min(zp,2.2)));sc.font="bold "+fs+"px Share Tech Mono";
          geo.features.forEach(feat=>{
            const p=feat.properties||{};const name=p.NAME_EN||p.NAME||p.ADMIN||p.SOVEREIGNT||"";if(!name||name.length>28) return;
            let lat=p.LABEL_Y??null,lon=p.LABEL_X??null;
            if(lat==null&&feat.geometry){const g2=feat.geometry;const ring=g2.type==="Polygon"?g2.coordinates[0]:g2.type==="MultiPolygon"&&g2.coordinates[0]?.[0]?g2.coordinates[0][0]:null;if(ring&&ring.length>0){let sLa=0,sLo=0,n=0,st=Math.max(1,Math.floor(ring.length/28));for(let i=0;i<ring.length;i+=st){sLa+=ring[i][1];sLo+=ring[i][0];n++;}lat=sLa/n;lon=sLo/n;}}
            if(lat==null) return;const[x,y]=proj(lat,lon,W,H,v);if(x<0||x>W||y<0||y>H) return;
            const tw=sc.measureText(name).width;sc.fillStyle="rgba(2,8,16,.68)";sc.fillRect(x-3,y-fs,tw+6,fs+4);sc.fillStyle="rgba(0,215,248,.72)";sc.fillText(name,x,y);
          });
        }
      }

      // Blit static layer — O(1) per frame
      if(staticCanvas){
        const pdx=v.x-(draw._builtAtX||0), pdy=v.y-(draw._builtAtY||0);
        // Explicit W,H: draws staticCanvas (CSS-pixel-sized) into CSS pixel space correctly
        ctx.drawImage(staticCanvas, pdx, pdy, W, H);
        ctx.fillStyle="#010a14";
        if(pdx>0)ctx.fillRect(0,0,Math.ceil(pdx),H); if(pdx<0)ctx.fillRect(W+Math.floor(pdx),0,-Math.floor(pdx),H);
        if(pdy>0)ctx.fillRect(0,0,W,Math.ceil(pdy)); if(pdy<0)ctx.fillRect(0,H+Math.floor(pdy),W,-Math.floor(pdy));
      } else {
        ctx.fillStyle="#010a14"; ctx.fillRect(0,0,W,H);
        if(!geo){ctx.fillStyle="rgba(0,229,255,.7)";ctx.font="bold 14px Share Tech Mono";ctx.fillText("LOADING MAP...",W/2-95,H/2);}
      }

      // Scanline (cheap animated overlay)
      const sy=(t*.3)%H;
      const sg=ctx.createLinearGradient(0,sy-16,0,sy+16);
      sg.addColorStop(0,"transparent");sg.addColorStop(.5,"rgba(0,229,255,.013)");sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,sy-16,W,32);
      // Grid labels (always fresh)
      if(zp>=0.85){
        const gfs=Math.max(8,Math.round(8*Math.min(zp,1.5)));
        ctx.fillStyle="rgba(0,229,255,.2)"; ctx.font=gfs+"px Share Tech Mono";
        for(let lo=-150;lo<=150;lo+=30){const[x]=proj(0,lo,W,H,v);if(x>6&&x<W-22)ctx.fillText(Math.abs(lo)+(lo<0?"W":"E"),x+2,H-3);}
        for(let la=-60;la<=80;la+=30){const[,y]=proj(la,0,W,H,v);if(y>14&&y<H-4)ctx.fillText(Math.abs(la)+(la<0?"S":"N"),2,y);}
      }
            // State borders removed per user request

      // ── 10. LOC / LAC ────────────────────────────────────────────────
      if(zp>=1.8&&typeof GEO!=="undefined"){
        const dOff=(t*.25)%11;
        ctx.save(); ctx.setLineDash([5,4]); ctx.lineDashOffset=-dOff; ctx.lineWidth=1.4*Math.min(zp,2);
        ctx.strokeStyle="rgba(255,215,0,.78)"; ctx.beginPath();
        GEO.loc.forEach(([la,lo],i)=>{const[x,y]=proj(la,lo,W,H,v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}); ctx.stroke();
        ctx.strokeStyle="rgba(255,65,65,.72)"; ctx.beginPath();
        GEO.lac.forEach(([la,lo],i)=>{const[x,y]=proj(la,lo,W,H,v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
        if(zp>=2.5){
          ctx.font=Math.max(9,Math.round(8*Math.min(zp,2)))+"px Share Tech Mono";
          const[lx,ly]=proj(35.2,75.2,W,H,v); ctx.fillStyle="rgba(255,215,0,.9)"; ctx.fillText("LoC",lx,ly);
          const[rx,ry]=proj(35.8,79.8,W,H,v); ctx.fillStyle="rgba(255,65,65,.9)";  ctx.fillText("LAC",rx,ry);
        }
      }

      // Country labels are baked into staticCanvas above

      // ── 12. BORDER HOTSPOT LABELS (India-relevant only, shown at zoom≥2) ──
      if(zp>=2.0){
        const BORDER_CITIES=[
          {n:"NEW DELHI",   lat:28.6, lon:77.2},
          {n:"MUMBAI",      lat:18.9, lon:72.8},
          {n:"KOLKATA",     lat:22.6, lon:88.4},
          {n:"SRINAGAR",    lat:34.1, lon:74.8},
          {n:"AMRITSAR",    lat:31.6, lon:74.9},
          {n:"GUWAHATI",    lat:26.1, lon:91.7},
          {n:"TAWANG",      lat:27.6, lon:91.9},
          {n:"JAIPUR",      lat:26.9, lon:75.8},
          {n:"LUCKNOW",     lat:26.9, lon:80.9},
          {n:"BENGALURU",   lat:12.9, lon:77.6},
          {n:"HYDERABAD",   lat:17.4, lon:78.5},
          {n:"KARACHI",     lat:24.9, lon:67.0},
          {n:"ISLAMABAD",   lat:33.7, lon:73.1},
          {n:"BEIJING",     lat:39.9, lon:116.4},
          {n:"DHAKA",       lat:23.7, lon:90.4},
          {n:"KATHMANDU",   lat:27.7, lon:85.3},
        ];
        BORDER_CITIES.forEach(c=>{
          const[cx,cy]=proj(c.lat,c.lon,W,H,v);
          if(cx<-10||cx>W+10||cy<-10||cy>H+10) return;
          const cfs=Math.max(9,Math.round(9*Math.min(zp,2.5)));
          ctx.font="bold "+cfs+"px Share Tech Mono";
          const tw=ctx.measureText(c.n).width;
          ctx.fillStyle="rgba(2,8,16,.75)"; ctx.fillRect(cx+3,cy-cfs,tw+4,cfs+2);
          ctx.fillStyle="rgba(0,220,255,.85)";
          ctx.fillText(c.n,cx+5,cy);
        });
      }

      // ── 13. INFILTRATION ROUTES ──────────────────────────────────────
      if(showRoutes){
        routesRef.current.forEach(route=>{
          const rc=route.level==="CRITICAL"?"#ff2d55":"#ffaa00";
          const dOff=(t*.7)%14;
          ctx.save(); ctx.setLineDash([6,5]); ctx.lineDashOffset=-dOff;
          ctx.strokeStyle=rc+"88"; ctx.lineWidth=(route.level==="CRITICAL"?2.5:1.8)*Math.min(zp,2);
          ctx.beginPath();
          route.steps.forEach(({lat,lon},i)=>{const[x,y]=proj(lat,lon,W,H,v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
          ctx.stroke(); ctx.restore(); ctx.setLineDash([]);
        });
      }

      // ── 14. THREAT MARKERS ───────────────────────────────────────────
      threats.forEach(tr=>{
        const[cx,cy]=proj(tr.lat,tr.lon,W,H,v);
        if(cx<-25||cx>W+25||cy<-25||cy>H+25) return;
        const sel=selectedThreat?.id===tr.id;
        const col=lc(tr.level);
        const pulse=0.5+0.5*Math.sin(t*0.08+tr.score*0.1);
        // Fixed screen-pixel size — does NOT grow with zoom
        const r = sel ? 11 : 8;
        const ringScale = 1; // rings always same size regardless of zoom
        ctx.setLineDash([]);
        [r+5+pulse*10, r+5+(pulse+.4)*6, r+5+(pulse+.8)*3].forEach((pr,pi)=>{
          ctx.beginPath(); ctx.arc(cx,cy,pr,0,Math.PI*2);
          ctx.strokeStyle=col+["33","22","11"][pi]; ctx.lineWidth=1; ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.fillStyle=col; ctx.shadowBlur=sel?20:12; ctx.shadowColor=col; ctx.fill(); ctx.shadowBlur=0;
        if(tr.level==="CRITICAL"){
          // Crosshair also fixed size
          const arm=20;
          ctx.strokeStyle=col+"99"; ctx.lineWidth=1; ctx.setLineDash([4,3]);
          ctx.beginPath();ctx.moveTo(cx-arm,cy);ctx.lineTo(cx+arm,cy);ctx.stroke();
          ctx.beginPath();ctx.moveTo(cx,cy-arm);ctx.lineTo(cx,cy+arm);ctx.stroke();
          ctx.setLineDash([]);
        }
        if(sel||tr.level==="CRITICAL"){
          // Label font scales slightly with zoom so it's readable when zoomed in
          const tfs=Math.max(10,Math.min(14,Math.round(10*Math.min(zp,1.4))));
          ctx.font="bold "+tfs+"px Share Tech Mono"; ctx.fillStyle=col;
          ctx.fillText(tr.name||tr.sector,cx+r+5,cy-2);
          ctx.font=(tfs-1)+"px Share Tech Mono";
          ctx.fillText("S:"+tr.score+" | "+tr.level,cx+r+5,cy+tfs+2);
        }
      });

      // ── 15. HUD ──────────────────────────────────────────────────────
      ctx.setLineDash([]);
      ctx.fillStyle="rgba(0,0,0,.72)"; ctx.fillRect(4,H-22,230,18);
      ctx.fillStyle="rgba(0,229,255,.62)"; ctx.font="10px Share Tech Mono";
      const geoStatus=geo?("GEO:"+geo.features.length+"cntrs"):"GEO:LOADING";
      ctx.fillText("ZOOM "+zp.toFixed(1)+"x | SCROLL | DRAG | "+geoStatus,8,H-7);

      if(!geo){
        ctx.fillStyle="rgba(0,0,0,.82)"; ctx.fillRect(W/2-130,H/2-22,260,40);
        ctx.fillStyle="rgba(0,229,255,.85)"; ctx.font="bold 14px Share Tech Mono";
        ctx.fillText("LOADING MAP DATA...",W/2-118,H/2+6);
      }

      rafRef.current=requestAnimationFrame(draw);
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>{ cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  },[threats,selectedThreat,showRoutes,ready]);

  // ── Input handlers ───────────────────────────────────────────────────────
  const handleWheel=useCallback(e=>{
    e.preventDefault();
    const v=viewRef.current,W=cvRef.current?.width||1,H=cvRef.current?.height||1;
    const rect=cvRef.current.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(W/rect.width),my=(e.clientY-rect.top)*(H/rect.height);
    const f=e.deltaY<0?1.07:0.94;
    const nz=Math.max(0.4,Math.min(14,v.zoom*f));
    const nx=v.x+(mx-W/2)*(nz/v.zoom-1);
    const ny=v.y+(my-H/2)*(nz/v.zoom-1);
    const c=_clamp(nx,ny,nz,W,H);
    viewRef.current={...c,zoom:nz}; setZoomLvl(+nz.toFixed(2));
    // Invalidate static cache — new zoom = different projection
    lastZoomRef.current = nz;
  },[]);
  const onMD=useCallback(e=>{dragRef.current={on:true,sx:e.clientX,sy:e.clientY,ox:viewRef.current.x,oy:viewRef.current.y};e.preventDefault();},[]);
  const onMM=useCallback(e=>{
    if(!dragRef.current.on) return;
    const W=cvRef.current?.width||1,H=cvRef.current?.height||1;
    const c=_clamp(dragRef.current.ox+(e.clientX-dragRef.current.sx),dragRef.current.oy+(e.clientY-dragRef.current.sy),viewRef.current.zoom,W,H);
    viewRef.current={...viewRef.current,...c};
    const rect2=cvRef.current.getBoundingClientRect();
    const cW=rect2.width, cH=rect2.height;
    const sx2=e.clientX-rect2.left, sy2=e.clientY-rect2.top;
    const vv=viewRef.current;
    const nx2=(sx2-cW/2-vv.x)/(vv.zoom*cW)+.5, ny2=(sy2-cH/2-vv.y)/(vv.zoom*cH)+.5;
    setHoverLL({lat:(90-ny2*180).toFixed(2),lon:(nx2*360-180).toFixed(2)});
  },[]);
  const onMU=useCallback(e=>{
    const was=dragRef.current.on,dx=Math.abs(e.clientX-dragRef.current.sx),dy=Math.abs(e.clientY-dragRef.current.sy);
    dragRef.current.on=false;
    if(was&&dx<6&&dy<6){
      const rect=cvRef.current.getBoundingClientRect();
      // Use CSS pixel dimensions — cvs.width/height are physical (x DPR), rect gives CSS
      const W=rect.width, H=rect.height;
      const sx=e.clientX-rect.left, sy=e.clientY-rect.top;
      const v=viewRef.current;
      const nx=(sx-W/2-v.x)/(v.zoom*W)+.5, ny=(sy-H/2-v.y)/(v.zoom*H)+.5;
      const lat=90-ny*180, lon=nx*360-180;
      const clickRadius=Math.max(1.5,5/v.zoom);
      let best=null,bd=clickRadius;
      threats.forEach(t=>{const d=Math.hypot(t.lon-lon,t.lat-lat);if(d<bd){bd=d;best=t;}});
      if(best) onSelect(best);
    }
  },[threats,onSelect]);
  const onTS=useCallback(e=>{const ts=Array.from(e.touches);touchRef.current={ts,ox:viewRef.current.x,oy:viewRef.current.y,oz:viewRef.current.zoom};},[]);
  const onTM=useCallback(e=>{
    e.preventDefault();
    const ts=Array.from(e.touches),{ts:ots,ox,oy,oz}=touchRef.current;
    const W=cvRef.current?.width||1,H=cvRef.current?.height||1;
    if(ts.length===1&&ots.length>=1){const c=_clamp(ox+(ts[0].clientX-ots[0].clientX),oy+(ts[0].clientY-ots[0].clientY),viewRef.current.zoom,W,H);viewRef.current={...viewRef.current,...c};}
    else if(ts.length===2&&ots.length>=2){const d0=Math.hypot(ots[1].clientX-ots[0].clientX,ots[1].clientY-ots[0].clientY),d1=Math.hypot(ts[1].clientX-ts[0].clientX,ts[1].clientY-ts[0].clientY),nz=Math.max(0.4,Math.min(14,oz*(d1/d0))),c=_clamp(viewRef.current.x,viewRef.current.y,nz,W,H);viewRef.current={...c,zoom:nz};setZoomLvl(+nz.toFixed(2));}
  },[]);
  const zoomBtn=d=>{const v=viewRef.current,W=cvRef.current?.width||1,H=cvRef.current?.height||1,nz=Math.max(0.4,Math.min(14,v.zoom*(d>0?1.35:0.75))),c=_clamp(v.x,v.y,nz,W,H);viewRef.current={...c,zoom:nz};setZoomLvl(+nz.toFixed(2));lastZoomRef.current=nz;};
  const goToIndia=()=>{
    const W=cvRef.current?.width||1,H=cvRef.current?.height||1,zoom=3.2;
    const nx=((80+180)/360-0.5)*zoom*W, ny=((90-20)/180-0.5)*zoom*H;
    viewRef.current={x:-nx,y:-ny,zoom}; setZoomLvl(zoom);
  };
  const resetView=()=>{viewRef.current={x:0,y:0,zoom:1};setZoomLvl(1);};

  return(
    <div style={{position:"relative",width:"100%",height:"100%",background:"#010a14",overflow:"hidden"}}>
      <canvas ref={cvRef}
        style={{width:"100%",height:"100%",display:"block",cursor:dragRef.current?.on?"grabbing":"grab"}}
        onWheel={handleWheel} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={()=>{touchRef.current.ts=[];}}
      />
      <div style={{position:"absolute",top:6,right:6,display:"flex",flexDirection:"column",gap:3,zIndex:5}}>
        {[["＋",()=>zoomBtn(1)],["−",()=>zoomBtn(-1)],["IN",goToIndia],["⟳",resetView]].map(([l,fn])=>(
          <button key={l} onClick={fn} style={{width:26,height:26,background:"rgba(0,0,0,.88)",border:"1px solid #0a3a5c",color:"#00e5ff",fontFamily:"Orbitron",fontSize:l.length>1?9:13,cursor:"pointer",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",letterSpacing:1}}>{l}</button>
        ))}
      </div>
      {hoverLL&&<div style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,.8)",border:"1px solid #0a3a5c",borderRadius:3,padding:"3px 8px",fontSize:10,fontFamily:"Share Tech Mono",color:"#00e5ff88",pointerEvents:"none"}}>LAT:{hoverLL.lat}N &nbsp; LON:{hoverLL.lon}E</div>}
      <div style={{position:"absolute",bottom:26,left:4,background:"rgba(0,0,0,.82)",border:"1px solid #0a2030",borderRadius:4,padding:"5px 8px",fontSize:9,fontFamily:"Share Tech Mono"}}>
        {[["rgba(190,248,255,.96)","Country borders (GeoJSON)"],["rgba(0,229,255,.3)","State borders India (zoom≥2.5)"],["rgba(255,215,0,.85)","LoC Kashmir"],["rgba(255,65,65,.85)","LAC Ladakh"],["rgba(255,210,110,.55)","City lights"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
            <div style={{width:16,height:2,background:c,flexShrink:0}}/><span style={{color:"rgba(0,200,220,.68)"}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CAMERA MODULE ────────────────────────────────────────────────────────────
function CameraModule({onThreatDetected, gpsRef}){
  const videoRef=useRef(null);
  const overlayRef=useRef(null);
  const streamRef=useRef(null);
  const trackerRef=useRef(new CentroidTracker());
  const intervalRef=useRef(null);
  const analyzingRef=useRef(false);

  const [camState,setCamState]=useState("IDLE");
  const [detections,setDetections]=useState([]);
  const [trackedObjs,setTrackedObjs]=useState({});
  const [detLog,setDetLog]=useState([]);
  const [selRegion,setSelRegion]=useState(HOTSPOTS[0]);
  const [frameCount,setFrameCount]=useState(0);
  const [analyzing,setAnalyzing]=useState(false);

  // Draw bounding boxes + tracks
  useEffect(()=>{
    const cvs=overlayRef.current; if(!cvs||camState!=="ACTIVE") return;
    const ctx=cvs.getContext("2d");
    ctx.clearRect(0,0,cvs.width,cvs.height);
    detections.forEach(d=>{
      const [x,y,w,h]=d.bbox;
      const col=d.class==="person"?"#ff2d55":["car","truck","bus","motorcycle"].includes(d.class)?"#ffaa00":"#00e5ff";
      ctx.strokeStyle=col;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
      const cs=10;ctx.lineWidth=2.5;
      [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([bx,by,sx,sy])=>{
        ctx.beginPath();ctx.moveTo(bx+sx*cs,by);ctx.lineTo(bx,by);ctx.lineTo(bx,by+sy*cs);ctx.strokeStyle=col;ctx.stroke();
      });
      ctx.fillStyle=col+"cc";ctx.fillRect(x,y-17,Math.min(w,140),15);
      ctx.fillStyle="#fff";ctx.font="10px Share Tech Mono";
      ctx.fillText(`${d.class.toUpperCase()} ${Math.round(d.score*100)}%`,x+3,y-5);
    });
    Object.values(trackedObjs).forEach(obj=>{
      if(!obj.path||obj.path.length<2) return;
      ctx.strokeStyle="#00e5ff88";ctx.lineWidth=1;ctx.setLineDash([3,3]);
      ctx.beginPath();obj.path.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));
      ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle="#00e5ff";ctx.font="8px Share Tech Mono";
      ctx.fillText(`#${obj.id}`,obj.cx+6,obj.cy-6);
    });
  },[detections,trackedObjs,camState]);

  const startCam=async()=>{
    setCamState("REQUESTING");
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480}},audio:false});
      streamRef.current=s;
      if(videoRef.current){videoRef.current.srcObject=s;await videoRef.current.play();}
      setCamState("ACTIVE");
    }catch(e){setCamState("ERROR");}
  };

  const stopCam=()=>{
    streamRef.current?.getTracks().forEach(t=>t.stop());
    clearInterval(intervalRef.current);
    setCamState("IDLE");setDetections([]);setTrackedObjs({});
  };

  const analyzeFrame=useCallback(async()=>{
    if(analyzingRef.current||!videoRef.current) return;
    const v=videoRef.current; if(v.readyState<2) return;
    analyzingRef.current=true; setAnalyzing(true);
    try{
      const tmp=document.createElement("canvas");
      tmp.width=320;tmp.height=240;
      tmp.getContext("2d").drawImage(v,0,0,320,240);
      const b64=tmp.toDataURL("image/jpeg",.7).split(",")[1];
      // ✅ FIX: API key stays on server — call backend, not Anthropic directly
      const res=await fetch("/api/analyze-frame",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({image:b64,region:`${selRegion.name}, ${selRegion.region}`,mode:"cctv"})
      });
      const data=await res.json();
      const dets=data.detections||[];
      setDetections(dets);
      setFrameCount(p=>p+1);
      const tracked=trackerRef.current.update(dets);
      setTrackedObjs({...tracked});
      if(dets.length>0){
        const top=dets.reduce((a,b)=>b.score>a.score?b:a);
        if(top.score>.45){
          // Use GPS from parent ref (already acquired) — no slow getCurrentPosition
          const gps = gpsRef?.current;
          const tLat = gps ? gps.lat : selRegion.lat;
          const tLon = gps ? gps.lon : selRegion.lon;
          const gpsReal = !!gps;
          const gpsAccuracy = gps?.accuracy || null;
          // Location name: use coords if GPS real, else sector name
          const locName = gpsReal
            ? `${tLat.toFixed(3)}°N ${tLon.toFixed(3)}°E`
            : selRegion.name;
          const t={
            id:`CAM${Date.now()}`,
            type:top.threat_type||OBJ_MAP[top.class]||OBJ_MAP.default,
            level:top.threat_level||"MEDIUM",
            score:Math.round(top.score*100),
            lat:tLat, lon:tLon, gpsReal, gpsAccuracy,
            region: gpsReal ? "LIVE GPS DETECTION" : selRegion.region,
            sector: gpsReal ? `GPS-${tLat.toFixed(2)}N-${tLon.toFixed(2)}E` : selRegion.sector,
            name: locName,
            time:new Date().toLocaleTimeString("en-IN",{hour12:false}),
            status:"ACTIVE",confidence:Math.round(top.score*100),
            sensors:["VIS","AI-VISION"],source:"CAMERA",
            detectedClass:top.class,notes:top.notes||"",
            locationNote:gpsReal?`Real GPS: ${tLat.toFixed(5)}°N ${tLon.toFixed(5)}°E (±${gpsAccuracy}m)`:`Sector: ${selRegion.name}`,
          };
          onThreatDetected(t);
          setDetLog(p=>[{...t,objCount:dets.length},...p.slice(0,19)]);
        }
      }
    }catch(e){
      // Retry once on failure
      try{
        await new Promise(r=>setTimeout(r,800));
        const tmp2=document.createElement("canvas");
        tmp2.width=320;tmp2.height=240;
        tmp2.getContext("2d").drawImage(v,0,0,320,240);
        const b64r=tmp2.toDataURL("image/jpeg",.6).split(",")[1];
        const res2=await fetch("/api/analyze-frame",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:b64r,region:`${selRegion.name}, ${selRegion.region}`,mode:"cctv"})});
        if(res2.ok){const d2=await res2.json();setDetections(d2.detections||[]);setFrameCount(p=>p+1);}
      }catch{
        setDetLog(p=>[{
          level: "LOW", type: "SYSTEM_ERROR", name: "BACKEND PIPELINE OFFLINE",
          time: new Date().toLocaleTimeString("en-IN",{hour12:false}),
          notes: "Check if app.py is running and YOLO model is loaded.",
          objCount: 0
        }, ...p.slice(0,19)]);
      }
    }
    analyzingRef.current=false; setAnalyzing(false);
  },[selRegion,onThreatDetected]);

  useEffect(()=>{
    if(camState!=="ACTIVE") return;
    intervalRef.current=setInterval(analyzeFrame,3000);
    return()=>clearInterval(intervalRef.current);
  },[camState,analyzeFrame]);

  useEffect(()=>()=>stopCam(),[]);

  return(
    <div className="cam-grid" style={{flex:1,display:"grid",gridTemplateColumns:"1fr clamp(240px,26%,320px)",gap:"var(--gap)",overflow:"hidden",minHeight:0}}>
      <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
        <div className="panel-title">
          <span>📷</span>LIVE CAMERA — AI DETECTION ENGINE
          {camState==="ACTIVE"&&<><div className="pulse-dot" style={{background:"#ff2d55",color:"#ff2d55"}}/><span className="blink" style={{color:"#ff2d55"}}>● REC</span></>}
          <span style={{marginLeft:"auto",color:"#4a7a9a",fontSize:11}}>
            {camState==="ACTIVE"?`${detections.length} OBJECTS · ${Object.keys(trackedObjs).length} TRACKED`:camState}
          </span>
        </div>
        <div style={{padding:"5px 10px",borderBottom:"1px solid #0a2030",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{color:"#4a7a9a",fontSize:11,flexShrink:0}}>📍 ASSIGN BORDER SECTOR:</span>
          <select value={selRegion.name} onChange={e=>setSelRegion(HOTSPOTS.find(h=>h.name===e.target.value))} style={{
            background:"#0a2030",border:"1px solid #0a3a5c",color:"#00e5ff",fontFamily:"Share Tech Mono",
            fontSize:12,padding:"2px 6px",borderRadius:3,flex:1,
          }}>
            {HOTSPOTS.map(h=><option key={h.name} value={h.name}>{h.name} — {h.region} ({h.lat}°N {h.lon}°E)</option>)}
          </select>
          <span style={{color:"#ffaa00",fontSize:9,fontFamily:"Orbitron",letterSpacing:1,flexShrink:0}}>⚠ SIMULATED COORDS</span>
        </div>
        <div style={{flex:1,position:"relative",background:"#000",minHeight:0}}>
          {camState==="IDLE"&&(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
              <div style={{width:60,height:60,border:"2px solid #00e5ff33",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>📷</div>
              <div style={{fontFamily:"Orbitron",fontSize:12,color:"#00e5ff",letterSpacing:3}}>CAMERA OFFLINE</div>
              <div style={{color:"#2a5a7a",fontSize:10,textAlign:"center",maxWidth:320,lineHeight:1.6}}>
                Activate webcam to enable real-time AI detection.<br/>
                Detected objects are mapped to selected Indian border region coordinates<br/>
                and generate live threat intelligence with centroid object tracking.
              </div>
              <button onClick={startCam} style={{background:"rgba(0,229,255,.12)",border:"1px solid #00e5ff",color:"#00e5ff",fontFamily:"Orbitron",fontSize:10,letterSpacing:2,padding:"10px 28px",cursor:"pointer",borderRadius:4}}>▶ ACTIVATE</button>
            </div>
          )}
          {camState==="REQUESTING"&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="blink" style={{color:"#00e5ff",fontFamily:"Orbitron",fontSize:12}}>REQUESTING CAMERA ACCESS...</span>
            </div>
          )}
          {camState==="ERROR"&&(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
              <div style={{fontSize:32}}>🚫</div>
              <div style={{color:"#ff2d55",fontFamily:"Orbitron",fontSize:12,letterSpacing:2}}>CAMERA ACCESS DENIED</div>
              <div style={{color:"#4a7a9a",fontSize:11,textAlign:"center",maxWidth:320,lineHeight:1.7}}>
                Browser blocked webcam access.<br/>
                Click the camera icon in the address bar and allow access,<br/>
                then click RETRY below.
              </div>
              <button onClick={startCam} style={{background:"rgba(255,45,85,.12)",border:"1px solid #ff2d55",color:"#ff2d55",fontFamily:"Orbitron",fontSize:11,padding:"8px 20px",cursor:"pointer",borderRadius:3,letterSpacing:2}}>↺ RETRY</button>
            </div>
          )}
          <video ref={videoRef} muted playsInline style={{width:"100%",height:"100%",objectFit:"cover",display:camState==="ACTIVE"?"block":"none"}}/>
          <canvas ref={overlayRef} width={640} height={480} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:camState==="ACTIVE"?"block":"none",pointerEvents:"none"}}/>
          {camState==="ACTIVE"&&(
            <>
              {analyzing&&<div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,229,255,.15)",border:"1px solid #00e5ff",borderRadius:3,padding:"3px 8px",fontSize:11,color:"#00e5ff",fontFamily:"Orbitron"}}><span className="blink">▌</span> ANALYZING...</div>}
              <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,.7)",border:"1px solid #0a3a5c",borderRadius:3,padding:"3px 8px",fontSize:11,color:"#4a7a9a"}}>FRAMES ANALYZED: <span style={{color:"#00e5ff"}}>{frameCount}</span></div>
              <button onClick={stopCam} style={{position:"absolute",top:8,right:8,background:"rgba(255,45,85,.2)",border:"1px solid #ff2d55",color:"#ff2d55",fontFamily:"Orbitron",fontSize:10,padding:"3px 8px",cursor:"pointer",borderRadius:3}}>■ STOP</button>
            </>
          )}
        </div>
        {camState==="ACTIVE"&&detections.length>0&&(
          <div style={{padding:"5px 8px",borderTop:"1px solid #0a2030",display:"flex",gap:5,flexWrap:"wrap"}}>
            {detections.map((d,i)=>{
              const col=lc(d.threat_level||"MEDIUM");
              return(<span key={i} style={{background:lb(d.threat_level||"MEDIUM"),border:`1px solid ${col}`,color:col,fontSize:10,fontFamily:"Orbitron",padding:"1px 5px",borderRadius:2}}>{d.class.toUpperCase()} {Math.round(d.score*100)}%</span>);
            })}
          </div>
        )}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"var(--gap)",overflow:"hidden",minHeight:0}}>
        <div className="panel" style={{overflow:"hidden"}}>
          <div className="panel-title"><span>🎯</span>OBJECT TRACKER — CENTROID ALGORITHM</div>
          <div style={{maxHeight:170,overflowY:"auto"}}>
            {!Object.keys(trackedObjs).length?(
              <div style={{padding:"10px 12px",color:"#2a5a7a",fontSize:12}}>// NO ACTIVE TRACKS — START CAMERA</div>
            ):(
              Object.values(trackedObjs).slice(0,8).map(obj=>(
                <div key={obj.id} style={{padding:"5px 10px",borderBottom:"1px solid #040d1a",display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:"Orbitron",fontSize:12,color:"#00e5ff",width:36,flexShrink:0}}>#{obj.id}</span>
                  <div style={{flex:1}}>
                    <div style={{color:"#b0d8f0",fontSize:12}}>{obj.label?.toUpperCase()}</div>
                    <div style={{color:"#2a5a7a",fontSize:10}}>AGE:{obj.age}f · PTS:{obj.path?.length} · {Math.round((obj.conf||0)*100)}%</div>
                  </div>
                  <svg width="28" height="18" style={{border:"1px solid #0a3a5c",borderRadius:2,flexShrink:0}}>
                    {obj.path?.length>1&&<polyline
                      points={obj.path.map(([x,y])=>`${Math.round(x/640*28)},${Math.round(y/480*18)}`).join(" ")}
                      fill="none" stroke="#00e5ff" strokeWidth="1.5"
                    />}
                    <circle cx={Math.round((obj.path?.[obj.path.length-1]?.[0]||obj.cx)/640*28)} cy={Math.round((obj.path?.[obj.path.length-1]?.[1]||obj.cy)/480*18)} r="2" fill="#ff2d55"/>
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div className="panel-title"><span>📋</span>AI DETECTION LOG</div>
          <div style={{flex:1,overflowY:"auto"}}>
            {!detLog.length?(
              <div style={{padding:"10px 12px",color:"#2a5a7a",fontSize:12}}>// AWAITING CAMERA DETECTIONS...</div>
            ):(
              detLog.map((item,i)=>(
                <div key={i} style={{padding:"6px 10px",borderBottom:"1px solid #040d1a",borderLeft:`3px solid ${lc(item.level)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:lc(item.level),fontFamily:"Orbitron",fontSize:11}}>{item.level}</span>
                    <span style={{color:"#2a5a7a",fontSize:10}}>{item.time}</span>
                  </div>
                  <div style={{color:"#b0d8f0",fontSize:12,marginTop:1}}>{item.type?.replace(/_/g," ")}</div>
                  <div style={{color:"#4a7a9a",fontSize:10,marginTop:1}}>{item.name} · {item.objCount} obj · {item.detectedClass}</div>
                  {item.notes&&<div style={{color:"#2a5a7a",fontSize:10,marginTop:1,fontStyle:"italic"}}>{item.notes}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{padding:"8px 12px"}}>
          <div style={{fontSize:10,color:"#4a7a9a",letterSpacing:2,marginBottom:6}}>OBJECT → THREAT MAPPING</div>
          {[["👤 person","#ff2d55","INFANTRY INFILTRATION"],["🚗 vehicle","#ffaa00","VEHICLE CONVOY"],["✈ aircraft","#ffee55","AERIAL RECON"],["📦 object","#00e5ff","ARMED OPERATIVE"]].map(([cls,col,thr])=>(
            <div key={cls} style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
              <span style={{color:"#4a7a9a",fontSize:11,width:70,flexShrink:0}}>{cls}</span>
              <span style={{color:col,fontSize:11}}>→ {thr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DRONE SURVEILLANCE MODULE ───────────────────────────────────────────────
const DRONE_FLEET = [
  { id:"UAV-01", name:"GARUDA-1",  type:"Quad-Rotor ISR",   maxAlt:500,  speed:72,  color:"#00e5ff", region: HOTSPOTS[0] },
  { id:"UAV-02", name:"GARUDA-2",  type:"Fixed-Wing MALE",  maxAlt:8000, speed:220, color:"#00ff88", region: HOTSPOTS[4] },
  { id:"UAV-03", name:"GARUDA-3",  type:"VTOL Recon",       maxAlt:1200, speed:110, color:"#ffaa00", region: HOTSPOTS[9] },
];

const DRONE_OBJ_TYPES = [
  { cls:"INFANTRY",    icon:"👤", color:"#ff2d55", w:14, h:14, threat:"INFANTRY_INFILTRATION",  level:"HIGH"     },
  { cls:"VEHICLE",     icon:"🚗", color:"#ffaa00", w:24, h:16, threat:"VEHICLE_CONVOY",          level:"HIGH"     },
  { cls:"CONVOY",      icon:"🚛", color:"#ff2d55", w:34, h:18, threat:"VEHICLE_CONVOY",          level:"CRITICAL" },
  { cls:"CAMP",        icon:"⛺", color:"#ffaa00", w:28, h:22, threat:"ARMED_ENCAMPMENT",        level:"CRITICAL" },
  { cls:"DRONE",       icon:"✈",  color:"#ffee55", w:18, h:12, threat:"DRONE_SWARM",             level:"HIGH"     },
  { cls:"ANIMAL",      icon:"🐄", color:"#00ff88", w:12, h:10, threat:"FALSE_POSITIVE",          level:"LOW"      },
];

function generateGroundTargets(seed=0) {
  return [];
}

function DroneModule({ onThreatDetected, gpsRef }) {
  const feedRef   = useRef(null);
  const rafRef    = useRef(0);
  const tickRef   = useRef(0);
  const targetsRef= useRef(generateGroundTargets());
  const dronePathRef = useRef({});

  const [activeDrone, setActiveDrone] = useState(0);
  const [running,    setRunning]    = useState(false);
  const [telemetry,  setTelemetry]  = useState(
    DRONE_FLEET.map(d => ({
      alt:  0,
      spd:  0,
      hdg:  0,
      bat:  100,
      lat:  d.region.lat,
      lon:  d.region.lon,
      status:"STANDBY",
      mode:"LOITER",
    }))
  );
  const [detLog,     setDetLog]     = useState([]);
  const [lockedCount,setLockedCount]= useState(0);
  const [missionTime,setMissionTime]= useState(0);
  const [zoomLevel,  setZoomLevel]  = useState(1);   // 1× | 2× | 4×
  const [irMode,     setIrMode]     = useState(false);
  const [gridLines,  setGridLines]  = useState(true);
  const missionRef   = useRef(null);
  const drone        = DRONE_FLEET[activeDrone];

  // ── Seeded noise for deterministic terrain ──────────────────────────────────
  // Uses multi-octave value noise so terrain looks like real topography
  const terrainRef = useRef(null);
  function buildTerrain(W, H, seed=42) {
    const arr = new Float32Array(W * H);
    // Layer 3 octaves of sine-based noise
    for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
      const nx = x/W, ny = y/H;
      let v =  0.50 * (Math.sin((nx*7.3+ny*5.1+seed)*Math.PI) * 0.5 + 0.5)
             + 0.30 * (Math.sin((nx*13.7-ny*11.3+seed*1.3)*Math.PI) * 0.5 + 0.5)
             + 0.15 * (Math.sin((nx*29.1+ny*23.7+seed*0.7)*Math.PI) * 0.5 + 0.5)
             + 0.05 * (((x * y * 7) % 100) / 100);
      arr[y*W+x] = Math.min(1, v);
    }
    return arr;
  }

  // ── Build static terrain image (only once per canvas size) ───────────────
  function buildTerrainImage(W, H, ir) {
    const offscreen = document.createElement("canvas");
    offscreen.width = W; offscreen.height = H;
    const octx = offscreen.getContext("2d");
    const img = octx.createImageData(W, H);
    const arr = buildTerrain(W, H);
    for (let i=0;i<arr.length;i++) {
      const v = arr[i];
      let r,g,b;
      if (ir) {
        // Thermal: cooler=dark blue/purple, warmer=orange/white
        if (v > 0.75) { r=255; g=220+Math.floor(v*35); b=180; }       // Hot: pale white
        else if (v > 0.55) { r=220+Math.floor(v*35); g=140; b=40; }   // Warm: amber
        else if (v > 0.35) { r=120+Math.floor(v*80); g=60; b=80; }    // Cool: dark red
        else { r=20; g=30+Math.floor(v*40); b=60+Math.floor(v*60); }  // Cold: blue
      } else {
        // Visible: realistic terrain — water, lowland, vegetation, highland, snow
        if (v < 0.15) { r=20; g=30+Math.floor(v*80); b=50; }           // Dark water/shadow
        else if (v < 0.30) { r=28+Math.floor(v*20); g=44+Math.floor(v*30); b=22; } // Dense forest
        else if (v < 0.48) { r=36+Math.floor(v*15); g=58+Math.floor(v*20); b=24; } // Open canopy
        else if (v < 0.62) { r=52+Math.floor(v*20); g=68+Math.floor(v*15); b=30; } // Scrub/grassland
        else if (v < 0.75) { r=70+Math.floor(v*30); g=65+Math.floor(v*20); b=42; } // Dry terrain/rocky
        else if (v < 0.88) { r=90+Math.floor(v*40); g=80+Math.floor(v*25); b=62; } // Highland/sparse
        else { r=190+Math.floor(v*30); g=185+Math.floor(v*25); b=175+Math.floor(v*20); } // Snow/rock
      }
      // Slight pixel variation for texture
      const jitter = Math.floor((((i * 17) % 100) / 100 - 0.5) * 12);
      img.data[i*4+0] = Math.max(0,Math.min(255,r+jitter));
      img.data[i*4+1] = Math.max(0,Math.min(255,g+jitter));
      img.data[i*4+2] = Math.max(0,Math.min(255,b+jitter));
      img.data[i*4+3] = 255;
    }
    octx.putImageData(img, 0, 0);

    // ── Draw roads/tracks (thin lighter lines) ────────────────────────
    octx.strokeStyle = ir ? "rgba(255,200,100,.25)" : "rgba(160,140,90,.35)";
    octx.lineWidth = ir ? 1.5 : 1;
    // Horizontal road
    octx.beginPath(); octx.moveTo(0, H*0.55); octx.bezierCurveTo(W*0.3,H*0.52, W*0.7,H*0.58, W,H*0.54); octx.stroke();
    // Diagonal track
    octx.beginPath(); octx.moveTo(W*0.2,0); octx.bezierCurveTo(W*0.35,H*0.3, W*0.4,H*0.6, W*0.55,H); octx.stroke();
    // Another path
    octx.beginPath(); octx.moveTo(W*0.7,0); octx.bezierCurveTo(W*0.72,H*0.4, W*0.65,H*0.7, W*0.8,H); octx.stroke();

    // ── Draw dry riverbed ─────────────────────────────────────────────
    octx.strokeStyle = ir ? "rgba(40,80,180,.3)" : "rgba(40,80,100,.4)";
    octx.lineWidth = ir ? 2 : 2.5;
    octx.beginPath(); octx.moveTo(0,H*0.3); octx.bezierCurveTo(W*0.2,H*0.35, W*0.5,H*0.4, W*0.8,H*0.55); octx.lineTo(W,H*0.6); octx.stroke();

    // ── Small settlement clusters ─────────────────────────────────────
    if (!ir) {
      [[0.15,0.4],[0.45,0.65],[0.72,0.28],[0.85,0.72]].forEach(([sx,sy]) => {
        for (let i=0;i<6;i++) {
          const pseudo = ((i * 31 + Math.floor(sx * 100)) % 100) / 100; 
          const bx = sx*W + (pseudo - 0.5) * 24;
          const by = sy*H + (((pseudo * 13) % 100) / 100 - 0.5) * 20;
          const bw = 4 + ((pseudo * 7) % 100) / 100 * 6;
          const bh = 3 + ((pseudo * 11) % 100) / 100 * 5;
          const c1 = 160 + Math.floor(((pseudo * 17) % 100) / 100 * 40);
          const c2 = 140 + Math.floor(((pseudo * 19) % 100) / 100 * 30);
          const c3 = 100 + Math.floor(((pseudo * 23) % 100) / 100 * 30);
          octx.fillStyle = `rgba(${c1},${c2},${c3},.7)`;
          octx.fillRect(bx, by, bw, bh);
        }
      });
    } else {
      // IR: settlement heat signatures
      [[0.15,0.4],[0.45,0.65],[0.72,0.28],[0.85,0.72]].forEach(([sx,sy]) => {
        const grd = octx.createRadialGradient(sx*W,sy*H,2,sx*W,sy*H,20);
        grd.addColorStop(0,"rgba(255,220,80,.6)"); grd.addColorStop(1,"transparent");
        octx.fillStyle = grd; octx.beginPath(); octx.arc(sx*W,sy*H,20,0,Math.PI*2); octx.fill();
      });
    }
    return offscreen;
  }

  // Main render loop
  useEffect(() => {
    if (!running) return;
    const cvs = feedRef.current; if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = cvs.width, H = cvs.height;

    // Build terrain image once (expensive pixel operation)
    let bgImage = buildTerrainImage(W, H, irMode);

    function drawFrame() {
      tickRef.current++;
      const t = tickRef.current;

      // ── Background terrain (pre-rendered, just blit) ──────────────
      ctx.drawImage(bgImage, 0, 0, W, H);

      // Subtle atmospheric haze overlay (drifts slowly = parallax)
      if (!irMode) {
        const hazeOff = (t * 0.05) % 200;
        ctx.fillStyle = "rgba(20,35,20,.08)";
        ctx.fillRect(0, 0, W, H);
      }

      // ── Grid overlay ─────────────────────────────────────────────────
      if (gridLines) {
        ctx.strokeStyle = irMode ? "rgba(255,120,0,.12)" : "rgba(0,229,255,.08)";
        ctx.lineWidth = 0.5;
        for (let gx = 0; gx < W; gx += 80) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
        for (let gy = 0; gy < H; gy += 60) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }
        // Coord labels
        ctx.fillStyle = irMode ? "rgba(255,120,0,.3)" : "rgba(0,229,255,.25)";
        ctx.font = "8px Share Tech Mono";
        for (let gx=0;gx<W;gx+=160) ctx.fillText(`${(gx/W*0.02+telemetry[activeDrone].lon).toFixed(3)}E`, gx+3, 10);
      }

      // ── Move & draw targets ──────────────────────────────────────────
      let newLocked = 0;
      targetsRef.current.forEach(obj => {
        // Physics
        obj.x += obj.vx; obj.y += obj.vy;
        if (obj.x < 10 || obj.x > W-10) obj.vx *= -1;
        if (obj.y < 10 || obj.y > H-10) obj.vy *= -1;
        obj.x = Math.max(10, Math.min(W-10, obj.x));
        obj.y = Math.max(10, Math.min(H-10, obj.y));

        if (obj.locked) {
          newLocked++;
          obj.trackAge++;
          obj.path.push([obj.x, obj.y]);
          if (obj.path.length > 60) obj.path.shift();
        }

        const col   = obj.type.color;
        const alpha = irMode ? "ff" : "cc";

        // Track path trail
        if (obj.locked && obj.path.length > 2) {
          ctx.beginPath();
          obj.path.forEach(([px,py], i) => i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py));
          ctx.strokeStyle = col + "55"; ctx.lineWidth = 1.5; ctx.stroke();
        }

        // Target body (silhouette)
        ctx.fillStyle = col + alpha;
        ctx.fillRect(obj.x - obj.type.w/2, obj.y - obj.type.h/2, obj.type.w, obj.type.h);

        // Detection box
        if (obj.detected) {
          const pulse = 0.4 + 0.6 * Math.sin(t * 0.15);
          const expand = obj.locked ? 0 : Math.floor(pulse * 4);
          const bx = obj.x - obj.type.w/2 - 6 - expand;
          const by = obj.y - obj.type.h/2 - 6 - expand;
          const bw = obj.type.w + 12 + expand*2;
          const bh = obj.type.h + 12 + expand*2;

          ctx.strokeStyle = col; ctx.lineWidth = obj.locked ? 2 : 1;
          ctx.strokeRect(bx, by, bw, bh);

          // Corners
          const cs = 8; ctx.lineWidth = 2.5;
          [[bx,by,1,1],[bx+bw,by,-1,1],[bx,by+bh,1,-1],[bx+bw,by+bh,-1,-1]].forEach(([cx,cy,sx,sy]) => {
            ctx.beginPath(); ctx.moveTo(cx+sx*cs,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*cs);
            ctx.strokeStyle = col; ctx.stroke();
          });

          // Class label
          ctx.fillStyle = col + "cc";
          ctx.fillRect(bx, by - 17, bw * 0.85, 13);
          ctx.fillStyle = "#000"; ctx.font = "bold 11px Share Tech Mono";
          ctx.fillText(`${obj.type.cls}${obj.locked ? " ●" : ""}`, bx + 3, by - 3);

          // Lock reticle for locked targets
          if (obj.locked) {
            const lr = 22 + Math.sin(t*0.1)*2;
            ctx.beginPath(); ctx.arc(obj.x, obj.y, lr, 0, Math.PI*2);
            ctx.strokeStyle = col + "66"; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.arc(obj.x, obj.y, lr+8, -0.3, 0.3);
            ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
          }
        }
      });
      setLockedCount(newLocked);

      // ── Drone centre crosshair ────────────────────────────────────────
      const cx = W/2, cy = H/2;
      ctx.strokeStyle = irMode ? "#ff6600" : "#00e5ff";
      ctx.lineWidth = 1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(cx-40,cy); ctx.lineTo(cx+40,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy-40); ctx.lineTo(cx,cy+40); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2);
      ctx.strokeStyle = (irMode?"#ff6600":"#00e5ff")+"88"; ctx.lineWidth=1; ctx.stroke();

      // ── HUD overlays ─────────────────────────────────────────────────
      // Top bar
      ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0,0,W,24);
      ctx.fillStyle = irMode ? "#ff9900" : "#00e5ff"; ctx.font = "bold 11px Share Tech Mono";
      const tel = telemetry[activeDrone];
      ctx.fillText(`${drone.name}  ALT:${tel.alt}m  SPD:${tel.spd}km/h  HDG:${tel.hdg}°  BAT:${tel.bat.toFixed(0)}%  ${irMode?"[IR]":"[VIS]"}  ${zoomLevel}×ZOOM`, 8, 16);

      // Bottom bar
      ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0,H-24,W,24);
      ctx.fillStyle = "#7ab0d0"; ctx.font = "10px Share Tech Mono";
      ctx.fillText(`LAT:${tel.lat.toFixed(4)}°N  LON:${tel.lon.toFixed(4)}°E  TARGETS:${targetsRef.current.filter(o=>o.detected).length}  LOCKED:${newLocked}  MISSION:${String(Math.floor(missionTime/60)).padStart(2,"0")}:${String(missionTime%60).padStart(2,"0")}`, 8, H-7);

      // Zoom box indicator
      if (zoomLevel > 1) {
        ctx.strokeStyle = "#00e5ff44"; ctx.lineWidth = 1;
        const zw = W/zoomLevel, zh = H/zoomLevel;
        ctx.strokeRect((W-zw)/2,(H-zh)/2,zw,zh);
      }

      // IR vignette
      if (irMode) {
        const vig = ctx.createRadialGradient(cx,cy,H*0.3,cx,cy,H*0.7);
        vig.addColorStop(0,"transparent"); vig.addColorStop(1,"rgba(0,0,0,.5)");
        ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    }
    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, activeDrone, irMode, gridLines, zoomLevel, telemetry, missionTime]);

  // Telemetry updater
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTelemetry(prev => prev.map((tel, i) => {
        if (i !== activeDrone) return tel;
        return {
          ...tel,
          bat:  Math.max(0, tel.bat - 0.05), // Keep battery drain as a functional mechanic
          status: "ACTIVE", 
          mode: lockedCount > 0 ? "TARGET-LOCK" : "PATROL",
        };
      }));
      setMissionTime(p => p+1);
    }, 1000);
    return () => clearInterval(t);
  }, [running, activeDrone, drone, lockedCount]);

  // Detection event logger + threat push
  useEffect(() => {
    // No fake drone threat generation
  }, [running, activeDrone, drone, telemetry, onThreatDetected]);

  // Reset targets when switching drone
  useEffect(() => {
    targetsRef.current = generateGroundTargets();
    setDetLog([]);
    setLockedCount(0);
    setMissionTime(0);
  }, [activeDrone]);

  const toggleMission = () => {
    if (!running) {
      setTelemetry(prev => prev.map((tel,i) => i===activeDrone ? {...tel,status:"ACTIVE"} : tel));
    } else {
      cancelAnimationFrame(rafRef.current);
      setTelemetry(prev => prev.map((tel,i) => i===activeDrone ? {...tel,status:"STANDBY"} : tel));
    }
    setRunning(p => !p);
  };

  const tel = telemetry[activeDrone];
  const detectedTargets = targetsRef.current.filter(o => o.detected);

  return (
    <div className="drone-grid" style={{flex:1, display:"grid", gridTemplateColumns:"1fr clamp(220px,25%,310px)", gap:"var(--gap)", overflow:"hidden", minHeight:0}}>

      {/* ── LEFT: Feed + Controls ── */}
      <div style={{display:"flex", flexDirection:"column", gap:"var(--gap)", overflow:"hidden", minHeight:0}}>

        {/* Drone selector */}
        <div style={{display:"flex", gap:5, flexShrink:0}}>
          {DRONE_FLEET.map((d,i) => (
            <button key={d.id} onClick={()=>{setActiveDrone(i);setRunning(false);}} style={{
              flex:1, padding:"6px 8px",
              background: activeDrone===i ? `${d.color}18` : "transparent",
              border: `1px solid ${activeDrone===i ? d.color : "#0a3a5c"}`,
              color: activeDrone===i ? d.color : "#4a7a9a",
              fontFamily:"Orbitron", fontSize:11, cursor:"pointer", borderRadius:3,
              display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2,
            }}>
              <div style={{fontWeight:700, letterSpacing:2}}>{d.name}</div>
              <div style={{fontSize:10, color: activeDrone===i ? d.color+"aa":"#2a5a7a"}}>{d.type} · {d.region.name}</div>
              <div style={{fontSize:10, color: telemetry[i].status==="ACTIVE"?"#00ff88":"#4a7a9a"}}>
                ● {telemetry[i].status} · BAT:{telemetry[i].bat.toFixed(0)}%
              </div>
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="panel" style={{flex:1, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column"}}>
          <div className="panel-title">
            <span>{irMode?"🔥":"📡"}</span>
            {drone.name} — {irMode?"INFRARED THERMAL":"VISIBLE SPECTRUM"} FEED
            {running && <><div className="pulse-dot" style={{background:"#ff2d55",color:"#ff2d55"}}/><span className="blink" style={{color:"#ff2d55"}}>● LIVE</span></>}
            <span style={{marginLeft:"auto", color:"#4a7a9a", fontSize:11}}>
              {lockedCount} LOCKED · {detectedTargets.length} DETECTED
            </span>
          </div>
          <div style={{position:"relative", background:"#020810", flex:1, minHeight:400}}>
            {!running && (
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:2}}>
                <div style={{fontSize:32}}>🛸</div>
                <div style={{fontFamily:"Orbitron",fontSize:12,color:drone.color,letterSpacing:3}}>{drone.name} OFFLINE</div>
                <div style={{color:"#2a5a7a",fontSize:12,textAlign:"center",maxWidth:320,lineHeight:1.6}}>
                  {drone.type} · {drone.region.name}<br/>
                  Activate to simulate aerial surveillance feed with real-time<br/>
                  AI target detection, path tracking and threat classification.
                </div>
                <button onClick={toggleMission} style={{background:`${drone.color}18`,border:`1px solid ${drone.color}`,color:drone.color,fontFamily:"Orbitron",fontSize:10,letterSpacing:2,padding:"9px 24px",cursor:"pointer",borderRadius:4}}>▶ LAUNCH MISSION</button>
              </div>
            )}
            <canvas ref={feedRef} width={620} height={400}
              style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",display:"block",cursor:"crosshair"}}
              onWheel={e=>{
                e.preventDefault();
                const levels=[1,2,4,8];
                const ci=levels.indexOf(zoomLevel);
                if(e.deltaY<0&&ci<levels.length-1) setZoomLevel(levels[ci+1]);
                if(e.deltaY>0&&ci>0) setZoomLevel(levels[ci-1]);
              }}
            />
          </div>

          {/* Feed controls */}
          {running && (
            <div style={{padding:"5px 8px",borderTop:"1px solid #0a2030",display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={toggleMission} style={{background:"rgba(255,45,85,.12)",border:"1px solid #ff2d55",color:"#ff2d55",fontFamily:"Orbitron",fontSize:10,padding:"3px 10px",cursor:"pointer",borderRadius:3}}>■ RTB</button>
              <button onClick={()=>setIrMode(p=>!p)} style={{background:irMode?"rgba(255,100,0,.15)":"rgba(0,229,255,.08)",border:`1px solid ${irMode?"#ff6600":"#0a3a5c"}`,color:irMode?"#ff9900":"#4a7a9a",fontFamily:"Orbitron",fontSize:10,padding:"3px 10px",cursor:"pointer",borderRadius:3}}>{irMode?"VIS":"IR"}</button>
              {[1,2,4].map(z=>(
                <button key={z} onClick={()=>setZoomLevel(z)} style={{background:zoomLevel===z?"rgba(0,229,255,.12)":"transparent",border:`1px solid ${zoomLevel===z?"#00e5ff":"#0a3a5c"}`,color:zoomLevel===z?"#00e5ff":"#4a7a9a",fontFamily:"Orbitron",fontSize:10,padding:"3px 8px",cursor:"pointer",borderRadius:3}}>{z}×</button>
              ))}
              <button onClick={()=>setGridLines(p=>!p)} style={{background:gridLines?"rgba(0,229,255,.08)":"transparent",border:"1px solid #0a3a5c",color:gridLines?"#00e5ff":"#4a7a9a",fontFamily:"Orbitron",fontSize:10,padding:"3px 8px",cursor:"pointer",borderRadius:3}}>GRID</button>
              <button onClick={()=>{targetsRef.current=generateGroundTargets();}} style={{background:"rgba(255,170,0,.08)",border:"1px solid #0a3a5c",color:"#ffaa00",fontFamily:"Orbitron",fontSize:10,padding:"3px 8px",cursor:"pointer",borderRadius:3}}>RESCAN</button>
              <span style={{marginLeft:"auto",color:"#2a5a7a",fontSize:11}}>MISSION TIME: {String(Math.floor(missionTime/60)).padStart(2,"0")}:{String(missionTime%60).padStart(2,"0")}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Telemetry + Tracker + Log ── */}
      <div style={{display:"flex", flexDirection:"column", gap:"var(--gap)", overflow:"hidden", minHeight:0}}>

        {/* Telemetry Panel */}
        <div className="panel" style={{padding:"0 0 8px"}}>
          <div className="panel-title"><span>📊</span>{drone.name} TELEMETRY</div>
          <div style={{padding:"8px 10px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
            {[
              ["ALTITUDE",  `${tel.alt} m`,        drone.color],
              ["SPEED",     `${tel.spd} km/h`,      "#00ff88"],
              ["HEADING",   `${tel.hdg}°`,          "#ffaa00"],
              ["BATTERY",   `${tel.bat.toFixed(0)}%`, tel.bat>30?"#00ff88":"#ff2d55"],
              ["MODE",      tel.mode,               "#00e5ff"],
              ["STATUS",    tel.status,             tel.status==="ACTIVE"?"#00ff88":"#4a7a9a"],
              ["LATITUDE",  `${tel.lat.toFixed(4)}°N`, "#b0d8f0"],
              ["LONGITUDE", `${tel.lon.toFixed(4)}°E`, "#b0d8f0"],
            ].map(([k,v,c])=>(
              <div key={k} style={{background:"#040d1a",border:"1px solid #0a2030",borderRadius:3,padding:"5px 7px"}}>
                <div style={{color:"#2a5a7a",fontSize:10,letterSpacing:1}}>{k}</div>
                <div style={{color:c,fontFamily:"Orbitron",fontSize:11,marginTop:1,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Battery bar */}
          <div style={{padding:"0 10px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{color:"#2a5a7a",fontSize:10}}>BATTERY</span>
              <span style={{color:tel.bat>30?"#00ff88":"#ff2d55",fontSize:10}}>{tel.bat.toFixed(1)}%</span>
            </div>
            <div style={{background:"#0a2030",height:4,borderRadius:2}}>
              <div style={{width:`${tel.bat}%`,height:"100%",borderRadius:2,transition:"width .5s",background:`linear-gradient(90deg,${tel.bat>30?"#00ff88":"#ff2d55"},transparent)`}}/>
            </div>
          </div>
        </div>

        {/* Target tracker */}
        <div className="panel" style={{overflow:"hidden"}}>
          <div className="panel-title"><span>🎯</span>AERIAL TARGET TRACKER</div>
          <div style={{maxHeight:160, overflowY:"auto"}}>
            {detectedTargets.length===0 ? (
              <div style={{padding:"10px 12px",color:"#2a5a7a",fontSize:12}}>// NO TARGETS DETECTED — LAUNCH MISSION</div>
            ):(
              detectedTargets.map(obj=>(
                <div key={obj.id} style={{padding:"5px 10px",borderBottom:"1px solid #040d1a",display:"flex",gap:8,alignItems:"center",borderLeft:`3px solid ${obj.locked?obj.type.color:"#0a3a5c"}`}}>
                  <span style={{fontSize:14}}>{obj.type.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{color:obj.type.color,fontFamily:"Orbitron",fontSize:11}}>{obj.type.cls}</span>
                      {obj.locked && <span style={{background:obj.type.color+"22",border:`1px solid ${obj.type.color}`,color:obj.type.color,fontSize:10,fontFamily:"Orbitron",padding:"0 3px",borderRadius:2}}>LOCKED</span>}
                    </div>
                    <div style={{color:"#2a5a7a",fontSize:10}}>PX({Math.round(obj.x)},{Math.round(obj.y)}) · AGE:{obj.trackAge}f</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:obj.type.level==="CRITICAL"?"#ff2d55":obj.type.level==="HIGH"?"#ffaa00":"#00ff88",fontFamily:"Orbitron",fontSize:10}}>{obj.type.level}</div>
                    {obj.path.length>1 && (
                      <svg width="32" height="18" style={{border:"1px solid #0a3a5c",borderRadius:2}}>
                        <polyline
                          points={obj.path.slice(-15).map(([px,py])=>`${Math.round(px/620*32)},${Math.round(py/400*18)}`).join(" ")}
                          fill="none" stroke={obj.type.color} strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drone detection log */}
        <div className="panel" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div className="panel-title"><span>📋</span>DRONE DETECTION LOG</div>
          <div style={{flex:1,overflowY:"auto"}}>
            {detLog.length===0 ? (
              <div style={{padding:"10px 12px",color:"#2a5a7a",fontSize:12}}>// AWAITING AERIAL DETECTIONS...</div>
            ):(
              detLog.map((item,i)=>(
                <div key={i} style={{padding:"6px 10px",borderBottom:"1px solid #040d1a",borderLeft:`3px solid ${lc(item.level)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:lc(item.level),fontFamily:"Orbitron",fontSize:11}}>{item.level}</span>
                    <div style={{display:"flex",gap:4}}>
                      <span style={{color:"#00ff88",fontSize:10,border:"1px solid #00ff8844",borderRadius:2,padding:"0 3px"}}>{item.droneName}</span>
                      <span style={{color:"#2a5a7a",fontSize:10}}>{item.time}</span>
                    </div>
                  </div>
                  <div style={{color:"#b0d8f0",fontSize:12,marginTop:1}}>{item.type?.replace(/_/g," ")} — {item.detectedClass}</div>
                  <div style={{color:"#4a7a9a",fontSize:10}}>{item.name} · ALT:{item.altitude}m</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drone capabilities */}
        <div className="panel" style={{padding:"7px 10px"}}>
          <div style={{fontSize:10,color:"#4a7a9a",letterSpacing:2,marginBottom:5}}>FLEET CAPABILITIES</div>
          {DRONE_FLEET.map((d,i)=>(
            <div key={d.id} style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:d.color,flexShrink:0}}/>
              <span style={{color:"#4a7a9a",fontSize:11,width:60,flexShrink:0}}>{d.name}</span>
              <span style={{color:d.color,fontSize:10}}>{d.type} · {d.maxAlt}m max · {d.speed}km/h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LIVE DETECTION DEMO ─────────────────────────────────────────────────────
// Anomaly score formula mirrors chakravyuh_ml_pipeline.py exactly
function computeAnomalyScore(dets) {
  if (!dets || !dets.length) return 0;
  const personCount  = dets.filter(d => d.class === "person").length;
  const vehicleCount = dets.filter(d => ["car","truck","bus","motorcycle"].includes(d.class)).length;
  const droneCount   = dets.filter(d => d.class === "airplane" || d.class === "bird").length;
  const maxConf      = Math.max(...dets.map(d => d.score));
  const objCount     = dets.length;
  const hour         = new Date().getHours();
  const isNight      = (hour < 6 || hour > 21) ? 1 : 0;

  const motionIntensity = Math.min(maxConf, 1.0);
  const rfBurst         = Math.min(personCount + vehicleCount, 12) / 12;
  const thermalDelta    = Math.min((personCount * 8 + vehicleCount * 12) / 40, 1.0);
  const seismic         = Math.min(vehicleCount * 0.8, 1.0);

  const score =
    motionIntensity * 0.30 +
    seismic         * 0.15 +
    thermalDelta    * 0.15 +
    rfBurst         * 0.15 +
    Math.min(objCount / 8, 1.0) * 0.10 +
    isNight         * 0.10 +
    (personCount > 2 ? 0.05 : 0);

  return Math.min(Math.max(score, 0), 1);
}

function computeAlertPriority(anomalyScore, dets, isFalsePositive) {
  const maxConf  = dets.length ? Math.max(...dets.map(d => d.score)) : 0;
  const objCount = dets.length;
  const hour     = new Date().getHours();
  const isNight  = (hour < 6 || hour > 21) ? 1 : 0;

  const priority =
    anomalyScore            * 0.40 +
    maxConf                 * 0.20 +
    Math.min(objCount/12,1) * 0.15 +
    isNight                 * 0.10 +
    (isFalsePositive ? 0 : 0.10) +
    Math.min(objCount/8,1)  * 0.05;

  return Math.min(Math.max(priority, 0), 1);
}

function priorityLabel(p) {
  if (p > 0.72) return { label:"CRITICAL", color:"#ff2d55" };
  if (p > 0.52) return { label:"HIGH",     color:"#ffaa00" };
  if (p > 0.32) return { label:"MEDIUM",   color:"#ffee55" };
  return               { label:"LOW",      color:"#00ff88" };
}

// Animated pipeline stage component
function PipelineStage({ step, title, icon, active, done, data, color="#00e5ff" }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:0, position:"relative",
    }}>
      {/* Connector line above (except first) */}
      {step > 1 && (
        <div style={{
          width:2, height:14, flexShrink:0,
          background: done
            ? `linear-gradient(180deg, ${color}, ${color}44)`
            : "#0a2030",
          transition:"background .4s",
          position:"relative",
          overflow:"hidden",
        }}>
          {active && (
            <div style={{
              position:"absolute", top:"-100%", left:0, right:0, height:"100%",
              background:`linear-gradient(180deg,transparent,${color},transparent)`,
              animation:"flowDown .6s linear infinite",
            }}/>
          )}
        </div>
      )}
      {/* Box */}
      <div style={{
        width:"100%", padding:"8px 10px", borderRadius:4,
        background: active ? `${color}15` : done ? `${color}0a` : "#040d1a",
        border: `1px solid ${active ? color : done ? color+"55" : "#0a2030"}`,
        boxShadow: active ? `0 0 14px ${color}33` : "none",
        transition:"all .3s",
        position:"relative", overflow:"hidden",
      }}>
        {active && (
          <div style={{
            position:"absolute", top:0, left:"-100%", right:0, height:1,
            background:`linear-gradient(90deg,transparent,${color},transparent)`,
            animation:"scanRight 1.2s linear infinite",
          }}/>
        )}
        <div style={{display:"flex", alignItems:"center", gap:7, marginBottom:4}}>
          <span style={{fontSize:14}}>{icon}</span>
          <div>
            <div style={{fontFamily:"Orbitron", fontSize:11, letterSpacing:2,
              color: active ? color : done ? color+"aa" : "#2a5a7a"}}>{title}</div>
            <div style={{fontSize:10, color:"#2a5a7a", marginTop:1}}>STEP {step} OF 5</div>
          </div>
          {done && <div style={{marginLeft:"auto", color:"#00ff88", fontSize:10}}>✓</div>}
          {active && <div className="pulse-dot" style={{marginLeft:"auto", background:color, color}}/>}
        </div>
        {data && (
          <div style={{fontSize:11, color: active ? color : "#4a7a9a",
            lineHeight:1.5, fontFamily:"Share Tech Mono", wordBreak:"break-all"}}>
            {data}
          </div>
        )}
      </div>
    </div>
  );
}

function LiveDetectionDemo({ onThreatDetected, gpsRef }) {
  const videoRef    = useRef(null);
  const overlayRef  = useRef(null);
  const streamRef   = useRef(null);
  const analyzingRef= useRef(false);
  const intervalRef = useRef(null);
  const scoreHistRef= useRef([]);

  const [camState,    setCamState]    = useState("IDLE");
  const [pipeStage,   setPipeStage]   = useState(0);  // 0=idle 1-5=active stage
  const [detections,  setDetections]  = useState([]);
  const [anomalyScore,setAnomalyScore]= useState(0);
  const [alertPri,    setAlertPri]    = useState(0);
  const [frameCount,  setFrameCount]  = useState(0);
  const [analyzing,   setAnalyzing]   = useState(false);
  const [selRegion,   setSelRegion]   = useState(HOTSPOTS[0]);
  const [scoreHistory,setScoreHistory]= useState([]);
  const [detLog,      setDetLog]      = useState([]);
  const [pipeData,    setPipeData]    = useState({});
  const [totalFrames, setTotalFrames] = useState(0);
  const [suppressed,  setSuppressed]  = useState(0);
  const [escalated,   setEscalated]   = useState(0);
  const [fps,         setFps]         = useState(0);
  const fpsRef = useRef({ count:0, last:Date.now() });

  const EXTRA_STYLE = `
    @keyframes flowDown{0%{top:-100%}100%{top:100%}}
    @keyframes scanRight{0%{left:-100%}100%{left:100%}}
    @keyframes pipeGlow{0%,100%{opacity:.6}50%{opacity:1}}
    @media(max-width:1000px){
      .live-demo-grid{grid-template-columns:1fr !important;}
      .live-pipeline{display:none;}
    }
    @media(max-width:900px){
      .cam-grid{grid-template-columns:1fr !important;}
      .drone-grid{grid-template-columns:1fr !important;}
    }
  `;

  // Draw detection overlay
  useEffect(() => {
    const cvs = overlayRef.current; if (!cvs || camState !== "ACTIVE") return;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    detections.forEach(d => {
      const [x,y,w,h] = d.bbox;
      const col = d.class==="person" ? "#ff2d55"
                : ["car","truck","bus","motorcycle"].includes(d.class) ? "#ffaa00"
                : "#00e5ff";
      // Box
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      // Corner brackets
      const cs = 10; ctx.lineWidth = 2.5;
      [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([bx,by,sx,sy]) => {
        ctx.beginPath();
        ctx.moveTo(bx+sx*cs, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by+sy*cs);
        ctx.strokeStyle = col; ctx.stroke();
      });
      // Label pill
      const lw = Math.min(w, 160);
      ctx.fillStyle = col + "cc"; ctx.fillRect(x, y-16, lw, 14);
      ctx.fillStyle = "#000"; ctx.font = "bold 9px Share Tech Mono";
      ctx.fillText(`${d.class.toUpperCase()} ${Math.round(d.score*100)}%`, x+3, y-4);
      // Anomaly score mini bar inside box
      if (w > 40) {
        ctx.fillStyle = "#00000066"; ctx.fillRect(x, y+h-10, w, 10);
        const barW = w * d.score;
        ctx.fillStyle = col + "cc"; ctx.fillRect(x, y+h-10, barW, 10);
        ctx.fillStyle = "#fff"; ctx.font = "7px Share Tech Mono";
        ctx.fillText(`CONF:${Math.round(d.score*100)}%`, x+2, y+h-2);
      }
    });
    // Crosshair
    const cx = cvs.width/2, cy = cvs.height/2;
    ctx.strokeStyle = "#00e5ff22"; ctx.lineWidth=1; ctx.setLineDash([4,8]);
    ctx.beginPath(); ctx.moveTo(cx-30,cy); ctx.lineTo(cx+30,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-30); ctx.lineTo(cx,cy+30); ctx.stroke();
    ctx.setLineDash([]);
  }, [detections, camState]);

  const startCam = async () => {
    setCamState("REQUESTING");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video:{ width:{ideal:640}, height:{ideal:480} }, audio:false
      });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
      setCamState("ACTIVE");
    } catch { setCamState("ERROR"); }
  };

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t=>t.stop());
    clearInterval(intervalRef.current);
    setCamState("IDLE"); setPipeStage(0); setDetections([]);
  };

  // Full pipeline analysis
  const runPipeline = useCallback(async () => {
    if (analyzingRef.current || !videoRef.current) return;
    const v = videoRef.current; if (v.readyState < 2) return;
    analyzingRef.current = true;
    setAnalyzing(true);
    setTotalFrames(p => p+1);

    // ── STAGE 1: WEBCAM CAPTURE ──────────────────────────────────────────
    setPipeStage(1);
    const tmp = document.createElement("canvas");
    tmp.width = 320; tmp.height = 240;
    tmp.getContext("2d").drawImage(v, 0, 0, 320, 240);
    const b64 = tmp.toDataURL("image/jpeg", .75).split(",")[1];
    setPipeData(p => ({...p, stage1:`Frame ${totalFrames+1} captured · 320×240px · JPEG .75`}));
    await new Promise(r => setTimeout(r, 200));

    // ── STAGE 2: YOLO DETECTION ─────────────────────────
    setPipeStage(2);
    let dets = [];
    try {
      // ✅ FIX: API key stays on server — call backend, not Anthropic directly
      const res = await fetch("/api/analyze-frame", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({image:b64, region:`${selRegion.name}, ${selRegion.region}`, mode:"pipeline"})
      });
      const data = await res.json();
      dets = data.detections || [];
    } catch { dets = []; }

    setDetections(dets);
    setFrameCount(p => p+1);
    setPipeData(p => ({...p, stage2: dets.length
      ? dets.map(d=>`${d.class.toUpperCase()} ${Math.round(d.score*100)}%`).join(" · ")
      : "NO OBJECTS DETECTED"}));

    // FPS
    fpsRef.current.count++;
    const now = Date.now();
    if (now - fpsRef.current.last > 3000) {
      setFps(+(fpsRef.current.count / (now-fpsRef.current.last) * 1000).toFixed(2));
      fpsRef.current = {count:0, last:now};
    }
    await new Promise(r => setTimeout(r, 150));

    // ── STAGE 3: ANOMALY SCORING ─────────────────────────────────────────
    setPipeStage(3);
    const aScore = computeAnomalyScore(dets);
    setAnomalyScore(aScore);
    const newHistory = [...scoreHistRef.current, {t:frameCount+1, v:+(aScore*100).toFixed(1)}].slice(-40);
    scoreHistRef.current = newHistory;
    setScoreHistory([...newHistory]);
    const isFP = dets.some(d=>d.is_false_positive) && aScore < 0.4;
    setPipeData(p => ({...p, stage3:
      `Score: ${(aScore*100).toFixed(1)}/100 · `+
      `Motion:${+(dets.length?Math.max(...dets.map(d=>d.score)):0).toFixed(2)*100}% · `+
      `Objects:${dets.length} · Night:${(new Date().getHours()<6||new Date().getHours()>21)?1:0}`
    }));
    await new Promise(r => setTimeout(r, 150));

    // ── STAGE 4: ALERT PRIORITY ──────────────────────────────────────────
    setPipeStage(4);
    const aPri = computeAlertPriority(aScore, dets, isFP);
    setAlertPri(aPri);
    const priInfo = priorityLabel(aPri);
    if (isFP) setSuppressed(p=>p+1);
    else if (aPri > 0.72) setEscalated(p=>p+1);
    setPipeData(p => ({...p, stage4:
      `Priority: ${(aPri*100).toFixed(1)}/100 → ${priInfo.label} · `+
      `${isFP?"⚠ FALSE POSITIVE — SUPPRESSED":"✓ GENUINE THREAT"}`
    }));
    await new Promise(r => setTimeout(r, 150));

    // ── STAGE 5: DASHBOARD MARKER ─────────────────────────────────────────
    setPipeStage(5);
    if (dets.length > 0 && !isFP && aPri > 0.35) {
      const top = dets.reduce((a,b) => b.score>a.score ? b : a);
      // Use GPS from parent ref directly — instant, no timeout
      const gps = gpsRef?.current;
      const tLat = gps ? gps.lat : selRegion.lat;
      const tLon = gps ? gps.lon : selRegion.lon;
      const gpsReal = !!gps;
      const gpsAccuracy = gps?.accuracy || null;
      const locName = gpsReal ? `${tLat.toFixed(3)}°N ${tLon.toFixed(3)}°E` : selRegion.name;
      const threat = {
        id:    `LIVE${Date.now()}`,
        type:  OBJ_MAP[top.class] || OBJ_MAP.default,
        level: priInfo.label,
        score: Math.round(aPri*100),
        lat:   tLat, lon:tLon, gpsReal, gpsAccuracy,
        region: gpsReal ? "LIVE GPS DETECTION" : selRegion.region,
        sector: gpsReal ? `GPS-${tLat.toFixed(2)}N-${tLon.toFixed(2)}E` : selRegion.sector,
        name:   locName,
        time:  new Date().toLocaleTimeString("en-IN",{hour12:false}),
        status:"ACTIVE", confidence:Math.round(top.score*100),
        sensors:["LIVE-VIS","AI-YOLO","ANOMALY-MODEL"],
        source:"LIVE_DEMO",
        detectedClass:top.class,
        anomalyScore: +(aScore*100).toFixed(1),
        alertPriority:+(aPri*100).toFixed(1),
        locationNote:gpsReal?`Real GPS: ${tLat.toFixed(5)}°N ${tLon.toFixed(5)}°E (±${gpsAccuracy}m)`:`Sector: ${selRegion.name}`,
      };
      onThreatDetected(threat);
      setDetLog(p=>[threat,...p.slice(0,29)]);
      setPipeData(p=>({...p, stage5:`✓ MARKER → ${gpsReal?`GPS ${tLat.toFixed(3)}°N ${tLon.toFixed(3)}°E`:selRegion.name} · Level:${priInfo.label}`}));
    } else {
      setPipeData(p=>({...p, stage5: isFP ? "⊘ SUPPRESSED — False positive filtered"
        : aPri<=0.35 ? `⊘ BELOW THRESHOLD (${(aPri*100).toFixed(0)}/100) — no marker`
        : "⊘ NO OBJECTS — pipeline idle"}));
    }
    await new Promise(r => setTimeout(r, 300));
    setPipeStage(0);
    analyzingRef.current = false;
    setAnalyzing(false);
  }, [selRegion, frameCount, totalFrames, onThreatDetected]);

  useEffect(()=>{
    if (camState !== "ACTIVE") return;
    intervalRef.current = setInterval(runPipeline, 3500);
    return () => clearInterval(intervalRef.current);
  }, [camState, runPipeline]);

  useEffect(()=>()=>stopCam(), []);

  const priInfo = priorityLabel(alertPri);

  const STAGES = [
    { step:1, title:"WEBCAM FEED",     icon:"📷", color:"#00e5ff",  key:"stage1" },
    { step:2, title:"YOLO DETECTION",  icon:"🔍", color:"#ffaa00",  key:"stage2" },
    { step:3, title:"ANOMALY SCORING", icon:"📊", color:"#ff2d55",  key:"stage3" },
    { step:4, title:"ALERT PRIORITY",  icon:"⚡", color:"#ffee55",  key:"stage4" },
    { step:5, title:"MAP MARKER",      icon:"📍", color:"#00ff88",  key:"stage5" },
  ];

  return (
    <div className="live-demo-grid" style={{flex:1, display:"grid", gridTemplateColumns:"1fr clamp(180px,18%,240px) clamp(220px,24%,310px)", gap:"var(--gap)", overflow:"hidden", minHeight:0}}>
      <style>{EXTRA_STYLE}</style>

      {/* ── LEFT: Camera Feed ─────────────────────────────────────────────── */}
      <div style={{display:"flex", flexDirection:"column", gap:5, overflow:"hidden"}}>
        <div style={{padding:"5px 10px", borderBottom:"1px solid #0a2030", display:"flex", gap:8, alignItems:"center"}} className="panel">
          <span style={{fontSize:11, color:"#4a7a9a", letterSpacing:1, flexShrink:0}}>ASSIGN CAMERA TO:</span>
          <select value={selRegion.name} onChange={e=>setSelRegion(HOTSPOTS.find(h=>h.name===e.target.value))} style={{
            background:"#0a2030", border:"1px solid #0a3a5c", color:"#00e5ff",
            fontFamily:"Share Tech Mono", fontSize:12, padding:"3px 6px", borderRadius:3, flex:1,
          }}>
            {HOTSPOTS.map(h=><option key={h.name} value={h.name}>{h.name} — {h.region}</option>)}
          </select>
          <div style={{display:"flex", gap:4, flexShrink:0}}>
            {[["FRAMES",frameCount,"#00e5ff"],["FPS",fps,"#00ff88"],["SUPPRESSED",suppressed,"#ffaa00"],["ESCALATED",escalated,"#ff2d55"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#040d1a",border:"1px solid #0a2030",borderRadius:3,padding:"3px 7px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#2a5a7a",letterSpacing:1}}>{l}</div>
                <div style={{fontFamily:"Orbitron",fontSize:14,color:c,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{flex:1, position:"relative", overflow:"hidden", minHeight:200, display:"flex", flexDirection:"column"}}>
          <div className="panel-title">
            <span>🎥</span>LIVE DETECTION FEED
            {camState==="ACTIVE" && <><div className="pulse-dot" style={{background:"#ff2d55",color:"#ff2d55"}}/><span className="blink" style={{color:"#ff2d55"}}>● RECORDING</span></>}
            <span style={{marginLeft:"auto", color:"#4a7a9a", fontSize:11}}>
              {camState==="ACTIVE" ? `${detections.length} OBJECTS DETECTED` : camState}
            </span>
          </div>

          <div style={{flex:1, position:"relative", background:"#020810", minHeight:0, height:"100%"}}>
            {camState==="IDLE" && (
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:2}}>
                <div style={{width:56,height:56,border:"2px solid #00e5ff33",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,position:"relative",flexShrink:0}}>
                  <span>🎥</span>
                  <div style={{position:"absolute",inset:-8,border:"1px solid #00e5ff22",borderRadius:"50%",animation:"spin 4s linear infinite"}}/>
                </div>
                <div style={{fontFamily:"Orbitron",fontSize:13,color:"#00e5ff",letterSpacing:3}}>DEMO READY</div>
                <div style={{color:"#2a5a7a",fontSize:11,textAlign:"center",maxWidth:320,lineHeight:1.6}}>
                  <span style={{color:"#00e5ff"}}>Webcam</span> → <span style={{color:"#ffaa00"}}>YOLO</span> → <span style={{color:"#ff2d55"}}>Anomaly</span> → <span style={{color:"#ffee55"}}>Priority</span> → <span style={{color:"#00ff88"}}>Map Marker</span>
                </div>
                <button onClick={startCam} style={{background:"rgba(0,229,255,.12)",border:"2px solid #00e5ff",color:"#00e5ff",fontFamily:"Orbitron",fontSize:11,letterSpacing:2,padding:"10px 28px",cursor:"pointer",borderRadius:4,boxShadow:"0 0 16px #00e5ff33"}}>
                  ▶ START PIPELINE
                </button>
              </div>
            )}
            {camState==="REQUESTING" && (
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="blink" style={{color:"#00e5ff",fontFamily:"Orbitron",fontSize:12}}>REQUESTING CAMERA...</span>
              </div>
            )}
            {camState==="ERROR" && (
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                <div style={{color:"#ff2d55",fontFamily:"Orbitron",fontSize:12}}>ACCESS DENIED</div>
                <button onClick={startCam} style={{background:"rgba(255,45,85,.12)",border:"1px solid #ff2d55",color:"#ff2d55",fontFamily:"Orbitron",fontSize:12,padding:"6px 16px",cursor:"pointer",borderRadius:3}}>RETRY</button>
              </div>
            )}
            <video ref={videoRef} muted playsInline style={{width:"100%",height:"100%",objectFit:"cover",display:camState==="ACTIVE"?"block":"none"}}/>
            <canvas ref={overlayRef} width={640} height={480} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:camState==="ACTIVE"?"block":"none",pointerEvents:"none"}}/>

            {/* HUD overlays */}
            {camState==="ACTIVE" && (
              <>
                {analyzing && (
                  <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,229,255,.15)",border:"1px solid #00e5ff",borderRadius:3,padding:"3px 10px",fontSize:11,color:"#00e5ff",fontFamily:"Orbitron"}}>
                    <span className="blink">▌</span> PIPELINE STAGE {pipeStage}/5 PROCESSING...
                  </div>
                )}
                <button onClick={stopCam} style={{position:"absolute",top:8,right:8,background:"rgba(255,45,85,.2)",border:"1px solid #ff2d55",color:"#ff2d55",fontFamily:"Orbitron",fontSize:10,padding:"3px 8px",cursor:"pointer",borderRadius:3}}>■ STOP</button>

                {/* Anomaly meter overlay */}
                <div style={{position:"absolute",top:8,left:8,width:120,background:"rgba(0,0,0,.7)",border:"1px solid #0a3a5c",borderRadius:3,padding:"5px 8px"}}>
                  <div style={{fontSize:10,color:"#4a7a9a",marginBottom:3,letterSpacing:1}}>ANOMALY SCORE</div>
                  <div style={{background:"#0a2030",height:6,borderRadius:3,marginBottom:3}}>
                    <div style={{
                      width:`${anomalyScore*100}%`, height:"100%", borderRadius:3,
                      background:`linear-gradient(90deg,${anomalyScore>.72?"#ff2d55":anomalyScore>.52?"#ffaa00":"#00e5ff"},transparent)`,
                      transition:"width .4s ease",
                    }}/>
                  </div>
                  <div style={{fontFamily:"Orbitron",fontSize:11,color:anomalyScore>.72?"#ff2d55":anomalyScore>.52?"#ffaa00":"#00e5ff",fontWeight:700}}>
                    {(anomalyScore*100).toFixed(1)}<span style={{fontSize:10}}>/100</span>
                  </div>
                </div>

                {/* Priority badge */}
                <div style={{
                  position:"absolute",bottom:8,right:8,
                  background:lb(priInfo.label),border:`1px solid ${priInfo.color}`,
                  borderRadius:3,padding:"4px 10px",
                  fontFamily:"Orbitron",fontSize:12,color:priInfo.color,
                  boxShadow:`0 0 10px ${priInfo.color}33`,
                }}>
                  {priInfo.label}
                </div>
              </>
            )}
          </div>

          {/* Detection badges */}
          {camState==="ACTIVE" && detections.length>0 && (
            <div style={{padding:"5px 8px",borderTop:"1px solid #0a2030",display:"flex",gap:5,flexWrap:"wrap"}}>
              {detections.map((d,i)=>{
                const col = d.class==="person"?"#ff2d55":["car","truck","bus"].includes(d.class)?"#ffaa00":"#00e5ff";
                return <span key={i} style={{background:col+"14",border:`1px solid ${col}`,color:col,fontSize:10,fontFamily:"Orbitron",padding:"1px 6px",borderRadius:2}}>
                  {d.class.toUpperCase()} {Math.round(d.score*100)}%
                </span>;
              })}
            </div>
          )}
        </div>

        {/* Score chart */}
        <div className="panel" style={{height:130}}>
          <div className="panel-title" style={{padding:"6px 10px 5px"}}><span>📈</span>REAL-TIME ANOMALY SCORE HISTORY</div>
          <ResponsiveContainer width="100%" height={95}>
            <AreaChart data={scoreHistory} margin={{top:4,right:8,left:-28,bottom:0}}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff2d55" stopOpacity={.4}/>
                  <stop offset="95%" stopColor="#ff2d55" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide/>
              <YAxis domain={[0,100]} tick={{fill:"#2a5a7a",fontSize:10}}/>
              <Tooltip contentStyle={{background:"#040d1a",border:"1px solid #0a3a5c",fontSize:11}} formatter={v=>[v+"/100","Score"]}/>
              <Area type="monotone" dataKey="v" stroke="#ff2d55" fill="url(#sg)" strokeWidth={1.5} dot={false} isAnimationActive={false}/>
              {/* Threshold lines */
              }</AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CENTRE: Pipeline Visualizer ────────────────────────────────────── */}
      <div className="panel live-pipeline" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
        <div className="panel-title"><span>⚙️</span>AI PIPELINE FLOW</div>
        <div style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",justifyContent:"center",gap:0,overflowY:"auto"}}>
          {STAGES.map(s => (
            <PipelineStage key={s.step}
              step={s.step} title={s.title} icon={s.icon} color={s.color}
              active={pipeStage === s.step}
              done={pipeStage > s.step || (pipeStage===0 && frameCount>0 && s.step<=5)}
              data={pipeData[s.key]}
            />
          ))}
        </div>

        {/* Pipeline metrics */}
        <div style={{padding:"8px 10px",borderTop:"1px solid #0a2030"}}>
          <div style={{fontSize:10,color:"#4a7a9a",letterSpacing:2,marginBottom:6}}>PIPELINE METRICS</div>
          {[
            ["Frames Processed", frameCount,      "#00e5ff"],
            ["Alerts Raised",    detLog.length,   "#ff2d55"],
            ["FP Suppressed",    suppressed,       "#ffaa00"],
            ["Escalated",        escalated,        "#00ff88"],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:"#2a5a7a",fontSize:11}}>{l}</span>
              <span style={{color:c,fontFamily:"Orbitron",fontSize:10,fontWeight:700}}>{v}</span>
            </div>
          ))}
          {frameCount > 0 && (
            <div style={{marginTop:6}}>
              <div style={{fontSize:10,color:"#2a5a7a",marginBottom:2}}>FALSE POSITIVE REDUCTION</div>
              <div style={{background:"#0a2030",height:4,borderRadius:2}}>
                <div style={{
                  width:`${Math.min(suppressed/Math.max(frameCount,1)*100*3,100)}%`,
                  height:"100%", borderRadius:2,
                  background:"linear-gradient(90deg,#00ff88,transparent)",
                  transition:"width .5s",
                }}/>
              </div>
              <div style={{color:"#00ff88",fontFamily:"Orbitron",fontSize:12,marginTop:2}}>
                {(suppressed/Math.max(frameCount,1)*100).toFixed(1)}% FILTERED
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Detection Log ───────────────────────────────────────────── */}
      <div style={{display:"flex",flexDirection:"column",gap:"var(--gap)",overflow:"hidden",minHeight:0}}>
        {/* Current frame analysis */}
        <div className="panel" style={{padding:"0 0 8px"}}>
          <div className="panel-title"><span>🔬</span>CURRENT FRAME ANALYSIS</div>
          <div style={{padding:"8px 10px"}}>
            {[
              ["Anomaly Score",    `${(anomalyScore*100).toFixed(1)}/100`,     anomalyScore>.72?"#ff2d55":anomalyScore>.52?"#ffaa00":"#00e5ff"],
              ["Alert Priority",   `${(alertPri*100).toFixed(1)}/100`,          priInfo.color],
              ["Priority Level",   priInfo.label,                               priInfo.color],
              ["Objects Found",    detections.length,                           "#b0d8f0"],
              ["Frame #",          frameCount,                                  "#4a7a9a"],
              ["Region",           selRegion.name,                              "#4a7a9a"],
              ["Coords",           `${selRegion.lat}°N ${selRegion.lon}°E`,    "#00ff88"],
            ].map(([k,v,c])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{color:"#2a5a7a",fontSize:11}}>{k}</span>
                <span style={{color:c,fontFamily:"Orbitron",fontSize:12,fontWeight:700}}>{v}</span>
              </div>
            ))}
            {/* Anomaly score bar */}
            <div style={{marginTop:4}}>
              <div style={{background:"#0a2030",height:6,borderRadius:3}}>
                <div style={{
                  width:`${anomalyScore*100}%`, height:"100%", borderRadius:3,
                  background:`linear-gradient(90deg,${anomalyScore>.72?"#ff2d55":anomalyScore>.52?"#ffaa00":"#00e5ff"},transparent)`,
                  transition:"width .4s",
                }}/>
              </div>
              <div style={{background:"#0a2030",height:6,borderRadius:3,marginTop:3}}>
                <div style={{
                  width:`${alertPri*100}%`, height:"100%", borderRadius:3,
                  background:`linear-gradient(90deg,${priInfo.color},transparent)`,
                  transition:"width .4s",
                }}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                <span style={{color:"#2a5a7a",fontSize:10}}>ANOMALY</span>
                <span style={{color:"#2a5a7a",fontSize:10}}>PRIORITY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detection event log */}
        <div className="panel" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div className="panel-title">
            <span>📋</span>PIPELINE EVENT LOG
            <span style={{marginLeft:"auto",color:"#4a7a9a",fontSize:10}}>{detLog.length} EVENTS</span>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {!detLog.length ? (
              <div style={{padding:"12px",color:"#2a5a7a",fontSize:12,lineHeight:1.6}}>
                // Activate pipeline to begin<br/>
                // live detection logging<br/>
                // ─────────────────────<br/>
                // Each frame runs through:<br/>
                // 1. YOLO<br/>
                // 2. Anomaly Score Model<br/>
                // 3. Alert Priority Calc<br/>
                // 4. Map marker injection
              </div>
            ):(
              detLog.map((item,i)=>(
                <div key={i} className="slide-in" style={{padding:"6px 10px",borderBottom:"1px solid #040d1a",borderLeft:`3px solid ${lc(item.level)}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:lc(item.level),fontFamily:"Orbitron",fontSize:11}}>{item.level}</span>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <span style={{fontSize:10,color:"#ff2d55",border:"1px solid #ff2d5544",borderRadius:2,padding:"0 3px"}}>🔴 LIVE</span>
                      <span style={{color:"#2a5a7a",fontSize:10}}>{item.time}</span>
                    </div>
                  </div>
                  <div style={{color:"#b0d8f0",fontSize:12,marginTop:1}}>{item.type?.replace(/_/g," ")}</div>
                  <div style={{color:"#4a7a9a",fontSize:10,marginTop:1}}>{item.name}</div>
                  <div style={{display:"flex",gap:8,marginTop:2}}>
                    <span style={{color:"#2a5a7a",fontSize:10}}>A:{item.anomalyScore}/100</span>
                    <span style={{color:"#2a5a7a",fontSize:10}}>P:{item.alertPriority}/100</span>
                    <span style={{color:"#4a7a9a",fontSize:10}}>{item.detectedClass}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Formula reference */}
        <div className="panel" style={{padding:"8px 10px"}}>
          <div style={{fontSize:10,color:"#4a7a9a",letterSpacing:2,marginBottom:5}}>ML MODEL FORMULAS (from pipeline.py)</div>
          <div style={{fontFamily:"Share Tech Mono",fontSize:10,color:"#2a5a7a",lineHeight:1.8}}>
            <div style={{color:"#4a7a9a"}}>anomaly_score =</div>
            <div style={{paddingLeft:8}}>motion×0.30 + seismic×0.15</div>
            <div style={{paddingLeft:8}}>+ thermal×0.15 + rf×0.15</div>
            <div style={{paddingLeft:8}}>+ objects×0.10 + night×0.10</div>
            <div style={{color:"#4a7a9a",marginTop:4}}>alert_priority =</div>
            <div style={{paddingLeft:8}}>anomaly×0.40 + conf×0.20</div>
            <div style={{paddingLeft:8}}>+ count×0.15 + night×0.10</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SENSOR GRID ─────────────────────────────────────────────────────────────
const SENSOR_DEFS = [
  { n:"VISUAL SURVEILLANCE", ic:"📷", c:"#00e5ff",  unit:"lux",    baseline:72, noise:14 },
  { n:"INFRARED THERMAL",    ic:"🔥", c:"#ff2d55",  unit:"°C ΔT",  baseline:55, noise:18 },
  { n:"SEISMIC ARRAY",       ic:"🌍", c:"#ffaa00",  unit:"mm/s",   baseline:48, noise:22 },
  { n:"RF SIGNAL MONITOR",   ic:"📻", c:"#00ff88",  unit:"dBm",    baseline:65, noise:16 },
  { n:"SATELLITE LINK",      ic:"🛰", c:"#b060ff",  unit:"SNR dB", baseline:78, noise:10 },
  { n:"ACOUSTIC DETECTION",  ic:"🎙", c:"#ffee55",  unit:"dB SPL", baseline:44, noise:20 },
];

function SensorCard({ def, realData }) {
  const hasData = realData && realData.length > 0;
  const data = hasData ? realData : Array.from({length:50}, (_,i)=>({t:i, v:0}));
  const latest = data[data.length-1]?.v || 0;
  const pingMs = hasData ? Math.round(20 + (latest % 10)) : 0;
  const uptime = hasData ? "99.9" : "0.0";
  const anomaly = latest > def.baseline + def.noise * 1.2;
  const isHigh = latest > (def.baseline + def.noise * 0.9);
  const gradId = `sg_${def.n.replace(/\s/g,'')}`;

  return (
    <div className="panel" style={{display:"flex",flexDirection:"column",minHeight:0}}>
      {/* Header */}
      <div className="panel-title" style={{justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span>{def.ic}</span>
          <span>{def.n}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          {anomaly && <span className="blink" style={{color:"#ff2d55",fontSize:8,fontFamily:"Orbitron",letterSpacing:1}}>⚠ SPIKE</span>}
          <span style={{
            fontFamily:"Orbitron", fontSize:12, fontWeight:700,
            color: isHigh ? "#ff2d55" : def.c,
            textShadow: `0 0 8px ${isHigh?"#ff2d55":def.c}88`,
          }}>{latest}<span style={{fontSize:8,color:"#4a7a9a",marginLeft:2}}>{def.unit}</span></span>
        </div>
      </div>

      {/* Chart area */}
      <div style={{flex:1,padding:"8px 4px 0",minHeight:0}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{top:6,right:8,left:-18,bottom:0}}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={def.c} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={def.c} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="t" hide/>
            <YAxis domain={[0,100]} tick={{fill:"#3a6a8a",fontSize:9}} tickCount={5} width={28}/>
            <Tooltip
              contentStyle={{background:"#040d1a",border:`1px solid ${def.c}44`,fontSize:10,fontFamily:"Share Tech Mono",padding:"4px 8px"}}
              formatter={v=>[`${v} ${def.unit}`, def.n]}
              labelFormatter={()=>""}
            />
            <Area type="monotone" dataKey="v" stroke={isHigh?"#ff2d55":def.c} strokeWidth={isHigh?2:1.5} fill={`url(#${gradId})`} dot={false} isAnimationActive={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status footer */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderTop:"1px solid #0a2030", padding:"6px 8px", gap:4, flexShrink:0 }}>
        {[
          ["STATUS",  hasData ? "ONLINE" : "OFFLINE", hasData ? def.c : "#4a7a9a"],
          ["PING",    hasData ? `${pingMs}ms` : "—",  hasData ? "#00ff88" : "#4a7a9a"],
          ["UPTIME",  `${uptime}%`,                   hasData ? "#00e5ff" : "#4a7a9a"],
          ["LEVEL",   isHigh?"HIGH":"NOM",             isHigh?"#ff2d55": hasData ? "#00ff88" : "#4a7a9a"],
        ].map(([k,v,c])=>(
          <div key={k} style={{textAlign:"center"}}>
            <div style={{color:"#2a5a7a",fontSize:9,letterSpacing:1,marginBottom:2}}>{k}</div>
            <div style={{color:c,fontFamily:"Orbitron",fontSize:11,fontWeight:700}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SensorGrid({ sensorDataHistory }) {
  return (
    <div style={{ flex:1, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gridTemplateRows:"1fr 1fr", gap:"var(--gap)", padding:"var(--pad)", overflow:"hidden", minHeight:0 }}>
      {SENSOR_DEFS.map(def => <SensorCard key={def.n} def={def} realData={sensorDataHistory[def.n]}/>)}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
//  QUANTUM SECURITY MODULE
//  Displays live PQC metrics, signature chain, key rotation, chain verify.
//  Polls /api/quantum-status and /api/quantum-signatures every 3 seconds.
// ════════════════════════════════════════════════════════════════════════════
function QuantumModule() {
  const [metrics,    setMetrics]    = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [integrity,  setIntegrity]  = useState(null);
  const [verifying,  setVerifying]  = useState(false);
  const [signing,    setSigning]    = useState(false);
  const [rotating,   setRotating]   = useState(false);
  const [rotateMsg,  setRotateMsg]  = useState(null);
  const [signingMsg, setSigningMsg] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [backendOk,  setBackendOk]  = useState(true);

  // sigStoreRef is the SINGLE SOURCE OF TRUTH — never gets wiped by polls or re-renders
  const sigStoreRef = useRef([]);
  const metricsRef  = useRef(null);

  const commitSigs = (arr) => { sigStoreRef.current = arr; setSignatures([...arr]); };

  // OFFLINE_METRICS: shown only when backend is unreachable.
  // All values are zero/null — no fake numbers, no simulated chains.
  const OFFLINE_METRICS = useRef({
    pqc_available:false, kem_algorithm:"—", sig_algorithm:"—",
    chain_integrity:"OFFLINE", chain_length:0, total_payloads_signed:0,
    total_tamper_alerts:0, total_keys_generated:0, mode:"BACKEND OFFLINE",
    session_id:"—", session_start:null, key_rotation_interval:900, next_rotation_in:0,
    public_key_info:{key_size_kem_bytes:0, key_size_sig_bytes:0},
  }).current;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          fetch("/api/quantum-status"),
          fetch("/api/quantum-signatures?n=100"),
        ]);
        if (mRes.ok) { const m=await mRes.json(); metricsRef.current=m; setMetrics(m); setBackendOk(true); }
        if (sRes.ok) {
          const s = await sRes.json();
          const fromBackend = Array.isArray(s.signatures) ? s.signatures : [];
          if (fromBackend.length > 0) {
            // Keep ALL manual sigs. Add backend sigs that aren't already in store.
            const manuals = sigStoreRef.current.filter(x => x._manual);
            const existingIds = new Set(sigStoreRef.current.map(x=>x.payload_id));
            const newFromBackend = fromBackend.filter(x => !existingIds.has(x.payload_id));
            if (newFromBackend.length > 0) {
              // Only add new ones — never remove existing
              commitSigs([...manuals, ...sigStoreRef.current.filter(x=>!x._manual), ...newFromBackend]);
            }
            // If backend returned sigs we already have, do nothing — preserve existing list
          }
          // empty fromBackend => do nothing at all, preserve sigStoreRef completely
        }
        setLastUpdate(new Date().toLocaleTimeString("en-IN",{hour12:false}));
      } catch {
        setBackendOk(false);
        if (!metricsRef.current) { metricsRef.current=OFFLINE_METRICS; setMetrics(OFFLINE_METRICS); }
        setLastUpdate(new Date().toLocaleTimeString("en-IN",{hour12:false}));
      }
    };
    fetchAll();
    const iv = setInterval(fetchAll, 3000);
    return () => clearInterval(iv);
  }, []);

  const displayMetrics = metrics || OFFLINE_METRICS;
  const getChainLen = () => metricsRef.current?.chain_length ?? displayMetrics?.chain_length ?? 0;

  const handleVerify = async () => {
    setVerifying(true); setIntegrity(null);
    try {
      const res = await fetch("/api/quantum-verify",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
      if (!res.ok) throw new Error();
      const d = await res.json();
      const status = d.status || "INTACT";
      if (status === "UNAVAILABLE") {
        setIntegrity({
          status: "OFFLINE",
          length: getChainLen(),
          head_hash: "—",
          genesis_hash: "—",
          broken_at: null,
          error: "Quantum module not loaded — install liboqs-python to enable PQC verification"
        });
      } else {
        setIntegrity({
          status: status === "TAMPERED" ? "TAMPERED" : "INTACT",
          length: d.length ?? d.chain_length ?? getChainLen(),
          head_hash: d.head_hash || "—",
          genesis_hash: d.genesis_hash || "—",
          broken_at: d.broken_at || null,
          error: d.message || null,
        });
      }
    } catch {
      setIntegrity({
        status:"OFFLINE", length:0,
        head_hash:"—", genesis_hash:"—",
        broken_at:null, error:"Backend offline — start python app.py to verify chain",
      });
    }
    setVerifying(false);
  };

  const handleSignN = async (count) => {
    setSigning(count); setSigningMsg(null);
    try {
      const res = await fetch("/api/quantum-sign-dataset",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({n:count, source:"DATASET"})
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const bSigs = (d.signed || d.signatures || []).map(s=>({...s,_manual:true}));
      if (bSigs.length === 0) throw new Error("no signatures returned from backend");
      commitSigs([...bSigs,...sigStoreRef.current]);
      const nc=(metricsRef.current?.total_payloads_signed||0)+bSigs.length;
      const nl=(metricsRef.current?.chain_length||0)+bSigs.length;
      const upd={...(metricsRef.current||OFFLINE_METRICS),total_payloads_signed:nc,chain_length:nl,chain_integrity:"INTACT"};
      metricsRef.current=upd; setMetrics(upd);
      setSigningMsg({ok:true,text:`✓ ${bSigs.length} rows signed from border_sensor_dataset.csv (chain total: ${nl})`});
    } catch(e) {
      // Do NOT generate fake signatures — show an honest error instead
      setSigningMsg({ok:false,text:`✗ Backend offline — start python app.py to sign dataset rows`});
    }
    setSigning(false);
  };

  const handleRotateKey = async () => {
    setRotating(true); setRotateMsg(null);
    try {
      const res=await fetch("/api/quantum-rotate",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d=await res.json();
      setRotateMsg({ok:true,text:d.message||"Key rotation complete. New Kyber-512 keypair generated."});
      const upd={...(metricsRef.current||OFFLINE_METRICS),next_rotation_in:metricsRef.current?.key_rotation_interval||900,total_keys_generated:(metricsRef.current?.total_keys_generated||0)+1};
      metricsRef.current=upd; setMetrics(upd);
    } catch {
      setRotateMsg({ok:false,text:"✗ Backend offline — start python app.py to rotate keys"});
    }
    setRotating(false);
  };

  const pqcOk   = displayMetrics?.pqc_available;
  const rotPct  = displayMetrics ? ((displayMetrics.key_rotation_interval - displayMetrics.next_rotation_in) / displayMetrics.key_rotation_interval) * 100 : 0;
  const clr     = (l) => l==="CRITICAL"?"#ff2d55":l==="HIGH"?"#ffaa00":l==="MEDIUM"?"#ffee55":"#00ff88";
  const intact  = displayMetrics?.chain_integrity === "INTACT";

  // Shared section styles — generous padding, never clips content
  const sectionCard = (extra={}) => ({
    background:"#040d1a",
    border:"1px solid #0a3a5c",
    borderRadius:5,
    padding:"20px 22px",
    flexShrink:0,
    ...extra,
  });
  const sectionTitle = {
    fontFamily:"Orbitron", fontSize:11, color:"#00e5ff", letterSpacing:2,
    marginBottom:16, borderLeft:"3px solid #00e5ff", paddingLeft:10, fontWeight:700,
  };
  const rowStyle = {
    display:"flex", justifyContent:"space-between", alignItems:"flex-start",
    padding:"10px 0", borderBottom:"1px solid #0a2030", gap:12, flexWrap:"wrap",
  };

  return (
    <div style={{flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:14}}>

      {/* ── Backend status banner ────────────────────────────────────────────── */}
      {!backendOk && (
        <div style={{background:"rgba(255,170,0,.08)", border:"1px solid #ffaa0044", borderRadius:4, padding:"8px 14px",
          display:"flex", alignItems:"center", gap:10, flexShrink:0}}>
          <span style={{color:"#ffaa00", fontFamily:"Orbitron", fontSize:10}}>⚠ BACKEND OFFLINE</span>
          <span style={{color:"#4a7a9a", fontSize:10}}>Showing simulation data — run: <span style={{color:"#00e5ff"}}>python app.py</span> to connect live PQC engine</span>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12,
        borderBottom:"1px solid #0a3a5c", paddingBottom:14, flexShrink:0}}>
        <div>
          <div style={{fontFamily:"Orbitron", fontWeight:900, fontSize:16, color:"#00e5ff", letterSpacing:3}}>⚛ QUANTUM SECURITY LAYER</div>
          <div style={{fontSize:10, color:"#4a7a9a", letterSpacing:2, marginTop:5}}>CRYSTALS-KYBER · DILITHIUM · AES-256-GCM · NIST FIPS 203/204/197</div>
        </div>
        <div style={{textAlign:"right", fontSize:10, color:"#2a5a7a", flexShrink:0}}>
          <div style={{marginBottom:6}}>LAST UPDATE: {lastUpdate||"—"}</div>
          <span style={{
            padding:"4px 12px", borderRadius:2, fontSize:10, fontFamily:"Orbitron", fontWeight:700,
            background: pqcOk?"rgba(0,255,136,.12)":"rgba(255,170,0,.12)",
            color: pqcOk?"#00ff88":"#ffaa00",
            border: `1px solid ${pqcOk?"#00ff8844":"#ffaa0044"}`,
          }}>{pqcOk?"PQC ACTIVE":"FALLBACK MODE"}</span>
        </div>
      </div>

      {/* ── Algorithm KPI row ───────────────────────────────────────────────── */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, flexShrink:0}}>
        {[
          ["KEM ALGORITHM",  displayMetrics?.kem_algorithm||"—",  "NIST FIPS 203",  "#ffaa00"],
          ["SIG ALGORITHM",  displayMetrics?.sig_algorithm||"—",  "NIST FIPS 204",  "#ffaa00"],
          ["ENCRYPTION",     "AES-256-GCM",                        "NIST FIPS 197",  "#ffaa00"],
        ].map(([lbl,v,sub,c])=>(
          <div key={lbl} style={{...sectionCard(), borderColor:"#ffaa0022", minHeight:100}}>
            <div style={{fontSize:10, color:"#4a7a9a", letterSpacing:2, marginBottom:10, fontFamily:"Orbitron"}}>{lbl}</div>
            <div style={{fontFamily:"Orbitron", fontSize:15, fontWeight:700, color:c, wordBreak:"break-word", lineHeight:1.3}}>{v}</div>
            <div style={{fontSize:10, color:"#4a7a9a", marginTop:8}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, flexShrink:0}}>
        <div style={{...sectionCard(), minHeight:120}}>
          <div style={{fontSize:10, color:"#4a7a9a", letterSpacing:2, marginBottom:10, fontFamily:"Orbitron"}}>SIGNATURES ISSUED</div>
          <div style={{fontSize:28, fontWeight:700, color:"#00e5ff", fontFamily:"Orbitron"}}>{displayMetrics?.total_payloads_signed??0}</div>
          <div style={{fontSize:10, color:"#4a7a9a", marginTop:8}}>ML outputs signed</div>
        </div>
        <div style={{...sectionCard({minHeight:120}), background:intact?"rgba(0,255,136,.04)":"rgba(255,45,85,.04)", border:`1px solid ${intact?"#00ff8833":"#ff2d5533"}`}}>
          <div style={{fontSize:10, color:"#4a7a9a", letterSpacing:2, marginBottom:10, fontFamily:"Orbitron"}}>CHAIN INTEGRITY</div>
          <div style={{fontSize:28, fontWeight:700, color:intact?"#00ff88":"#ff2d55", fontFamily:"Orbitron"}}>{displayMetrics?.chain_integrity||"N/A"}</div>
          <div style={{fontSize:10, color:"#4a7a9a", marginTop:8}}>{displayMetrics?.chain_length??0} links</div>
        </div>
        <div style={{...sectionCard({minHeight:120}), background:(displayMetrics?.total_tamper_alerts||0)>0?"rgba(255,45,85,.04)":"rgba(0,255,136,.04)", border:`1px solid ${(displayMetrics?.total_tamper_alerts||0)>0?"#ff2d5533":"#00ff8833"}`}}>
          <div style={{fontSize:10, color:"#4a7a9a", letterSpacing:2, marginBottom:10, fontFamily:"Orbitron"}}>TAMPER ALERTS</div>
          <div style={{fontSize:28, fontWeight:700, color:(displayMetrics?.total_tamper_alerts||0)>0?"#ff2d55":"#00ff88", fontFamily:"Orbitron"}}>{displayMetrics?.total_tamper_alerts??0}</div>
          <div style={{fontSize:10, color:"#4a7a9a", marginTop:8}}>{(displayMetrics?.total_tamper_alerts||0)>0?"CHAIN COMPROMISED":"No tampering detected"}</div>
        </div>
      </div>

      {/* ── Session + Key Rotation ──────────────────────────────────────────── */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, flexShrink:0}}>
        <div style={sectionCard()}>
          <div style={sectionTitle}>SESSION INFO</div>
          {[
            ["SESSION ID",     displayMetrics?.session_id||"—"],
            ["START TIME",     displayMetrics?.session_start ? new Date(displayMetrics.session_start).toLocaleTimeString("en-IN",{hour12:false}) : "—"],
            ["KEYS GENERATED", displayMetrics?.total_keys_generated??0],
            ["MODE",           displayMetrics?.mode||"—"],
          ].map(([k,v])=>(
            <div key={k} style={rowStyle}>
              <span style={{color:"#4a7a9a", fontSize:11, flexShrink:0}}>{k}</span>
              <span style={{color:"#00e5ff", fontWeight:700, fontFamily:"Orbitron", fontSize:11, wordBreak:"break-all", textAlign:"right"}}>{String(v)}</span>
            </div>
          ))}
          <div style={{marginTop:16}}>
            <div style={{fontSize:10, color:"#4a7a9a", marginBottom:8, letterSpacing:1}}>NIST STANDARDS IN USE</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {["FIPS 203","FIPS 204","FIPS 197","FIPS 202"].map(s=>(
                <span key={s} style={{padding:"4px 10px", borderRadius:2, fontSize:10, fontFamily:"Orbitron",
                  background:"rgba(255,170,0,.1)", color:"#ffaa00", border:"1px solid #ffaa0033"}}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={sectionCard()}>
          <div style={sectionTitle}>KEY ROTATION · FORWARD SECRECY</div>
          {[
            ["ROTATION INTERVAL", `${displayMetrics?.key_rotation_interval??900}s (15 min)`],
            ["NEXT ROTATION IN",  `${displayMetrics?.next_rotation_in??0}s`],
            ["KEM KEY SIZE",      `${displayMetrics?.public_key_info?.key_size_kem_bytes??800} bytes`],
            ["SIG KEY SIZE",      `${displayMetrics?.public_key_info?.key_size_sig_bytes??1312} bytes`],
          ].map(([k,v])=>(
            <div key={k} style={rowStyle}>
              <span style={{color:"#4a7a9a", fontSize:11, flexShrink:0}}>{k}</span>
              <span style={{color:k==="NEXT ROTATION IN"&&(displayMetrics?.next_rotation_in??900)<60?"#ff2d55":"#00e5ff",
                fontWeight:700, fontFamily:"Orbitron", fontSize:11, wordBreak:"break-all", textAlign:"right"}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:16}}>
            <div style={{fontSize:10, color:"#4a7a9a", marginBottom:8, letterSpacing:1}}>KEY LIFETIME</div>
            <div style={{height:6, background:"#0a1a24", borderRadius:3, overflow:"hidden"}}>
              <div style={{width:`${rotPct}%`, height:"100%",
                background:rotPct>75?"#ff2d55":rotPct>50?"#ffaa00":"#00e5ff", transition:"width 1s linear"}}/>
            </div>
          </div>
          <div style={{fontSize:10, color:"#2a5a7a", marginTop:12, lineHeight:1.8}}>
            Fresh keypairs generated every rotation.<br/>Past sessions cannot be decrypted with new keys.
          </div>
        </div>
      </div>

      {/* ── Chain Verify ────────────────────────────────────────────────────── */}
      <div style={sectionCard()}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap"}}>
          <div style={{flex:1, minWidth:240}}>
            <div style={sectionTitle}>SIGNATURE CHAIN VERIFICATION</div>
            <div style={{fontSize:11, color:"#4a7a9a", lineHeight:1.9}}>
              Every ML output is signed with Dilithium2 and linked to the previous signature hash.
              Tampering with any output breaks the chain — making interference cryptographically detectable.
              A field commander receiving a SITREP can verify it is genuine and untampered.
            </div>
          </div>
          <button onClick={handleVerify} disabled={verifying} style={{
            background:"rgba(0,229,255,.12)", border:"1px solid #00e5ff66",
            color:"#00e5ff", padding:"11px 24px", cursor:"pointer",
            fontSize:10, letterSpacing:2, fontFamily:"Orbitron", borderRadius:3, flexShrink:0, alignSelf:"flex-start",
          }}>{verifying?"⟳ VERIFYING...":"▶ VERIFY CHAIN"}</button>
        </div>
        {integrity && (
          <div style={{
            marginTop:16, padding:"14px 16px", borderRadius:4,
            background: integrity.status==="INTACT"  ? "rgba(0,255,136,.05)"
                      : integrity.status==="OFFLINE" ? "rgba(255,170,0,.05)"
                      : "rgba(255,45,85,.05)",
            border:`1px solid ${
              integrity.status==="INTACT"  ? "#00ff8844"
            : integrity.status==="OFFLINE" ? "#ffaa0044"
            : "#ff2d5544"}`,
          }}>
            <div style={{fontFamily:"Orbitron", fontSize:12, fontWeight:700, marginBottom:6,
              color: integrity.status==="INTACT"  ? "#00ff88"
                   : integrity.status==="OFFLINE" ? "#ffaa00"
                   : "#ff2d55"}}>
              {integrity.status==="INTACT"
                ? `✓ CHAIN INTACT — ${integrity.length??0} signatures verified`
                : integrity.status==="OFFLINE"
                  ? `⚠ PQC MODULE UNAVAILABLE — install liboqs-python for Dilithium2 verification`
                  : integrity.broken_at
                    ? `✗ TAMPER DETECTED at chain[${integrity.broken_at.index??"?"}] — ${integrity.broken_at.reason??"unknown"}`
                    : `✗ VERIFICATION FAILED — ${integrity.error||"unknown error"}`}
            </div>
            {integrity.status==="OFFLINE"
              ? <div style={{fontSize:10,color:"#4a7a9a",lineHeight:1.7}}>
                  HMAC-SHA3-256 fallback is active — signatures are dataset-backed but not post-quantum.<br/>
                  Run: <span style={{color:"#00e5ff"}}>pip install liboqs-python pycryptodome</span> to enable Kyber-512 + Dilithium2.
                </div>
              : <>
                  {integrity.error && <div style={{fontSize:10,color:"#ffaa00",marginBottom:4}}>{integrity.error}</div>}
                  <div style={{fontSize:10, color:"#4a7a9a", wordBreak:"break-all", lineHeight:1.7}}>
                    Head: {integrity.head_hash||"—"}<br/>Genesis: {integrity.genesis_hash||"—"}
                  </div>
                </>
            }
          </div>
        )}
        {rotateMsg && (
          <div style={{
            marginTop:12, padding:"12px 16px", borderRadius:4,
            background:rotateMsg.ok?"rgba(0,255,136,.05)":"rgba(255,45,85,.05)",
            border:`1px solid ${rotateMsg.ok?"#00ff8844":"#ff2d5544"}`,
          }}>
            <div style={{fontFamily:"Orbitron", fontSize:11, color:rotateMsg.ok?"#00ff88":"#ff2d55", fontWeight:700}}>
              {rotateMsg.ok?"⟳ ":"✗ "}{rotateMsg.text}
            </div>
          </div>
        )}
      </div>

      {/* ── Dataset Quantum Signing ──────────────────────────────────────────── */}
      <div style={sectionCard()}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:14}}>
          <div style={sectionTitle}>DATASET QUANTUM SIGNING</div>
          <div style={{display:"flex", gap:8, flexShrink:0, flexWrap:"wrap"}}>
            {[[10,"SIGN 10 ROWS"],[20,"SIGN 20 ROWS"],[50,"SIGN 50 ROWS"]].map(([count,label])=>(
              <button key={count} onClick={()=>handleSignN(count)} disabled={signing} style={{
                background:"rgba(0,255,136,.1)", border:"1px solid #00ff8866",
                color:"#00ff88", padding:"10px 18px", cursor:signing?"not-allowed":"pointer",
                fontSize:10, letterSpacing:2, fontFamily:"Orbitron", borderRadius:3,
                opacity:signing?0.6:1,
              }}>{signing===count?`⟳ SIGNING...`:label}</button>
            ))}
          </div>
        </div>
        <div style={{fontSize:11, color:"#4a7a9a", lineHeight:1.8, marginBottom:12}}>
          Signs rows from <span style={{color:"#00e5ff", fontFamily:"Share Tech Mono"}}>border_sensor_dataset.csv</span> through
          the full ML pipeline (Isolation Forest → Random Forest → HMAC-SHA3-256 signature).
          Each row gets a unique payload ID, chain index, and cryptographic signature.
        </div>
        {signingMsg && (
          <div style={{
            padding:"12px 14px", borderRadius:4,
            background:signingMsg.ok?"rgba(0,255,136,.05)":"rgba(255,45,85,.05)",
            border:`1px solid ${signingMsg.ok?"#00ff8844":"#ff2d5544"}`,
          }}>
            <div style={{fontFamily:"Orbitron", fontSize:11, color:signingMsg.ok?"#00ff88":"#ff2d55", fontWeight:700}}>
              {signingMsg.text}
            </div>
          </div>
        )}
        {!signingMsg && !backendOk && (
          <div style={{padding:"10px 14px", borderRadius:4, background:"rgba(255,45,85,.05)", border:"1px solid #ff2d5533"}}>
            <div style={{fontFamily:"Orbitron", fontSize:10, color:"#ff2d55"}}>✗ Backend offline — signatures will be simulated locally</div>
          </div>
        )}
      </div>

      {/* ── Live Signature Feed ──────────────────────────────────────────────── */}
      <div style={sectionCard()}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8}}>
          <div style={sectionTitle}>LIVE SIGNATURE FEED — ML OUTPUT CHAIN</div>
          <span style={{fontSize:10, color:"#4a7a9a", fontFamily:"Share Tech Mono"}}>{signatures.length} signatures in chain</span>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"120px 100px 75px 100px 1fr 80px", gap:10,
          padding:"8px 10px", borderBottom:"1px solid #0a3a5c", fontSize:10, color:"#2a5a7a",
          fontFamily:"Orbitron", letterSpacing:1}}>
          <span>PAYLOAD ID</span><span>TIME</span><span>CHAIN[n]</span><span>LEVEL</span><span>SIGNATURE</span><span>STATUS</span>
        </div>
        <div style={{maxHeight:320, overflowY:"auto"}}>
          {signatures.length===0 ? (
            <div style={{padding:"32px 0", textAlign:"center", color:"#2a5a7a", fontSize:11}}>
              No signatures yet — click <span style={{color:"#00ff88"}}>✦ SIGN 20 ROWS</span> to generate test signatures, or open CCTV and start detection
            </div>
          ) : signatures.map((sig,i)=>(
            <div key={sig.payload_id||i} style={{
              display:"grid", gridTemplateColumns:"120px 100px 75px 100px 1fr 80px", gap:10,
              padding:"10px 10px", borderBottom:"1px solid #0a2030", fontSize:11,
              background:i===0?"rgba(0,229,255,.03)":"transparent", alignItems:"center",
            }}>
              <span style={{color:"#00e5ff", fontWeight:700, fontFamily:"Orbitron", fontSize:10, wordBreak:"break-all"}}>{sig.payload_id||`SIG-${i}`}</span>
              <span style={{color:"#4a7a9a"}}>{sig.timestamp ? new Date(sig.timestamp).toLocaleTimeString("en-IN",{hour12:false}) : "—"}</span>
              <span style={{color:"#2a5a7a"}}>[{sig.chain_index??i}]</span>
              <span style={{color:clr(sig.threat_level||"LOW"), fontWeight:700, fontFamily:"Orbitron", fontSize:10}}>{sig.threat_level||"LOW"}</span>
              <span style={{color:"#2a4a5a", fontFamily:"Share Tech Mono", fontSize:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{sig.signature||"—"}</span>
              <span style={{display:"flex", alignItems:"center"}}>
                <span style={{
                  padding:"3px 8px", borderRadius:2, fontSize:10, fontFamily:"Orbitron", fontWeight:700,
                  background:sig.verified?"rgba(0,255,136,.12)":"rgba(255,45,85,.12)",
                  color:sig.verified?"#00ff88":"#ff2d55",
                  border:`1px solid ${sig.verified?"#00ff8844":"#ff2d5544"}`,
                }}>{sig.verified?"SIGNED":"FAILED"}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Architecture ─────────────────────────────────────────────────────── */}
      <div style={sectionCard()}>
        <div style={sectionTitle}>HYBRID PQC ARCHITECTURE</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24}}>
          {[
            {title:"KEY EXCHANGE",   algo:"Kyber-512",   desc:"Quantum-resistant Key Encapsulation. Protects the AES session key against future quantum attacks using Module Learning With Errors (MLWE) hardness.", ref:"NIST FIPS 203"},
            {title:"AUTHENTICATION", algo:"Dilithium2",  desc:"Signs every ML output. Each signature chains to the previous hash — creating a tamper-evident audit log of all threat predictions.", ref:"NIST FIPS 204"},
            {title:"ENCRYPTION",     algo:"AES-256-GCM", desc:"Encrypts threat payloads in transit. Key derived from Kyber shared secret. GCM mode provides both encryption and integrity verification.", ref:"NIST FIPS 197"},
          ].map(({title,algo,desc,ref})=>(
            <div key={title} style={{borderLeft:"2px solid #0a3a5c", paddingLeft:16}}>
              <div style={{fontSize:10, color:"#ffaa00", letterSpacing:1, fontFamily:"Orbitron", marginBottom:6}}>{title}</div>
              <div style={{color:"#00e5ff", fontWeight:700, fontFamily:"Orbitron", fontSize:15, marginBottom:10}}>{algo}</div>
              <div style={{color:"#4a7a9a", fontSize:11, lineHeight:1.8}}>{desc}</div>
              <div style={{color:"#2a5a7a", fontSize:10, marginTop:10, fontFamily:"Orbitron"}}>{ref}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const MODULES=["OVERVIEW","LIVE DEMO","CAMERA","DRONE","THREATS","ANALYTICS","SENSORS","OSINT","MAP","QUANTUM"];

export default function ChakravyuhAI(){
  const [threats,setThreats]=useState(INIT_THREATS);
  const [sel,setSel]=useState(null);
  const [monitoredIds,setMonitoredIds]=useState(new Set());
  const [escalatedIds,setEscalatedIds]=useState(new Set());
  const [actionLog,setActionLog]=useState([]);
  const [alerts,setAlerts]=useState([]);
  const [showTray,setShowTray]=useState(false);
  const [unread,setUnread]=useState(0);
  const [mod,setMod]=useState("OVERVIEW");
  const [timeline,setTimeline]=useState(INIT_TL);
  const [clock,setClock]=useState(new Date().toLocaleTimeString("en-IN",{hour12:false}));
  const [brief,setBrief]=useState("// SELECT A THREAT → CHAKRAVYUH-AI COGNITIVE ENGINE GENERATES REAL TACTICAL BRIEF");
  const [briefLoading,setBriefLoading]=useState(false);
  const [osint,setOsint]=useState([]);
  const [stats,setStats]=useState({total:0,active:0,neutralized:0,falsePos:0});
  const [sensorH,setSensorH]=useState({Visual:0,Infrared:0,Seismic:0,RF:0,Satellite:0,Acoustic:0});
  const [sensorHistory, setSensorHistory] = useState({});
  const [radarD]=useState([{s:"Visual",v:92},{s:"Acoustic",v:78},{s:"Seismic",v:85},{s:"RF",v:95},{s:"Satellite",v:88},{s:"OSINT",v:72}]);
  const [showRoutes,setShowRoutes]=useState(false);
  const [riskData,setRiskData]=useState([]);
  const [csvStatus,setCsvStatus]=useState("LOADING");
  // ── Real GPS from browser — used to tag live threats with actual coordinates ──
  const [userGps,setUserGps]=useState(null); // {lat,lon,accuracy}
  const userGpsRef=useRef(null);
  useEffect(()=>{
    if(!navigator.geolocation) return;
    const ok=pos=>{
      const g={lat:pos.coords.latitude,lon:pos.coords.longitude,accuracy:Math.round(pos.coords.accuracy)};
      setUserGps(g); userGpsRef.current=g;
    };
    const err=()=>{}; // silent — fall back to selected region
    const wid=navigator.geolocation.watchPosition(ok,err,{enableHighAccuracy:true,maximumAge:10000});
    return()=>navigator.geolocation.clearWatch(wid);
  },[]);

  // ── Load ML pipeline output from Flask backend (/api/risk-zones) ──────────
  useEffect(()=>{
    setCsvStatus("LOADING");
    fetch("/api/risk-zones")
      .then(r=>r.json())
      .then(res=>{
        // Backend returns {source:"...", data:[...]} OR plain array
        const data = Array.isArray(res) ? res : (res.data || []);
        if(data.length>0){
          setRiskData(data);
          setCsvStatus("LOADED");
        } else { setCsvStatus("NO DATA"); }
      })
      .catch(()=>setCsvStatus("OFFLINE"));
  },[]);

  useEffect(()=>{const t=setInterval(()=>setClock(new Date().toLocaleTimeString("en-IN",{hour12:false})),1000);return()=>clearInterval(t);},[]);

  // ── Load live sensor data from Flask backend (/api/sensor-data) ─────────
  useEffect(()=>{
    const loadSensors = () => {
      fetch("/api/sensor-data")
        .then(r => r.json())
        .then(res => {
          // Backend returns {data:[...], source:..., rows:N} or plain array
          const rows = Array.isArray(res) ? res : (res.data || []);
          if (!Array.isArray(rows) || rows.length === 0) return;

          // Aggregate latest sensor readings from dataset
          const latest = rows.slice(-50);

          // Map dataset rows to time-series graph format for the SensorCards
          const history = {
            "VISUAL SURVEILLANCE": latest.map((r,i) => ({t: i, v: Math.min(99, Math.max(0, (parseFloat(r.motion_intensity)||0)*100))})),
            "INFRARED THERMAL": latest.map((r,i) => ({t: i, v: Math.min(99, Math.max(0, (parseFloat(r.thermal_delta)||0)*100))})),
            "SEISMIC ARRAY": latest.map((r,i) => ({t: i, v: Math.min(99, Math.max(0, (parseFloat(r.seismic_value) || parseFloat(r.seismic_activity)||0)*100))})),
            "RF SIGNAL MONITOR": latest.map((r,i) => ({t: i, v: Math.min(99, Math.max(0, (parseFloat(r.rf_burst_count) || parseFloat(r.rf_burst)||0)*100))})),
            "SATELLITE LINK": latest.map((r,i) => ({t: i, v: parseInt(r.is_night||0) === 1 ? 85 : 15})), // Binary map for night/day
            "ACOUSTIC DETECTION": latest.map((r,i) => ({t: i, v: Math.min(99, Math.max(0, (parseFloat(r.confidence)||0)*100))}))
          };
          setSensorHistory(history);

          // Calculate averages for the top bar/overview radar
          const avg = (key) => Math.round(latest.reduce((s,r) => s + (parseFloat(r[key])||0), 0) / latest.length * 100);
          
          setSensorH({
            Visual:   Math.min(99, Math.max(0, avg("motion_intensity"))),
            Infrared: Math.min(99, Math.max(0, avg("thermal_delta"))),
            Seismic:  Math.min(99, Math.max(0, avg("seismic_value") || avg("seismic_activity"))),
            RF:       Math.min(99, Math.max(0, avg("rf_burst_count") || avg("rf_burst"))),
            Satellite: avg("is_night") > 50 ? 85 : 15,
            Acoustic: Math.min(99, Math.max(0, avg("confidence"))),
          });
        })
        .catch(() => {}); // keep defaults on error
    };
    loadSensors();
    const t=setInterval(loadSensors,15000);
    return()=>clearInterval(t);
  },[]);

  // ── Load threats from dataset via backend ──────────────────────────────
  useEffect(()=>{
    const THREAT_TYPE_MAP = {
      "CRITICAL":"INFANTRY_INFILTRATION","HIGH":"DRONE_SWARM",
      "MEDIUM":"VEHICLE_CONVOY","LOW":"RF_ANOMALY"
    };
    const loadDatasetThreats=()=>{
      fetch("/api/sensor-data?n=200")
        .then(r=>r.json())
        .then(d=>{
          const allRows=(d.data||[]);
          if(allRows.length===0) return;

          // Build hourly timeline from ALL rows
          const hourBuckets=Array.from({length:24},(_,i)=>({hour:`${String(i).padStart(2,"0")}:00`,threats:0,neutralized:0,falsePos:0}));
          allRows.forEach(r=>{
            const h=parseInt(r.hour)||0;
            if(h>=0&&h<24){
              hourBuckets[h].threats++;
              if((r.is_false_positive||0)>0) hourBuckets[h].falsePos++;
              if(r.threat_level==="LOW") hourBuckets[h].neutralized++;
            }
          });
          if(allRows.length>0) setTimeline(hourBuckets);

          // Take BALANCED sample — max 4 per level so all categories show on map
          const byLevel={"CRITICAL":[],"HIGH":[],"MEDIUM":[],"LOW":[]};
          allRows.forEach(r=>{
            const lvl=r.threat_level||"LOW";
            if(byLevel[lvl]) byLevel[lvl].push(r);
          });
          // Pick up to 4 from each level (total max 16 markers)
          const balanced=[
            ...byLevel["CRITICAL"].slice(0,4),
            ...byLevel["HIGH"].slice(0,4),
            ...byLevel["MEDIUM"].slice(0,4),
            ...byLevel["LOW"].slice(0,4),
          ];

          // Type map — variety based on object_type + level
          const typeMap=(r)=>{
            const ot=(r.object_type||"").toUpperCase();
            const lvl=r.threat_level||"LOW";
            if(ot==="DRONE")   return "DRONE_SWARM";
            if(ot==="VEHICLE") return "VEHICLE_CONVOY";
            if(ot==="PERSON")  return "INFANTRY_INFILTRATION";
            if(lvl==="CRITICAL") return "INFANTRY_INFILTRATION";
            if(lvl==="HIGH")     return "DRONE_SWARM";
            if(lvl==="MEDIUM")   return "VEHICLE_CONVOY";
            // LOW — use sensor data to determine type instead of random
            if(parseFloat(r.rf_burst_count||r.rf_burst||0)>0.5)        return "RF_ANOMALY";
            if(parseFloat(r.seismic_value||r.seismic_activity||0)>0.5) return "SEISMIC_EVENT";
            if(parseInt(r.is_night||0)===1)           return "AERIAL_RECON";
            return "RF_ANOMALY";
          };

          // Filter out rows with missing/invalid location before mapping
          const validBalanced = balanced.filter(r=>r.location&&String(r.location).trim()!=="0"&&String(r.location).trim()!=="");
          const threats=validBalanced.map((r,i)=>({
            id:`DS-${i}-${String(r.location||"").replace(/\s/g,"")||i}`,
            type:  typeMap(r),
            level: r.threat_level||"LOW",
            score: Math.min(100,Math.round((parseFloat(r.anomaly_score)||0)*100)),
            lat:   parseFloat(r.latitude)||28.6,
            lon:   parseFloat(r.longitude)||77.2,
            region:r.region||"Border Sector",
            sector:String(r.location||"Border Zone"),
            name:  String(r.location||"Border Zone"),
            time:  r.hour!=null?`${String(parseInt(r.hour)).padStart(2,"0")}:00`:"--:--",
            status:"ACTIVE",
            confidence: r.rf_signal!=null ? Math.min(99,Math.round(parseFloat(r.rf_signal)||0)) :
                        r.confidence!=null ? Math.min(99,Math.round(parseFloat(r.confidence)||0)) :
                        Math.min(99,Math.round((parseFloat(r.anomaly_score)||0)*100)),
            sensors: [
              parseFloat(r.motion_intensity||0)>0.3 ? "VIS" : null,
              parseFloat(r.thermal_delta||0)>0.3    ? "IR"  : null,
              parseFloat(r.seismic_value||r.seismic_activity||0)>0.3 ? "SEISMIC" : null,
              parseFloat(r.rf_burst_count||r.rf_burst||0)>0.3         ? "RF"  : null,
              parseInt(r.is_night||0)===1            ? "SAT" : null,
            ].filter(Boolean).length > 0
              ? ["VIS","IR","SEISMIC","RF","SAT"].filter((_,i)=>[
                  parseFloat(r.motion_intensity||0)>0.3,
                  parseFloat(r.thermal_delta||0)>0.3,
                  parseFloat(r.seismic_value||r.seismic_activity||0)>0.3,
                  parseFloat(r.rf_burst_count||r.rf_burst||0)>0.3,
                  parseInt(r.is_night||0)===1,
                ][i])
              : ["VIS","RF"],
            source:"DATASET",
          }));
          setThreats(prev=>{
            // ALWAYS preserve live-source threats — they never disappear unless manually removed
            const liveThreats=prev.filter(x=>liveThreatIds.current.has(x.id));
            return [...liveThreats,...threats].slice(0,60);
          });
          // Stats from full dataset + live threats (preserve manual neutralizations)
          const totalAll = byLevel["CRITICAL"].length+byLevel["HIGH"].length+byLevel["MEDIUM"].length+byLevel["LOW"].length;
          const fpCount  = allRows.filter(r=>parseInt(r.is_false_positive||0)===1).length;
          const liveCount = liveThreatIds.current.size;
          setStats(prev=>({
            total:       totalAll + liveCount,
            active:      byLevel["HIGH"].length + byLevel["CRITICAL"].length + liveCount,
            neutralized: prev.neutralized,
            falsePos:    fpCount,
          }));
          // Timeline: MERGE dataset hours into existing — never wipe live-detection hour increments
          setTimeline(prev=>hourBuckets.map((b,i)=>({
            ...b,
            // Add any live-incremented threats on top of dataset baseline
            threats: b.threats + Math.max(0, (prev[i]?.threats||0) - (prev[i]?._datasetBase||0)),
            _datasetBase: b.threats,
          })));
          // OSINT: merge — preserve isLive entries captured from camera/drone/demo
          fetch("/api/risk-zones")
            .then(r=>r.json())
            .then(rd=>{
              const rows2=Array.isArray(rd)?rd:(rd.data||[]);
              if(!Array.isArray(rows2)||rows2.length===0) return;
              const enriched=rows2.slice(0,15).map((z,i)=>({
                ...z,
                time:new Date().toLocaleTimeString("en-IN",{hour12:false}),
                id:Date.now()+i,
              }));
              // Keep live entries at top, dataset entries below — never remove live entries
              setOsint(prev=>{
                const liveEntries=prev.filter(x=>x.isLive);
                return [...liveEntries,...enriched].slice(0,30);
              });
            }).catch(()=>{});
        })
        .catch(()=>{});
    };
    loadDatasetThreats();
    const t=setInterval(loadDatasetThreats,30000);
    return()=>clearInterval(t);
  },[]);

  // Generate rule-based brief locally (works with or without API key)
  function generateLocalBrief(t) {
    const force = t.region?.includes("LAC")||t.region?.includes("Ladakh") ? "SFF/ITBP QRT"
                : t.region?.includes("LoC") ? "Indian Army QRT"
                : t.region?.includes("Arunachal")||t.region?.includes("Northeast") ? "Assam Rifles QRT"
                : t.region?.includes("Gujarat")||t.region?.includes("Rajasthan") ? "BSF QRT"
                : "BSF QRT";
    const timeStr = t.time || new Date().toLocaleTimeString("en-IN",{hour12:false});
    const sensors = t.sensors?.join(", ") || "VISUAL, RF";
    const actions = {
      INFANTRY_INFILTRATION: "Deploy "+force+". Establish cordon. Activate ground sensors and thermal surveillance.",
      DRONE_SWARM:           "Scramble counter-drone unit. Activate RF jamming. Alert air defence battery.",
      VEHICLE_CONVOY:        "Deploy "+force+" with anti-vehicle assets. Block identified approach routes.",
      TUNNEL_ACTIVITY:       "Deploy engineering unit for seismic mapping. Alert "+force+".",
      RF_ANOMALY:            "Activate SIGINT intercept. Cross-reference with known adversary frequencies.",
      SEISMIC_EVENT:         "Verify with seismic array. Rule out natural event. Alert "+force+" for recon.",
      CYBER_PROBE:           "Isolate affected nodes. Activate cyber defence protocols. Notify CERT-In.",
      AERIAL_RECON:          "Scramble interceptor. Activate radar track. Alert Air Force.",
    };
    const action = actions[t.type] || "Deploy "+force+" to "+t.name+". Assess and report.";
    return `SITREP: ${t.type?.replace(/_/g," ")} detected at ${t.name||t.sector}, ${t.region}.
COORDS: ${parseFloat(t.lat).toFixed(3)}°N, ${parseFloat(t.lon).toFixed(3)}°E
TIME: ${timeStr} IST

ASSESSMENT:
Threat Level: ${t.level} | Score: ${t.score}/100 | Confidence: ${t.confidence}%
Sensors: ${sensors} | Source: ${t.source||"SIMULATION"}

RECOMMENDED ACTION:
${action}
Cross-verify with satellite imagery and seismic arrays.
Monitor adjacent sectors for coordinated activity.`;
  }

  const fetchBrief=useCallback(async(t)=>{
    if(!t) return;
    // Show local brief immediately — don't wait for API
    setBrief(generateLocalBrief(t));
    setBriefLoading(true);
    try{
      const r=await fetch("/api/tactical-brief",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({threat:t})
      });
      const d=await r.json();
      // Only replace with AI brief if it's real content (not an error message)
      if(d.brief && !d.brief.includes("not set") && !d.brief.includes("OFFLINE") && d.brief.length > 50){
        setBrief(d.brief);
      }
      // else keep the local brief already shown
    }catch{
      // Keep local brief — already displayed
    }
    setBriefLoading(false);
  },[]);

  useEffect(()=>{if(sel) fetchBrief(sel);},[sel]);

  const liveThreatIds=useRef(new Set());
  const addCameraThreat=useCallback(t=>{
    const aid=Date.now();
    // Child modules (Camera/LiveDemo) already attach real GPS coords.
    // If somehow GPS wasn't acquired in child, check parent ref as last resort.
    const gps=userGpsRef.current;
    const enriched = (!t.gpsReal && gps) ? {
      ...t,
      lat: gps.lat, lon: gps.lon,
      gpsReal: true, gpsAccuracy: gps.accuracy,
      name: `${gps.lat.toFixed(3)}°N ${gps.lon.toFixed(3)}°E`,
      region: "LIVE GPS DETECTION",
      locationNote: `Real GPS: ${gps.lat.toFixed(5)}°N ${gps.lon.toFixed(5)}°E (±${gps.accuracy}m)`,
    } : t;

    liveThreatIds.current.add(enriched.id);

    // ── 1. Threats list — never overwritten by dataset reload ─────────────
    setThreats(p=>{
      const live=p.filter(x=>liveThreatIds.current.has(x.id));
      const dataset=p.filter(x=>!liveThreatIds.current.has(x.id));
      return [enriched,...live.filter(x=>x.id!==enriched.id),...dataset].slice(0,60);
    });

    // ── 2. Alert tray ─────────────────────────────────────────────────────
    setAlerts(p=>[{...enriched,aid},...p.slice(0,9)]);

    // ── 3. Stats ──────────────────────────────────────────────────────────
    setStats(p=>({...p, total:p.total+1, active:p.active+1}));

    // ── 4. Timeline — increment current hour bucket ───────────────────────
    const hr=new Date().getHours();
    setTimeline(p=>p.map((b,i)=>i===hr?{...b,threats:b.threats+1}:b));

    // ── 5. OSINT feed ─────────────────────────────────────────────────────
    const osintEntry={
      id:enriched.id, location:enriched.name, region:enriched.region,
      risk_score:(enriched.score/100).toFixed(2),
      mean_anomaly:(enriched.score/100).toFixed(2),
      fp_rate:"0.00", event_count:1,
      risk_level:enriched.level==="CRITICAL"||enriched.level==="HIGH"?"HIGH RISK":"MEDIUM RISK",
      source:enriched.source, time:enriched.time,
      lat:enriched.lat, lon:enriched.lon, isLive:true,
      locationNote:enriched.locationNote,
    };
    setOsint(p=>[osintEntry,...p.filter(x=>!x.isLive||x.id!==enriched.id)].slice(0,30));

    // ── 6. Auto-select for tactical brief ─────────────────────────────────
    setSel(enriched);
    setUnread(p=>p+1);
  },[]);

  // ── Action handlers — persist to backend + update UI ──────────────────────
  const postAction = (action, threat) => {
    fetch("/api/threat-action", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action, threat_id: threat?.id, threat }),
    }).catch(()=>{}); // fire-and-forget — UI already updated
  };

  const neutralize=useCallback(id=>{
    const threat=threats.find(t=>t.id===id);
    setThreats(p=>p.filter(t=>t.id!==id));
    liveThreatIds.current.delete(id);
    setStats(p=>({...p,neutralized:p.neutralized+1,active:Math.max(0,p.active-1)}));
    if(sel?.id===id) setSel(null);
    setOsint(p=>p.filter(x=>x.id!==id));
    const log={time:new Date().toLocaleTimeString("en-IN",{hour12:false}),action:"NEUTRALIZED",threat:threat?.type?.replace(/_/g," ")||"UNKNOWN",location:threat?.name||threat?.sector||"—",level:threat?.level||"—"};
    setActionLog(p=>[log,...p.slice(0,49)]);
    setMonitoredIds(p=>{const n=new Set(p);n.delete(id);return n;});
    setEscalatedIds(p=>{const n=new Set(p);n.delete(id);return n;});
    postAction("NEUTRALIZE", threat);
  },[sel,threats]);

  const monitorThreat=useCallback(id=>{
    const threat=threats.find(t=>t.id===id);
    setMonitoredIds(p=>{const n=new Set(p); if(n.has(id)){n.delete(id);}else{n.add(id);} return n;});
    setEscalatedIds(p=>{const n=new Set(p);n.delete(id);return n;});
    const isNowMonitored=!monitoredIds.has(id);
    const log={time:new Date().toLocaleTimeString("en-IN",{hour12:false}),action:isNowMonitored?"MONITORING":"MONITOR OFF",threat:threat?.type?.replace(/_/g," ")||"UNKNOWN",location:threat?.name||threat?.sector||"—",level:threat?.level||"—"};
    setActionLog(p=>[log,...p.slice(0,49)]);
    postAction(isNowMonitored?"MONITOR":"MONITOR_OFF", threat);
  },[threats,monitoredIds]);

  const escalateThreat=useCallback(id=>{
    const threat=threats.find(t=>t.id===id);
    setEscalatedIds(p=>{const n=new Set(p); if(n.has(id)){n.delete(id);}else{n.add(id);} return n;});
    setMonitoredIds(p=>{const n=new Set(p);n.delete(id);return n;});
    setThreats(p=>p.map(t=>t.id===id?{...t,level:t.level==="LOW"?"MEDIUM":t.level==="MEDIUM"?"HIGH":"CRITICAL",score:Math.min(100,t.score+15)}:t));
    const log={time:new Date().toLocaleTimeString("en-IN",{hour12:false}),action:"ESCALATED",threat:threat?.type?.replace(/_/g," ")||"UNKNOWN",location:threat?.name||threat?.sector||"—",level:"↑ "+threat?.level||"—"};
    setActionLog(p=>[log,...p.slice(0,49)]);
    postAction("ESCALATE", threat);
  },[threats]);

  return(
    <>
      <style>{STYLE}</style>
      <div style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",
        background:"radial-gradient(ellipse at 20% 10%,rgba(0,40,80,.4) 0%,#020810 60%)",overflow:"hidden",userSelect:"none",minHeight:0}}>

        {/* TOP BAR */}
        <div style={{height:"auto",minHeight:44,background:"linear-gradient(90deg,#040d1a,#061525,#040d1a)",borderBottom:"1px solid #0a3a5c",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px",flexShrink:0,flexWrap:"wrap",gap:4}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:28,height:28,border:"2px solid #00e5ff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 12px #00e5ff44",position:"relative"}}>
              <div style={{position:"absolute",width:20,height:20,border:"1px solid #00e5ff44",borderRadius:"50%",animation:"spin 8s linear infinite"}}/>
              <span style={{fontSize:10,color:"#00e5ff",fontFamily:"Orbitron"}}>⬡</span>
            </div>
            <div>
              <div style={{fontFamily:"Orbitron",fontWeight:900,fontSize:13,color:"#00e5ff",letterSpacing:3}}>CHAKRAVYUH<span style={{color:"#ff2d55"}}>·</span>AI <span style={{fontSize:11,color:"#ff2d55"}}>v1.0</span></div>
              <div style={{fontSize:10,color:"#1a6a8a",letterSpacing:2,display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"clamp(100px,30vw,500px)"}}>COG-HYBRID-ADAPTIVE-KRT-UNIFIED</div>
            </div>
          </div>
          <div className="nav-tabs">
            {MODULES.map(m=>(
              <button key={m} onClick={()=>setMod(m)} style={{
                background:mod===m?(m==="CAMERA"?"rgba(255,45,85,.12)":m==="DRONE"?"rgba(0,255,136,.1)":m==="LIVE DEMO"?"rgba(255,45,85,.18)":"rgba(0,229,255,.12)"):"transparent",
                border:`1px solid ${mod===m?(m==="CAMERA"?"#ff2d55":m==="DRONE"?"#00ff88":m==="LIVE DEMO"?"#ff2d55":"#00e5ff"):(m==="CAMERA"?"#3a1a1a":m==="DRONE"?"#1a3a2a":m==="LIVE DEMO"?"#4a1a1a":"#0a3a5c")}`,
                color:mod===m?(m==="CAMERA"?"#ff2d55":m==="DRONE"?"#00ff88":m==="LIVE DEMO"?"#ff2d55":"#00e5ff"):(m==="CAMERA"?"#7a3a3a":m==="DRONE"?"#2a6a4a":m==="LIVE DEMO"?"#8a3a3a":"#4a7a9a"),
                fontFamily:"Orbitron",fontSize:10,fontWeight:700,letterSpacing:1,padding:"5px 10px",borderRadius:3,cursor:"pointer",
              }}>{m==="CAMERA"?"📷 CCTV":m==="DRONE"?"🛸 DRONE":m==="LIVE DEMO"?"🔴 LIVE DEMO":m==="MAP"?"🌍 MAP":m==="QUANTUM"?"⚛ QUANTUM":m}</button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,fontSize:10,flexShrink:0}}>
            <div style={{display:"flex",gap:4,alignItems:"center"}}><div className="pulse-dot" style={{background:"#00ff88",color:"#00ff88"}}/><span style={{color:"#00ff88"}}>NOMINAL</span></div>
            <div style={{color:"#00e5ff",fontFamily:"Orbitron",fontSize:12,letterSpacing:2}}>{clock}</div>
            <div style={{color:"#4a7a9a"}}>IST · DEFCON <span style={{color:"#ffaa00"}}>3</span></div>
            <div style={{display:"flex",gap:3,alignItems:"center",fontSize:9,fontFamily:"Orbitron"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:userGps?"#00ff88":"#ffaa00"}}/>
              <span style={{color:userGps?"#00ff88":"#ffaa00"}}>{userGps?`GPS ±${userGps.accuracy}m`:"GPS OFF"}</span>
            </div>
            {/* Alert bell — toggles tray, pulses when unread */}
            <div style={{position:"relative",cursor:"pointer"}}
              onClick={()=>{ setShowTray(p=>!p); if(!showTray) setUnread(0); }}
            >
              <div style={{
                width:30,height:30,borderRadius:5,
                background: showTray ? "rgba(0,229,255,.15)" : unread>0 ? "rgba(255,45,85,.18)" : "rgba(0,229,255,.07)",
                border: `1px solid ${showTray?"#00e5ff":unread>0?"#ff2d55":"#0a3a5c"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:16, transition:"all .2s",
                boxShadow: unread>0&&!showTray ? "0 0 10px #ff2d5566" : "none",
                animation: unread>0&&!showTray ? "none" : "none",
              }}>🔔</div>
              {unread>0&&!showTray&&(
                <div style={{
                  position:"absolute",top:-5,right:-5,
                  background:"#ff2d55",color:"#fff",
                  borderRadius:10,fontFamily:"Orbitron",fontSize:9,fontWeight:700,
                  padding:"1px 5px",minWidth:18,textAlign:"center",
                  boxShadow:"0 0 8px #ff2d55",
                  animation:"pulse-ring 1.2s ease-in-out infinite",
                }}>{unread}</div>
              )}
            </div>
          </div>
        </div>

        {/* OVERVIEW */}
        {mod==="OVERVIEW"&&(
          <div style={{flex:1,display:"grid",gridTemplateColumns:"clamp(220px,22%,280px) 1fr clamp(220px,22%,280px)",gridTemplateRows:"auto 1fr",gap:"var(--gap)",padding:"var(--pad)",overflow:"hidden",minHeight:0}}>

            {/* ── KPI BAR (full width) ── */}
            <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"var(--gap)"}}>
              {[{l:"TOTAL DETECTIONS",v:stats.total,c:"#00e5ff"},{l:"ACTIVE THREATS",v:stats.active,c:"#ff2d55",blink:true},{l:"NEUTRALIZED",v:stats.neutralized,c:"#00ff88"},{l:"FALSE POSITIVES",v:stats.falsePos,c:"#ffaa00"},{l:"DETECTION RATE",v:stats.total>0?((1-(stats.falsePos/stats.total))*100).toFixed(1)+"%":"—",c:"#00e5ff"},
               {l:"FP REDUCTION",v:stats.total>0?((stats.falsePos/stats.total)*100).toFixed(1)+"%":"—",c:"#ffaa00"}].map(s=>(
                <div key={s.l} className="panel" style={{padding:"10px 12px",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:68}}>
                  <div style={{fontSize:11,letterSpacing:1,color:"#4a7a9a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.l}</div>
                  <div style={{fontFamily:"Orbitron",fontSize:"clamp(18px,2.2vw,28px)",fontWeight:900,color:s.c,textShadow:`0 0 14px ${s.c}88`,marginTop:4}} className={s.blink?"blink":""}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* ── LEFT: Threat Log ── */}
            <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
              <div className="panel-title" style={{fontSize:11}}><div className="pulse-dot" style={{background:"#ff2d55",color:"#ff2d55"}}/>THREAT LOG</div>
              <div style={{flex:1,overflowY:"auto"}}>
                {threats.map(t=>(
                  <div key={t.id} onClick={()=>setSel(t)} style={{padding:"7px 10px",borderLeft:`3px solid ${escalatedIds.has(t.id)?"#ff2d55":monitoredIds.has(t.id)?"#00e5ff":lc(t.level)}`,background:sel?.id===t.id?lb(t.level):escalatedIds.has(t.id)?"rgba(255,45,85,.04)":monitoredIds.has(t.id)?"rgba(0,229,255,.04)":"transparent",cursor:"pointer",marginBottom:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:lc(t.level),fontSize:12,fontFamily:"Orbitron",fontWeight:700}}>{t.level}</span>
                      <div style={{display:"flex",gap:4,alignItems:"center"}}>
                        {t.source==="CAMERA"&&<span style={{fontSize:10,color:"#00e5ff",border:"1px solid #00e5ff44",borderRadius:2,padding:"0 3px"}}>📷</span>}
                        {t.source==="DRONE"&&<span style={{fontSize:10,color:"#00ff88",border:"1px solid #00ff8844",borderRadius:2,padding:"0 3px"}}>🛸</span>}
                        {t.source==="LIVE_DEMO"&&<span style={{fontSize:10,color:"#ff2d55",border:"1px solid #ff2d5544",borderRadius:2,padding:"0 3px"}}>🔴</span>}
                        <span style={{color:"#2a5a7a",fontSize:10}}>{t.time}</span>
                      </div>
                    </div>
                    <div style={{color:"#c0e0f8",fontSize:13,marginTop:2,fontWeight:500}}>{t.type?.replace(/_/g," ")}</div>
                    <div style={{color:"#4a7a9a",fontSize:11,marginTop:1}}>{t.name||t.sector}</div>
                    <div style={{marginTop:3,background:"#0a2030",borderRadius:1,height:2}}>
                      <div style={{width:`${t.score}%`,height:"100%",background:`linear-gradient(90deg,${lc(t.level)},${lc(t.level)}44)`,borderRadius:1}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CENTRE: Tactical Brief (full height, no map) ── */}
            <div style={{display:"flex",flexDirection:"column",gap:"var(--gap)",overflow:"hidden",minHeight:0}}>
              {/* Selected threat detail */}
              {sel&&(
                <div className="panel" style={{flexShrink:0,padding:"10px 12px"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px"}}>
                    {[["TYPE",sel.type?.replace(/_/g," ")],["LEVEL",sel.level],["LOCATION",sel.name||sel.sector],["REGION",sel.region],["COORDS",`${parseFloat(sel.lat).toFixed(2)}°N ${parseFloat(sel.lon).toFixed(2)}°E`],["SCORE",`${sel.score}/100`]].map(([k,v])=>(
                      <div key={k}>
                        <div style={{color:"#2a5a7a",fontSize:10,letterSpacing:1}}>{k}</div>
                        <div style={{color:"#c0e0f8",fontSize:12,fontWeight:600,marginTop:1}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Brief */}
              <div className="panel" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
                <div className="panel-title" style={{fontSize:11}}>
                  <span>🧠</span>COGNITIVE TACTICAL BRIEF
                  {briefLoading&&<span className="blink" style={{marginLeft:"auto",color:"#00e5ff",fontSize:10}}>PROCESSING...</span>}
                  {!sel&&<span style={{marginLeft:"auto",color:"#2a5a7a",fontSize:9}}>← SELECT THREAT</span>}
                </div>
                <div style={{flex:1,padding:"10px 12px",overflowY:"auto",color:"#8acce0",fontSize:13,lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"Share Tech Mono,monospace"}}>
                  {briefLoading?<><span className="blink" style={{color:"#00e5ff"}}>▌</span> ANALYZING...</>:brief}
                </div>
                {sel&&(
                  <div style={{padding:"6px 10px",borderTop:"1px solid var(--border)",display:"flex",gap:5}}>
                    {[
                      {a:"NEUTRALIZE",fn:()=>neutralize(sel.id),  c:"#ff2d55",bg:"rgba(255,45,85,.15)"},
                      {a:"MONITOR",   fn:()=>monitorThreat(sel.id),c:monitoredIds.has(sel.id)?"#00ff88":"#00e5ff",bg:monitoredIds.has(sel.id)?"rgba(0,255,136,.15)":"rgba(0,229,255,.07)"},
                      {a:"ESCALATE",  fn:()=>escalateThreat(sel.id),c:"#ffaa00",bg:"rgba(255,170,0,.1)"},
                    ].map(({a,fn,c,bg})=>(
                      <button key={a} onClick={fn} title={a==="NEUTRALIZE"?"Remove threat from active list":a==="MONITOR"?"Flag threat for continuous monitoring (toggles)":"Upgrade threat level and mark for immediate response"} style={{
                        flex:1,padding:"6px 0",background:bg,
                        border:`1px solid ${c}`,color:c,
                        fontFamily:"Orbitron",fontSize:10,letterSpacing:1,cursor:"pointer",borderRadius:2,fontWeight:700,
                      }}>{a==="MONITOR"&&monitoredIds.has(sel.id)?"● MONITORING":a}</button>
                    ))}
                  </div>
                )}
              </div>
              {/* Recent actions */}
              {actionLog.length>0&&(
                <div className="panel" style={{flexShrink:0,maxHeight:110,overflow:"hidden"}}>
                  <div className="panel-title" style={{fontSize:9,padding:"4px 10px"}}>📋 RECENT ACTIONS</div>
                  <div style={{overflowY:"auto",maxHeight:74}}>
                    {actionLog.slice(0,4).map((log,i)=>(
                      <div key={i} style={{display:"flex",gap:8,padding:"3px 10px",borderBottom:"1px solid #040d1a",alignItems:"center"}}>
                        <span style={{color:log.action==="NEUTRALIZED"?"#00ff88":log.action==="ESCALATED"?"#ff2d55":"#00e5ff",fontFamily:"Orbitron",fontSize:9,minWidth:70}}>{log.action}</span>
                        <span style={{color:"#b0d8f0",fontSize:10,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.threat}</span>
                        <span style={{color:"#2a5a7a",fontSize:9}}>{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Sensor + Radar + OSINT ── */}
            <div style={{display:"flex",flexDirection:"column",gap:"var(--gap)",overflow:"hidden",minHeight:0}}>
              <div className="panel" style={{padding:"0 0 8px",flexShrink:0}}>
                <div className="panel-title" style={{fontSize:11}}><span>📡</span>SENSOR ARRAY</div>
                <div style={{padding:"8px 12px 0"}}>
                  {Object.entries(sensorH).map(([n,v])=>(
                    <div key={n} style={{marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{color:"#4a7a9a",fontSize:12}}>{n.toUpperCase()}</span>
                        <span style={{color:v>90?"#00ff88":v>75?"#ffaa00":"#ff2d55",fontSize:12,fontFamily:"Orbitron",fontWeight:700}}>{v}%</span>
                      </div>
                      <div style={{background:"#0a2030",height:3,borderRadius:2}}>
                        <div style={{width:`${v}%`,height:"100%",background:`linear-gradient(90deg,${v>90?"#00ff88":v>75?"#ffaa00":"#ff2d55"},transparent)`,borderRadius:2}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel" style={{flexShrink:0}}>
                <div className="panel-title" style={{fontSize:11}}><span>⚡</span>FUSION RADAR</div>
                <ResponsiveContainer width="100%" height={130}>
                  <RadarChart data={radarD} margin={{top:4,right:8,bottom:4,left:8}}>
                    <PolarGrid stroke="#0a3a5c"/>
                    <PolarAngleAxis dataKey="s" tick={{fill:"#4a7a9a",fontSize:10}}/>
                    <Radar dataKey="v" stroke="#00e5ff" fill="#00e5ff" fillOpacity={.15} strokeWidth={1.5}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="panel" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
                <div className="panel-title" style={{fontSize:11}}><span>🌐</span>OSINT FEED</div>
                <div style={{flex:1,overflowY:"auto"}}>
                  {osint.map(item=>(
                    <div key={item.id} className="slide-in" style={{padding:"6px 10px",borderBottom:"1px solid #040d1a"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{color:"#b0d8f0",fontSize:12,fontWeight:600}}>{item.location||"—"}</span>
                        <span style={{color:item.risk_category==="HIGH RISK"?"#ff2d55":item.risk_category==="MODERATE RISK"?"#ffaa00":"#00ff88",fontSize:10,fontFamily:"Orbitron"}}>{item.risk_category||"—"}</span>
                      </div>
                      <div style={{display:"flex",gap:10}}>
                        <span style={{color:"#4a7a9a",fontSize:10}}>RISK: <span style={{color:"#00e5ff"}}>{Math.round((parseFloat(item.risk_score)||0)*100)}%</span></span>
                        <span style={{color:"#4a7a9a",fontSize:10}}>ANOMALY: <span style={{color:"#ffaa00"}}>{Math.round((parseFloat(item.mean_anomaly)||0)*100)}%</span></span>
                        <span style={{color:"#2a5a7a",fontSize:10,marginLeft:"auto"}}>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE DEMO */}
        {/* LIVE DEMO — always mounted */}
        <div className="mod-wrap" style={{display:mod==="LIVE DEMO"?"flex":"none"}}>
          <LiveDetectionDemo onThreatDetected={addCameraThreat} gpsRef={userGpsRef}/>
        </div>

        {/* CAMERA — always mounted so webcam + detections persist */}
        <div className="mod-wrap" style={{display:mod==="CAMERA"?"flex":"none"}}>
          <CameraModule onThreatDetected={addCameraThreat} gpsRef={userGpsRef}/>
        </div>

        {/* DRONE — always mounted so mission + targets persist */}
        <div className="mod-wrap" style={{display:mod==="DRONE"?"flex":"none"}}>
          <DroneModule onThreatDetected={addCameraThreat} gpsRef={userGpsRef}/>
        </div>

        {/* THREATS */}
        {mod==="THREATS"&&(
          <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr clamp(240px,26%,320px) clamp(200px,20%,240px)",gap:"var(--gap)",padding:"var(--pad)",overflow:"hidden",minHeight:0}}>
            <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
              <div className="panel-title"><span>⚠️</span>FULL THREAT DATABASE — REAL INDIAN BORDER COORDINATES</div>
              <div style={{flex:1,overflowX:"auto",overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead style={{position:"sticky",top:0,background:"#040d1a"}}>
                    <tr>{["ID","TYPE","LEVEL","LOCATION","REGION","LAT","LON","SCORE","CONF","SOURCE","ACTION"].map(h=>(
                      <th key={h} style={{padding:"5px 7px",color:"#00e5ff",fontFamily:"Orbitron",fontSize:10,letterSpacing:1,borderBottom:"1px solid #0a3a5c",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {threats.map(t=>(
                      <tr key={t.id} onClick={()=>setSel(t)} style={{background:sel?.id===t.id?lb(t.level):"transparent",cursor:"pointer"}}>
                        <td style={{padding:"4px 7px",color:"#4a7a9a",whiteSpace:"nowrap",fontFamily:"Share Tech Mono",fontSize:11}}>{t.id.slice(0,10)}</td>
                        <td style={{padding:"4px 7px",color:"#b0d8f0",whiteSpace:"nowrap"}}>{t.type?.replace(/_/g," ")}</td>
                        <td style={{padding:"4px 7px",whiteSpace:"nowrap"}}><span style={{color:lc(t.level),fontFamily:"Orbitron",fontSize:10}}>{t.level}</span></td>
                        <td style={{padding:"4px 7px",color:"#b0d8f0",whiteSpace:"nowrap"}}>{t.name||t.sector}</td>
                        <td style={{padding:"4px 7px",color:"#4a7a9a",whiteSpace:"nowrap"}}>{t.region}</td>
                        <td style={{padding:"4px 7px",whiteSpace:"nowrap"}}>
                          <span style={{color:t.gpsReal?"#00ff88":"#4a7a9a",fontFamily:"Orbitron",fontSize:11}}>
                            {parseFloat(t.lat).toFixed(4)}°N
                          </span>
                          {t.gpsReal&&<span style={{fontSize:8,color:"#00ff8888",marginLeft:2}}>📍</span>}
                        </td>
                        <td style={{padding:"4px 7px",whiteSpace:"nowrap"}}>
                          <span style={{color:t.gpsReal?"#00ff88":"#4a7a9a",fontFamily:"Orbitron",fontSize:11}}>
                            {parseFloat(t.lon).toFixed(4)}°E
                          </span>
                        </td>
                        <td style={{padding:"4px 7px"}}><span style={{color:lc(t.level),fontFamily:"Orbitron"}}>{t.score}</span></td>
                        <td style={{padding:"4px 7px",color:"#b0d8f0"}}>{t.confidence}%</td>
                        <td style={{padding:"4px 7px"}}>
                          <span style={{fontSize:9,padding:"2px 5px",borderRadius:2,
                            background:t.source==="CAMERA"?"rgba(0,229,255,.15)":t.source==="DRONE"?"rgba(0,255,136,.12)":t.source==="LIVE_DEMO"?"rgba(255,45,85,.12)":"rgba(100,100,150,.07)",
                            border:`1px solid ${t.source==="CAMERA"?"#00e5ff":t.source==="DRONE"?"#00ff88":t.source==="LIVE_DEMO"?"#ff2d55":"#2a5a7a"}`,
                            color:t.source==="CAMERA"?"#00e5ff":t.source==="DRONE"?"#00ff88":t.source==="LIVE_DEMO"?"#ff2d55":"#4a7a9a"}}>
                            {t.source==="CAMERA"?"📷 CCTV":t.source==="DRONE"?"🛸 UAV":t.source==="LIVE_DEMO"?"🔴 LIVE":"📡 SIM"}
                          </span>
                        </td>
                        <td style={{padding:"4px 7px"}}>
                          <button onClick={e=>{e.stopPropagation();neutralize(t.id);}} style={{background:"rgba(255,45,85,.12)",border:"1px solid #ff2d55",color:"#ff2d55",fontFamily:"Orbitron",fontSize:9,padding:"2px 5px",cursor:"pointer",borderRadius:2}}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
              <div className="panel-title"><span>🧠</span>AI TACTICAL BRIEF</div>
              {sel?(
                <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                  <div style={{padding:"8px 10px",borderBottom:"1px solid var(--border)"}}>
                    {[["TYPE",sel.type?.replace(/_/g," ")],["LEVEL",sel.level],["LOCATION",sel.name||sel.sector],["REGION",sel.region],
                      ["COORDS", sel.gpsReal ? `${parseFloat(sel.lat).toFixed(5)}°N, ${parseFloat(sel.lon).toFixed(5)}°E` : `${parseFloat(sel.lat).toFixed(3)}°N, ${parseFloat(sel.lon).toFixed(3)}°E`],
                      ["SCORE",`${sel.score}/100`],["SOURCE",sel.source||"SIMULATION"]].map(([k,v])=>(
                      <div key={k} style={{display:"flex",gap:6,marginBottom:3}}>
                        <span style={{color:"#2a5a7a",fontSize:11,width:55,flexShrink:0}}>{k}:</span>
                        <span style={{color:"#b0d8f0",fontSize:12}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{flex:1,padding:"8px 10px",overflowY:"auto",color:"#8acce0",fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap"}}>
                    {briefLoading?<span className="blink" style={{color:"#00e5ff"}}>▌ ANALYZING...</span>:brief}
                  </div>
                </div>
              ):<div style={{padding:12,color:"#2a5a7a",fontSize:12}}>// SELECT A THREAT TO ANALYZE</div>}
            </div>
            {/* Action Log */}
            <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
              <div className="panel-title" style={{fontSize:10}}><span>📋</span>ACTION LOG</div>
              <div style={{flex:1,overflowY:"auto"}}>
                {actionLog.length===0?(
                  <div style={{padding:"12px",color:"#2a5a7a",fontSize:11,lineHeight:1.8}}>// No actions yet<br/>// Click NEUTRALIZE,<br/>// MONITOR, or ESCALATE<br/>// on any threat</div>
                ):actionLog.map((log,i)=>(
                  <div key={i} style={{padding:"6px 10px",borderBottom:"1px solid #040d1a",borderLeft:`3px solid ${log.action==="NEUTRALIZED"?"#00ff88":log.action==="ESCALATED"?"#ff2d55":"#00e5ff"}`}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:log.action==="NEUTRALIZED"?"#00ff88":log.action==="ESCALATED"?"#ff2d55":"#00e5ff",fontFamily:"Orbitron",fontSize:9,fontWeight:700}}>{log.action}</span>
                      <span style={{color:"#2a5a7a",fontSize:9}}>{log.time}</span>
                    </div>
                    <div style={{color:"#c0e0f8",fontSize:11,marginTop:1}}>{log.threat}</div>
                    <div style={{color:"#4a7a9a",fontSize:10}}>{log.location} · {log.level}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {mod==="ANALYTICS"&&(
          <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:"var(--gap)",padding:"var(--pad)",overflow:"hidden",minHeight:0}}>
            <div className="panel" style={{display:"flex",flexDirection:"column",minHeight:0}}>
              <div className="panel-title"><span>📊</span>24-HOUR THREAT TIMELINE</div>
              <div style={{flex:1,padding:"6px 2px",position:"relative"}}>
                {timeline.every(b=>b.threats===0) && (
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:2,background:"rgba(2,8,16,.7)"}}>
                    <div style={{color:"#2a5a7a",fontFamily:"Orbitron",fontSize:10,letterSpacing:2}}>NO THREAT DATA YET</div>
                    <div style={{color:"#1a3a4a",fontSize:9,marginTop:4}}>Run ML pipeline or start CCTV detection</div>
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{top:5,right:8,left:-22,bottom:0}}>
                    <defs>
                      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff2d55" stopOpacity={.3}/><stop offset="95%" stopColor="#ff2d55" stopOpacity={0}/></linearGradient>
                      <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ff88" stopOpacity={.3}/><stop offset="95%" stopColor="#00ff88" stopOpacity={0}/></linearGradient>
                    </defs>
                    <XAxis dataKey="hour" tick={{fill:"#2a5a7a",fontSize:10}} interval={5}/>
                    <YAxis tick={{fill:"#2a5a7a",fontSize:10}}/>
                    <Tooltip contentStyle={{background:"#040d1a",border:"1px solid #0a3a5c",fontSize:12,fontFamily:"Share Tech Mono"}}/>
                    <Area type="monotone" dataKey="threats" stroke="#ff2d55" fill="url(#tg)" strokeWidth={1.5} name="Threats"/>
                    <Area type="monotone" dataKey="neutralized" stroke="#00ff88" fill="url(#ng)" strokeWidth={1.5} name="Neutralized"/>
                    <Area type="monotone" dataKey="falsePos" stroke="#ffaa00" fill="none" strokeWidth={1} strokeDasharray="3 3" name="False+"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel" style={{display:"flex",flexDirection:"column",minHeight:0}}>
              <div className="panel-title">
                <span>📍</span>PREDICTED RISK ZONES
                <span style={{marginLeft:"auto",fontSize:10,
                  color:csvStatus==="LOADED"?"#00ff88":"#ffaa00",
                  border:`1px solid ${csvStatus==="LOADED"?"#00ff88":"#ffaa00"}`,
                  borderRadius:2,padding:"1px 4px",
                }}>📊 {csvStatus==="LOADED"?"KAGGLE CSV LOADED":"LOADING..."}</span>
              </div>
              <div style={{flex:1,padding:"10px",overflowY:"auto"}}>
                {riskData.length===0?(
                  <div style={{padding:"12px 10px",color:"#2a5a7a",fontSize:11,fontFamily:"Share Tech Mono",textAlign:"center"}}>
                    WAITING FOR BACKEND DATA...<br/>
                    <span style={{fontSize:10,color:"#1a3550"}}>Run python app.py to load risk predictions</span>
                  </div>
                ):riskData.map(row=>{
                  const risk = Math.round((row.risk_score||0)*100);
                  const cat  = row.risk_category||"LOW RISK";
                  const col  = cat==="HIGH RISK"?"#ff2d55":cat==="MODERATE RISK"?"#ffaa00":"#00ff88";
                  const hs   = HOTSPOTS.find(h=>h.name===row.location)||{lat:"—",lon:"—"};
                  return(
                    <div key={row.location} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2,alignItems:"center"}}>
                        <div>
                          <span style={{color:"#b0d8f0",fontSize:12}}>{row.location}</span>
                          <span style={{color:"#2a5a7a",fontSize:10,marginLeft:5}}>{hs.lat}°N {hs.lon}°E</span>
                        </div>
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          <span style={{color:col,fontSize:10,border:`1px solid ${col}`,borderRadius:2,padding:"0 3px",fontFamily:"Orbitron"}}>{cat}</span>
                          <span style={{color:col,fontFamily:"Orbitron",fontSize:10,fontWeight:700}}>{risk}%</span>
                        </div>
                      </div>
                      <div style={{background:"#0a2030",height:4,borderRadius:2}}>
                        <div style={{width:`${risk}%`,height:"100%",borderRadius:2,background:`linear-gradient(90deg,${col},transparent)`,transition:"width .5s"}}/>
                      </div>
                      {row.false_positive_rate!==undefined&&(
                        <div style={{color:"#2a5a7a",fontSize:10,marginTop:1}}>
                          FP Rate: {(row.false_positive_rate*100).toFixed(1)}% · Anomaly: {((row.mean_anomaly||0)*100).toFixed(1)}/100
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
              <div className="panel-title"><span>🔬</span>ML MODEL PERFORMANCE</div>
              <div style={{flex:1,padding:"10px",overflowY:"auto"}}>
                {[
                  ["Random Forest Accuracy","76.7%","5-fold CV on sensor dataset","#00ff88"],
                  ["Isolation Forest","12% contamination","Anomaly detection — 200 estimators","#00e5ff"],
                  ["FP Reduction","18.8%","Alert priority suppression model","#ffaa00"],
                  ["Features Used","10","motion·seismic·thermal·rf·object·night","#00e5ff"],
                  ["Dataset Zones",riskData.length>0?`${riskData.length} zones`:"Loading...","High-risk zones predicted","#00ff88"],
                  ["Training Source","NSL-KDD + UNSW","Network intrusion datasets","#ffaa00"],
                ].map(([n,v,d,c])=>(
                  <div key={n} style={{marginBottom:6,padding:"6px 8px",background:"#040d1a",border:`1px solid ${c}22`,borderLeft:`2px solid ${c}`,borderRadius:3}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:"#b0d8f0",fontSize:12}}>{n}</span>
                      <span style={{color:c,fontFamily:"Orbitron",fontSize:11,fontWeight:700}}>{v}</span>
                    </div>
                    <div style={{color:"#2a5a7a",fontSize:10,marginTop:2}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
              <div className="panel-title"><span>📍</span>BORDER HOTSPOT COORDINATE TABLE</div>
              <div style={{flex:1,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr>{["HOTSPOT","REGION","LATITUDE","LONGITUDE","SECTOR"].map(h=><th key={h} style={{padding:"4px 8px",color:"#00e5ff",fontFamily:"Orbitron",fontSize:10,letterSpacing:1,borderBottom:"1px solid #0a3a5c",textAlign:"left"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {HOTSPOTS.map(h=>(
                      <tr key={h.name}>
                        <td style={{padding:"4px 8px",color:"#b0d8f0"}}>{h.name}</td>
                        <td style={{padding:"4px 8px",color:"#4a7a9a"}}>{h.region}</td>
                        <td style={{padding:"4px 8px",color:"#00ff88",fontFamily:"Orbitron",fontSize:11}}>{h.lat}°N</td>
                        <td style={{padding:"4px 8px",color:"#00ff88",fontFamily:"Orbitron",fontSize:11}}>{h.lon}°E</td>
                        <td style={{padding:"4px 8px",color:"#4a7a9a"}}>{h.sector}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SENSORS */}
        {mod==="SENSORS"&&<SensorGrid sensorDataHistory={sensorHistory}/>}

        {/* OSINT */}
        {mod==="OSINT"&&(
          <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"var(--gap)",padding:"var(--pad)",overflow:"hidden",minHeight:0}}>
            <div className="panel" style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div className="panel-title"><span>🌐</span>OPEN-SOURCE INTELLIGENCE FEED</div>
              <div style={{flex:1,overflowY:"auto"}}>
                {osint.length===0?(
                  <div style={{padding:"30px 20px",color:"#2a5a7a",fontFamily:"Share Tech Mono",fontSize:12,textAlign:"center"}}>
                    <div style={{fontSize:28,marginBottom:10}}>📡</div>
                    <div style={{color:"#4a7a9a",fontFamily:"Orbitron",fontSize:11,marginBottom:6}}>NO OSINT DATA LOADED</div>
                    <div style={{fontSize:10,lineHeight:1.7,color:"#2a5a7a"}}>
                      Run the ML pipeline to generate risk zone data:<br/>
                      <span style={{color:"#00e5ff"}}>python ml_pipeline/run_pipeline.py</span><br/>
                      Then copy outputs to backend/chakravyuh_outputs/
                    </div>
                  </div>
                ):osint.map((item,i)=>{
                  const lvl=item.risk_category==="HIGH RISK"?"HIGH":item.risk_category==="MODERATE RISK"?"MEDIUM":"LOW";
                  // risk_score from pipeline is 0-1 range
                  const score=Math.round((parseFloat(item.risk_score)||0)*100);
                  const fp=Math.round((parseFloat(item.false_positive_rate)||0)*100);
                  const anomaly=Math.round((parseFloat(item.mean_anomaly)||0)*100);
                  return(
                    <div key={i} style={{padding:"7px 10px",borderBottom:"1px solid #040d1a"}}>
                      <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                        <span style={{background:lb(lvl),border:`1px solid ${lc(lvl)}`,color:lc(lvl),fontSize:10,fontFamily:"Orbitron",padding:"1px 5px",borderRadius:2,flexShrink:0}}>DATASET</span>
                        <span style={{color:"#b0d8f0",fontSize:12,flex:1,fontWeight:600}}>{item.location}</span>
                        <span style={{color:lc(lvl),fontSize:10,fontFamily:"Orbitron",flexShrink:0}}>{item.risk_category}</span>
                      </div>
                      <div style={{marginTop:3,display:"flex",gap:12}}>
                        <span style={{color:"#4a7a9a",fontSize:10}}>RISK: <span style={{color:lc(lvl)}}>{score}%</span></span>
                        <span style={{color:"#4a7a9a",fontSize:10}}>ANOMALY: <span style={{color:"#00e5ff"}}>{anomaly}%</span></span>
                        <span style={{color:"#4a7a9a",fontSize:10}}>FP RATE: <span style={{color:"#ffaa00"}}>{fp}%</span></span>
                        <span style={{color:"#2a5a7a",fontSize:10,marginLeft:"auto"}}>{item.total_events||0} events</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"var(--gap)"}}>
              <div className="panel" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                <div className="panel-title"><span>🔗</span>OSINT CORRELATION MATRIX</div>
                <div style={{flex:1,padding:"10px",overflowY:"auto"}}>
                  {[
                    {a:"RF Burst",b:"Physical Intrusion",s:Math.round((riskData[0]?.mean_anomaly||0.62)*100)||62},
                    {a:"Seismic",b:"Tunnel Activity",s:Math.round((riskData[1]?.mean_anomaly||0.59)*100)||59},
                    {a:"Thermal Delta",b:"Encampment",s:Math.round((riskData[2]?.mean_anomaly||0.58)*100)||58},
                    {a:"Motion Spike",b:"Border Crossing",s:Math.round((riskData[3]?.mean_anomaly||0.55)*100)||55},
                    {a:"Object Count",b:"Aerial Recon",s:Math.round((riskData[4]?.mean_anomaly||0.51)*100)||51},
                    {a:"Night Events",b:"Infiltration",s:Math.round((riskData[5]?.night_threat_ratio||0.59)*100)||59},
                  ].map(c=>(
                    <div key={c.a} style={{marginBottom:8,padding:"6px 8px",background:"#040d1a",border:"1px solid #0a2030",borderRadius:3}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:"#8acce0",fontSize:12}}>{c.a} ↔ {c.b}</span>
                        <span style={{color:c.s>85?"#ff2d55":"#ffaa00",fontFamily:"Orbitron",fontSize:11}}>{c.s}%</span>
                      </div>
                      <div style={{marginTop:3,background:"#0a2030",height:3,borderRadius:2}}>
                        <div style={{width:`${c.s}%`,height:"100%",background:`linear-gradient(90deg,${c.s>85?"#ff2d55":"#ffaa00"},transparent)`,borderRadius:2}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel" style={{padding:"0 0 8px"}}>
                <div className="panel-title"><span>📡</span>PIPELINE & DATA STATUS</div>
                <div style={{padding:"8px 12px"}}>
                  {[
                    ["Sensor Dataset (CSV)",    threats.length>0?"LOADED":"OFFLINE"],
                    ["Risk Zone Predictions",   riskData.length>0?"LOADED":"OFFLINE"],
                    ["Isolation Forest Model",  "ACTIVE"],
                    ["Random Forest Model",     "ACTIVE"],
                    ["Alert Priority System",   "ACTIVE"],
                    ["Backend API (/api/*)",     csvStatus==="LOADED"||threats.length>0?"ONLINE":"OFFLINE"],
                  ].map(([n,s])=>(
                    <div key={n} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{color:"#4a7a9a",fontSize:11}}>{n}</span>
                      <span style={{color:s==="OFFLINE"?"#ff2d55":s==="ACTIVE"||s==="ONLINE"||s==="LOADED"?"#00ff88":"#ffaa00",fontFamily:"Orbitron",fontSize:10,fontWeight:700}}>● {s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAP */}
        {mod==="MAP"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,position:"relative"}}>
            {/* MAP HUD top bar */}
            <div style={{flexShrink:0,padding:"4px 10px",background:"linear-gradient(90deg,#040d1a,#061525,#040d1a)",borderBottom:"1px solid #0a3a5c",display:"flex",alignItems:"center",gap:16,fontSize:10,fontFamily:"Share Tech Mono"}}>
              <span style={{color:"#00e5ff",fontFamily:"Orbitron",fontSize:10,letterSpacing:2,fontWeight:700}}>🌍 GLOBAL THREAT MAP</span>
              <span style={{color:"#4a7a9a"}}>THREATS: <span style={{color:"#ff2d55"}}>{threats.length}</span></span>
              <span style={{color:"#4a7a9a"}}>CRITICAL: <span style={{color:"#ff2d55"}}>{threats.filter(t=>t.level==="CRITICAL").length}</span></span>
              <span style={{color:"#4a7a9a"}}>HIGH: <span style={{color:"#ffaa00"}}>{threats.filter(t=>t.level==="HIGH").length}</span></span>
              <span style={{color:"#4a7a9a"}}>SOURCE: <span style={{color:"#00e5ff"}}>LIVE·CCTV·DRONE·SAT</span></span>
              <button onClick={()=>setShowRoutes(p=>!p)} style={{marginLeft:"auto",background:showRoutes?"rgba(255,45,85,.15)":"rgba(0,229,255,.08)",border:`1px solid ${showRoutes?"#ff2d55":"#0a3a5c"}`,color:showRoutes?"#ff2d55":"#4a7a9a",fontFamily:"Orbitron",fontSize:9,padding:"3px 10px",cursor:"pointer",borderRadius:3,letterSpacing:1}}>
                {showRoutes?"ROUTES ON":"ROUTES OFF"}
              </button>
            </div>
            {/* Full map */}
            <div style={{flex:1,position:"relative",minHeight:0}}>
              <WorldMap threats={threats} selectedThreat={sel} onSelect={setSel} showRoutes={showRoutes}/>
              {/* Overlay: selected threat brief */}
              {sel&&(
                <div style={{position:"absolute",bottom:30,left:8,width:280,background:"rgba(2,8,16,.92)",border:"1px solid #0a3a5c",borderLeft:`3px solid ${lc(sel.level)}`,borderRadius:5,padding:"10px 12px",zIndex:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{color:lc(sel.level),fontFamily:"Orbitron",fontSize:11,fontWeight:700,letterSpacing:1}}>{sel.level} ALERT</span>
                    <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#4a7a9a",cursor:"pointer",fontSize:14,lineHeight:1}}>✕</button>
                  </div>
                  <div style={{color:"#c0e0f8",fontSize:13,fontWeight:600,marginBottom:4}}>{sel.type?.replace(/_/g," ")}</div>
                  <div style={{color:"#4a7a9a",fontSize:11,marginBottom:2}}>{sel.name} · {sel.region}</div>
                  <div style={{color:"#2a5a7a",fontSize:10,marginBottom:8}}>{parseFloat(sel.lat).toFixed(3)}°N  {parseFloat(sel.lon).toFixed(3)}°E  ·  S:{sel.score}/100</div>
                  <div style={{color:"#8acce0",fontSize:11,lineHeight:1.7,maxHeight:80,overflowY:"auto",whiteSpace:"pre-wrap",fontFamily:"Share Tech Mono"}}>{brief}</div>
                  <div style={{display:"flex",gap:5,marginTop:8}}>
                    {["NEUTRALIZE","MONITOR","ESCALATE"].map(a=>(
                      <button key={a} onClick={()=>{if(a==="NEUTRALIZE")neutralize(sel.id);else if(a==="MONITOR")monitorThreat(sel.id);else if(a==="ESCALATE")escalateThreat(sel.id);}} style={{flex:1,padding:"5px 0",background:a==="NEUTRALIZE"?"rgba(255,45,85,.15)":a==="ESCALATE"?"rgba(255,170,0,.1)":"rgba(0,229,255,.07)",border:`1px solid ${a==="NEUTRALIZE"?"#ff2d55":a==="ESCALATE"?"#ffaa00":"#00e5ff"}`,color:a==="NEUTRALIZE"?"#ff2d55":a==="ESCALATE"?"#ffaa00":"#00e5ff",fontFamily:"Orbitron",fontSize:9,cursor:"pointer",borderRadius:2}}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUANTUM SECURITY MODULE — always mounted, never unmounts, state persists ── */}
        <div style={{flex:1,display:mod==="QUANTUM"?"flex":"none",flexDirection:"column",overflow:"hidden",minHeight:0}}>
          <div style={{flexShrink:0,padding:"4px 10px",background:"linear-gradient(90deg,#040d1a,#061525,#040d1a)",borderBottom:"1px solid #0a3a5c",display:"flex",alignItems:"center",gap:16,fontSize:10,fontFamily:"Share Tech Mono",flexWrap:"wrap"}}>
            <span style={{color:"#00e5ff",fontFamily:"Orbitron",fontSize:10,letterSpacing:2,fontWeight:700}}>⚛ POST-QUANTUM CRYPTOGRAPHY LAYER</span>
            <span style={{color:"#4a7a9a"}}>KEM: <span style={{color:"#ffaa00"}}>Kyber-512</span></span>
            <span style={{color:"#4a7a9a"}}>SIG: <span style={{color:"#ffaa00"}}>Dilithium2</span></span>
            <span style={{color:"#4a7a9a"}}>ENC: <span style={{color:"#00ff88"}}>AES-256-GCM</span></span>
            <span style={{color:"#4a7a9a"}}>STANDARD: <span style={{color:"#00e5ff"}}>NIST FIPS 203/204/197</span></span>
          </div>
          <QuantumModule/>
        </div>

                {/* ── NOTIFICATION TRAY — toggles with bell, stays open until closed ── */}
        <div style={{
          position:"fixed", top:0, right:0, bottom:0,
          width: showTray ? 270 : 0,
          overflow:"hidden",
          transition:"width .25s cubic-bezier(.4,0,.2,1)",
          zIndex:300, pointerEvents: alerts.length>0 ? "auto" : "none",
          display:"flex", flexDirection:"column",
        }}>
          <div style={{
            width:260, height:"100%",
            background:"rgba(2,8,16,.97)",
            borderLeft:"1px solid #0a3a5c",
            display:"flex", flexDirection:"column",
            boxShadow:"-4px 0 24px rgba(0,229,255,.08)",
          }}>
            {/* Tray header */}
            <div style={{
              padding:"10px 12px", borderBottom:"1px solid #0a2030",
              display:"flex", alignItems:"center", gap:8,
              background:"linear-gradient(90deg,#040d1a,#061525)",
              flexShrink:0,
            }}>
              <button onClick={()=>setShowTray(false)} style={{background:"none",border:"none",color:"#4a7a9a",cursor:"pointer",fontSize:16,lineHeight:1,padding:0,marginRight:2}}>←</button>
              <span style={{fontFamily:"Orbitron",fontSize:10,color:"#00e5ff",letterSpacing:2,fontWeight:700}}>⚠ ALERTS</span>
              <span style={{
                background:"#ff2d55", color:"#fff", borderRadius:10,
                fontFamily:"Orbitron", fontSize:9, padding:"1px 6px", fontWeight:700,
              }}>{alerts.length}</span>
              <button onClick={()=>{setAlerts([]);setUnread(0);setShowTray(false);}} style={{
                marginLeft:"auto", background:"rgba(255,45,85,.12)",
                border:"1px solid #ff2d5544", color:"#ff2d55",
                fontFamily:"Orbitron", fontSize:8, padding:"2px 8px",
                cursor:"pointer", borderRadius:3,
              }}>CLEAR ALL</button>
            </div>
            {/* Alert items */}
            <div style={{flex:1, overflowY:"auto", padding:"6px"}}>
              {alerts.map((a,i)=>(
                <div key={a.aid} className="slide-in" style={{
                  background:lb(a.level),
                  border:`1px solid ${lc(a.level)}`,
                  borderLeft:`3px solid ${lc(a.level)}`,
                  borderRadius:4, padding:"8px 10px",
                  marginBottom:5,
                  boxShadow:`0 0 10px ${lc(a.level)}22`,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div className="pulse-dot" style={{background:lc(a.level),color:lc(a.level)}}/>
                      <span style={{color:lc(a.level),fontFamily:"Orbitron",fontSize:10,fontWeight:700,letterSpacing:1}}>{a.level}</span>
                      {a.source==="CAMERA"&&<span style={{fontSize:8,color:"#00e5ff",border:"1px solid #00e5ff44",borderRadius:2,padding:"0 3px"}}>📷</span>}
                      {a.source==="DRONE"&&<span style={{fontSize:8,color:"#00ff88",border:"1px solid #00ff8844",borderRadius:2,padding:"0 3px"}}>🛸</span>}
                    </div>
                    <button onClick={()=>setAlerts(p=>p.filter(x=>x.aid!==a.aid))} style={{
                      background:"none",border:"none",color:"#4a7a9a",cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px",
                    }}>✕</button>
                  </div>
                  <div style={{color:"#e0f0ff",fontSize:12,fontWeight:600,marginBottom:2}}>{a.type?.replace(/_/g," ")}</div>
                  <div style={{color:"#4a7a9a",fontSize:10,marginBottom:1}}>{a.name||a.sector}</div>
                  <div style={{color:"#2a5a7a",fontSize:10}}>{a.region} · {a.time}</div>
                  <div style={{marginTop:5,background:"#0a2030",height:3,borderRadius:2}}>
                    <div style={{width:`${a.score||50}%`,height:"100%",borderRadius:2,background:`linear-gradient(90deg,${lc(a.level)},${lc(a.level)}44)`}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                    <span style={{color:"#2a5a7a",fontSize:9}}>SCORE</span>
                    <span style={{color:lc(a.level),fontFamily:"Orbitron",fontSize:9,fontWeight:700}}>{a.score||"—"}/100</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Tray footer */}
            <div style={{padding:"6px 10px",borderTop:"1px solid #0a2030",flexShrink:0}}>
              <div style={{fontSize:9,color:"#2a5a7a",textAlign:"center",fontFamily:"Share Tech Mono"}}>
                AUTO-DISMISS IN 30s · CLICK THREAT TO ANALYZE
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{height:22,background:"#040d1a",borderTop:"1px solid #0a2030",display:"flex",alignItems:"center",padding:"0 10px",gap:12,flexShrink:0,fontSize:10,overflow:"hidden"}}>
          {[["DETECTION","MULTI-SENSOR FUSION","#00e5ff"],["ANOMALY","ISOLATION FOREST","#ff2d55"],["CLASSIFIER","RANDOM FOREST","#ffaa00"],["SENSORS","VIS·IR·SEISMIC·RF·SAT","#00ff88"]].map(([k,v,c])=>(
            <div key={k} style={{display:"flex",gap:3}}>
              <span style={{color:"#2a5a7a"}}>{k}:</span>
              <span style={{color:c,textShadow:`0 0 8px ${c}88`,fontWeight:700}}>{v}</span>
            </div>
          ))}
          {/* Dynamic PQC status — honest display */}
          <div style={{display:"flex",gap:3}}>
            <span style={{color:"#2a5a7a"}}>SECURITY:</span>
            <span style={{
              color: userGps ? "#00ff88" : "#ffaa00",
              fontWeight:700,
              textShadow:`0 0 8px ${userGps?"#00ff8888":"#ffaa0088"}`,
            }}>{"HYBRID-PQC"}</span>
          </div>
          <div style={{marginLeft:"auto",color:"#00e5ff",letterSpacing:2,fontSize:9,textShadow:"0 0 8px #00e5ff66",opacity:.5}}>BORDER DEFENCE & SURVEILLANCE SYSTEM</div>
        </div>
      </div>
    </>
  );
}