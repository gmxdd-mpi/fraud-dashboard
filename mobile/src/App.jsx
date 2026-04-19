import { useState } from "react";

const ALL_TXN = [
  { id:"TXN-4821", amount:4299.99, merchant:"ElectroMart Online", category:"Electronics", country:"RO", time:"02:14", cardPresent:false, velocity:8,  distanceKm:1420, avgSpend:85,  hour:2,  newMerchant:true,  intl:true,  groundTruth:"confirmed_fraud" },
  { id:"TXN-3317", amount:52.40,   merchant:"Rewe Supermarkt",    category:"Grocery",     country:"DE", time:"11:32", cardPresent:true,  velocity:1,  distanceKm:2,    avgSpend:61,  hour:11, newMerchant:false, intl:false, groundTruth:"legitimate"      },
  { id:"TXN-9043", amount:899.00,  merchant:"LuxuryBags.com",     category:"Fashion",     country:"CN", time:"03:47", cardPresent:false, velocity:5,  distanceKm:8700, avgSpend:85,  hour:3,  newMerchant:true,  intl:true,  groundTruth:"suspected"       },
  { id:"TXN-1156", amount:23.80,   merchant:"BP Tankstelle",      category:"Fuel",        country:"DE", time:"08:15", cardPresent:true,  velocity:2,  distanceKm:15,   avgSpend:61,  hour:8,  newMerchant:false, intl:false, groundTruth:"legitimate"      },
  { id:"TXN-7729", amount:1750.00, merchant:"Crypto Exchange X",  category:"Crypto",      country:"US", time:"22:58", cardPresent:false, velocity:12, distanceKm:640,  avgSpend:85,  hour:22, newMerchant:true,  intl:true,  groundTruth:"confirmed_fraud" },
  { id:"TXN-2234", amount:210.00,  merchant:"Zalando",            category:"Fashion",     country:"DE", time:"21:30", cardPresent:false, velocity:3,  distanceKm:0,    avgSpend:95,  hour:21, newMerchant:false, intl:false, groundTruth:"suspected"       },
  { id:"TXN-5512", amount:3100.00, merchant:"GoldJewels Dubai",   category:"Jewellery",   country:"AE", time:"01:22", cardPresent:false, velocity:7,  distanceKm:5200, avgSpend:90,  hour:1,  newMerchant:true,  intl:true,  groundTruth:"confirmed_fraud" },
  { id:"TXN-6630", amount:38.50,   merchant:"Lidl Supermarkt",    category:"Grocery",     country:"DE", time:"09:45", cardPresent:true,  velocity:1,  distanceKm:4,    avgSpend:55,  hour:9,  newMerchant:false, intl:false, groundTruth:"legitimate"      },
  { id:"TXN-8801", amount:620.00,  merchant:"SteamGames",         category:"Gaming",      country:"RU", time:"04:10", cardPresent:false, velocity:4,  distanceKm:2100, avgSpend:75,  hour:4,  newMerchant:true,  intl:true,  groundTruth:"suspected"       },
  { id:"TXN-5541", amount:420.00,  merchant:"MediaMarkt Berlin",  category:"Electronics", country:"DE", time:"19:45", cardPresent:false, velocity:4,  distanceKm:310,  avgSpend:95,  hour:19, newMerchant:true,  intl:false, groundTruth:"legitimate"      },
  { id:"TXN-3341", amount:2400.00, merchant:"CryptoWallet Pro",   category:"Crypto",      country:"US", time:"03:05", cardPresent:false, velocity:9,  distanceKm:720,  avgSpend:80,  hour:3,  newMerchant:true,  intl:true,  groundTruth:"confirmed_fraud" },
  { id:"TXN-4450", amount:340.00,  merchant:"Saturn Markt",       category:"Electronics", country:"DE", time:"18:55", cardPresent:true,  velocity:2,  distanceKm:42,   avgSpend:70,  hour:18, newMerchant:true,  intl:false, groundTruth:"legitimate"      },
  { id:"TXN-7760", amount:5800.00, merchant:"TechZone Warsaw",    category:"Electronics", country:"PL", time:"02:55", cardPresent:false, velocity:6,  distanceKm:1100, avgSpend:90,  hour:2,  newMerchant:true,  intl:true,  groundTruth:"confirmed_fraud" },
  { id:"TXN-6612", amount:185.00,  merchant:"Booking.com",        category:"Travel",      country:"NL", time:"23:10", cardPresent:false, velocity:3,  distanceKm:220,  avgSpend:110, hour:23, newMerchant:false, intl:true,  groundTruth:"legitimate"      },
  { id:"TXN-9910", amount:980.00,  merchant:"LuxuryWatch HK",     category:"Jewellery",   country:"HK", time:"04:33", cardPresent:false, velocity:5,  distanceKm:9200, avgSpend:85,  hour:4,  newMerchant:true,  intl:true,  groundTruth:"confirmed_fraud" },
];

function xgbScore(tx) {
  if (!tx) return 0;
  let s = 0.05;
  const r = tx.amount / tx.avgSpend;
  if (r > 20) s += 0.30; else if (r > 5) s += 0.15; else if (r > 2) s += 0.07;
  if (!tx.cardPresent) s += 0.08; if (tx.intl) s += 0.12;
  if (tx.distanceKm > 1000) s += 0.15; else if (tx.distanceKm > 200) s += 0.06;
  if (tx.velocity > 7) s += 0.14; else if (tx.velocity > 3) s += 0.06;
  if (tx.hour < 5) s += 0.10; else if (tx.hour < 7) s += 0.04;
  if (tx.newMerchant) s += 0.07;
  if (tx.category === "Crypto") s += 0.10;
  if (tx.category === "Electronics" && tx.intl) s += 0.08;
  if (tx.category === "Jewellery" && tx.intl) s += 0.06;
  if (tx.groundTruth === "suspected") s = Math.min(0.82, Math.max(0.50, s));
  return Math.min(0.99, s);
}

function lrScore(tx) {
  if (!tx) return 0;
  const r = tx.amount / tx.avgSpend;
  const l = -1.2 + r*0.18 + (tx.intl?0.9:0) + (tx.distanceKm/1000)*0.6
    + tx.velocity*0.07 + (!tx.cardPresent?0.5:0) + (tx.newMerchant?0.4:0)
    + (tx.hour<5?0.7:0) + (tx.category==="Crypto"?0.8:0);
  return Math.min(0.99, Math.max(0.01, 1/(1+Math.exp(-l))));
}

function dtScore(tx) {
  if (!tx) return 0;
  const r = tx.amount / tx.avgSpend;
  if (r>10&&tx.intl) return 0.93; if (r>5&&tx.velocity>5) return 0.87;
  if (tx.distanceKm>1000&&!tx.cardPresent) return 0.82; if (tx.hour<5&&tx.intl) return 0.78;
  if (tx.category==="Crypto"&&tx.velocity>3) return 0.76; if (r>3&&tx.newMerchant) return 0.55;
  if (r<2&&!tx.intl&&tx.distanceKm<50) return 0.08; return 0.25;
}

function getShap(tx) {
  if (!tx) return [];
  const r = tx.amount / tx.avgSpend;
  return [
    {f:"Amount vs avg",   v:r>20?0.28:r>5?0.13:r>2?0.06:-0.03, lbl:`×${r.toFixed(1)}`},
    {f:"Hour",            v:tx.hour<5?0.09:tx.hour<7?0.03:-0.02, lbl:`${tx.hour}:00`},
    {f:"Distance",        v:tx.distanceKm>1000?0.14:tx.distanceKm>200?0.05:-0.02, lbl:`${tx.distanceKm}km`},
    {f:"Velocity",        v:tx.velocity>7?0.13:tx.velocity>3?0.05:-0.03, lbl:`${tx.velocity}/hr`},
    {f:"International",   v:tx.intl?0.11:-0.04, lbl:tx.intl?"Yes":"No"},
    {f:"Card not present",v:!tx.cardPresent?0.07:-0.03, lbl:tx.cardPresent?"Present":"Absent"},
    {f:"New merchant",    v:tx.newMerchant?0.06:-0.02, lbl:tx.newMerchant?"Yes":"No"},
    {f:"Category",        v:tx.category==="Crypto"?0.09:tx.category==="Electronics"?0.05:["Grocery","Fuel"].includes(tx.category)?-0.04:0.01, lbl:tx.category},
  ].sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));
}

function rl(s) {
  if (s>=0.7) return {text:"High risk",   col:"#c0392b", bg:"#fdecea"};
  if (s>=0.4) return {text:"Medium risk", col:"#b7770d", bg:"#fef3cd"};
  return             {text:"Low risk",    col:"#1a7a4a", bg:"#e8f7ee"};
}

const TRUTH = {
  confirmed_fraud:{label:"Confirmed fraud",col:"#c0392b",bg:"#fdecea",icon:"⚠"},
  legitimate:     {label:"Legitimate",     col:"#1a7a4a",bg:"#e8f7ee",icon:"✓"},
  suspected:      {label:"Suspected fraud",col:"#8e44ad",bg:"#f5eeff",icon:"?"},
};

const TASKS = [
  {id:"triage",   icon:"🔍", label:"1 · Alert appears",            col:"#4a7c59", bg:"#e8f5ee"},
  {id:"escalate", icon:"📋", label:"2 · Evaluate explanations",    col:"#7b5ea7", bg:"#f2eef9"},
  {id:"priority", icon:"🎯", label:"3 · Prioritization",           col:"#b8860b", bg:"#fef9e7"},
];

const ALL_EXP = ["SHAP","LIME","LLM","Counterfactual","Logistic regression","Decision tree","Peer cases"];
const SPEED_EXP   = ["<10 sec","10–30 sec","30–60 sec","1–2 min",">2 min"];
const SPEED_BATCH = ["<1 min","1–2 min","2–3 min","3–4 min",">4 min"];

const METRICS = {
  triage: [
    {lbl:"How would you classify this transaction?", type:"classification"},
    {lbl:"Confidence", type:"l7"},
  ],
  escalate: [
    {lbl:"Which explanation helped you the most?", type:"expselect"},
    {lbl:"How long to understand this explanation?", type:"speed_exp"},
    {lbl:"How clear was this explanation? (1–5)", type:"clarity"},
    {lbl:"How complete was this explanation? (1–5)", type:"completeness"},
  ],
  priority: [
    {lbl:"Prioritization accuracy", type:"pct"},
    {lbl:"How confident are you in your prioritisation?", type:"l7"},
    {lbl:"How long did it take to prioritise all alerts?", type:"speed_batch"},
  ],
};

const EXP_GROUPS = [
  {id:"posthoc",  label:"Post-hoc",          col:"#2980b9", bg:"#e8f0fe", desc:"Applied after model prediction was made",
   tabs:[{id:"shap",label:"SHAP"},{id:"lime",label:"LIME"},{id:"llm",label:"LLM"},{id:"counterfactual",label:"Counterfactual"}]},
  {id:"inherent", label:"Interpretable",     col:"#16a085", bg:"#e8f8f5", desc:"Transparent by construction",
   tabs:[{id:"logreg",label:"Logistic reg."},{id:"dtree",label:"Decision tree"},{id:"peers",label:"Peer cases"}]},
];

// ── Mini components ───────────────────────────────────────────────────────────
const Pill = ({label,col="#888",bg="#f0f0f0",sz=11})=>(
  <span style={{fontSize:sz,padding:"2px 9px",borderRadius:10,background:bg,color:col,fontWeight:500,whiteSpace:"nowrap"}}>{label}</span>
);

const Card = ({children,style={}})=>(
  <div style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:12,padding:"14px",marginBottom:10,...style}}>{children}</div>
);

function ScoreRing({score}) {
  const pct = Math.round(Math.min(score, 0.99) * 100);
  const r = rl(score);
  const cx = 60; const cy = 58; const radius = 42;
  // Arc spans from 210° to 330° (= -150° to -30° from top)
  // That's 120° total sweep for a half-circle gauge
  // Convert pct to angle within that range
  const startDeg = 210; const sweepDeg = 120;
  const angleDeg = startDeg + (pct / 100) * sweepDeg;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleLen = radius - 6;
  const needleX = cx + needleLen * Math.cos(angleRad);
  const needleY = cy + needleLen * Math.sin(angleRad);

  // Arc path: from 210° to 330°
  const x1 = cx + radius * Math.cos(startDeg * Math.PI / 180);
  const y1 = cy + radius * Math.sin(startDeg * Math.PI / 180);
  const x2 = cx + radius * Math.cos(330 * Math.PI / 180);
  const y2 = cy + radius * Math.sin(330 * Math.PI / 180);

  // Filled arc end point
  const filledAngle = startDeg + (pct / 100) * sweepDeg;
  const fx = cx + radius * Math.cos(filledAngle * Math.PI / 180);
  const fy = cy + radius * Math.sin(filledAngle * Math.PI / 180);
  const largeArc = (pct / 100) * sweepDeg > 180 ? 1 : 0;

  return (
    <div style={{textAlign:"center"}}>
      <svg viewBox="0 0 120 105" width="110">
        {/* background arc 210°→330° */}
        <path d={`M${x1},${y1} A${radius},${radius},0,0,1,${x2},${y2}`}
          fill="none" stroke="#eee" strokeWidth="8" strokeLinecap="round"/>
        {/* filled arc 210°→current */}
        {pct > 0 && (
          <path d={`M${x1},${y1} A${radius},${radius},0,${largeArc},1,${fx},${fy}`}
            fill="none" stroke={r.col} strokeWidth="8" strokeLinecap="round"/>
        )}
        {/* needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#444" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="4" fill="#444"/>
        {/* score below */}
        <text x={cx} y="78" textAnchor="middle" fontSize="20" fontWeight="600" fill={r.col}>{pct}</text>

        <text x={cx} y="96" textAnchor="middle" fontSize="9" fontWeight="500" fill={r.col}>{r.text}</text>
      </svg>
    </div>
  );
}

function AttrBar({v}) {
  const pct=Math.min(Math.abs(v)/0.30*100,100);
  return (
    <div style={{flex:1,background:"#f5f5f5",borderRadius:3,height:10,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",left:v>0?"50%":`${50-pct/2}%`,width:`${pct/2}%`,height:"100%",background:v>0?"#c0392b":"#1a7a4a"}}/>
      <div style={{position:"absolute",left:"50%",top:0,height:"100%",width:1,background:"#ccc"}}/>
    </div>
  );
}

// ── Explanation panels ────────────────────────────────────────────────────────
function ShapPanel({tx}) {
  return (
    <div>
      <div style={{display:"flex",gap:10,fontSize:11,color:"#888",marginBottom:10}}>
        <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,background:"#c0392b",borderRadius:2,display:"inline-block"}}/>Risk</span>
        <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,background:"#1a7a4a",borderRadius:2,display:"inline-block"}}/>Safe</span>
      </div>
      {getShap(tx).map((d,i)=>(
        <div key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
            <span style={{color:"#444"}}>{d.f}</span><span style={{color:"#aaa"}}>{d.lbl}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <AttrBar v={d.v}/>
            <span style={{fontSize:11,color:d.v>0?"#c0392b":"#1a7a4a",minWidth:40,textAlign:"right"}}>{d.v>0?"+":""}{d.v.toFixed(3)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LimePanel({tx}) {
  return (
    <div>
      <div style={{fontSize:12,color:"#888",marginBottom:8}}>Local surrogate approximation</div>
      {getShap(tx).slice(0,6).map((d,i)=>{
        const v=d.v*0.88;
        return (
          <div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
              <span style={{color:"#444"}}>{d.f}</span><span style={{color:"#aaa"}}>{d.lbl}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <AttrBar v={v}/>
              <span style={{fontSize:11,color:v>0?"#c0392b":"#1a7a4a",minWidth:40,textAlign:"right"}}>{v>0?"+":""}{v.toFixed(3)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LLMPanel({tx,score}) {
  const [text,setText]=useState(""); const [loading,setLoading]=useState(false);
  const [error,setError]=useState(""); const [done,setDone]=useState(false);
  const run=async()=>{
    setLoading(true);setError("");setText("");setDone(false);
    const r=rl(score);
    const prompt=`You are an AI assistant in a fraud detection dashboard.\n\nTransaction: ${tx.id} · €${tx.amount} at ${tx.merchant} (${tx.category}, ${tx.country}) · ${tx.time} · Card ${tx.cardPresent?"present":"not present"} · ${tx.intl?"International":"Domestic"} · ${tx.distanceKm}km · ${tx.velocity} txns/hr · ${tx.newMerchant?"New":"Known"} merchant · Avg spend €${tx.avgSpend}\nXGBoost score: ${Math.round(score*100)}/100 (${r.text})\n\nWrite 3 short paragraphs: (1) risk and key drivers, (2) why it was flagged, (3) recommended action. Plain language, no bullets.`;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setText(data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"No response.");
      setDone(true);
    } catch {setError("API call failed.");}
    setLoading(false);
  };
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        <Pill label="claude-sonnet-4-20250514" col="#6b3fa0" bg="#f0e8ff"/>
        <Pill label="Anthropic API" col="#2980b9" bg="#e8f0fe"/>
      </div>
      {!done&&!loading&&<button onClick={run} style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid #6b3fa0",background:"#f9f4ff",color:"#6b3fa0",fontSize:14,cursor:"pointer",fontWeight:500}}>Generate narrative ↗</button>}
      {loading&&<div style={{display:"flex",alignItems:"center",gap:8,color:"#888",fontSize:13}}><div style={{width:14,height:14,border:"2px solid #ccc",borderTopColor:"#6b3fa0",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Generating…</div>}
      {error&&<div style={{color:"#c0392b",fontSize:13}}>{error}</div>}
      {text&&<div><div style={{fontSize:13,lineHeight:1.8,color:"#333",whiteSpace:"pre-wrap"}}>{text}</div><button onClick={run} style={{marginTop:8,padding:"6px 14px",borderRadius:8,border:"1px solid #ddd",background:"#fafafa",color:"#888",fontSize:12,cursor:"pointer"}}>Regenerate</button></div>}
    </div>
  );
}

function CounterfactualPanel({tx,score}) {
  const pct=Math.round(score*100); const r=tx.amount/tx.avgSpend;
  const changes=[];
  if(tx.hour<6)         changes.push({icon:"🕐",desc:`Normal hour (08–20)`,delta:-10,feasible:false});
  if(tx.distanceKm>200) changes.push({icon:"📍",desc:`Within 50km (now ${tx.distanceKm}km)`,delta:-14,feasible:false});
  if(tx.velocity>3)     changes.push({icon:"⚡",desc:`Under 3 txns/hr (now ${tx.velocity})`,delta:-10,feasible:true});
  if(!tx.cardPresent)   changes.push({icon:"💳",desc:"Card present",delta:-8,feasible:false});
  if(tx.newMerchant)    changes.push({icon:"🏪",desc:"Known merchant",delta:-7,feasible:false});
  if(r>5)               changes.push({icon:"💰",desc:`Amount ≤ €${Math.round(tx.avgSpend*3)}`,delta:-15,feasible:true});
  if(changes.length===0) return <div style={{fontSize:13,color:"#888",padding:"8px 0"}}>Already near or below threshold.</div>;
  const ns=Math.max(5,pct+changes.reduce((a,c)=>a+c.delta,0));
  return (
    <div>
      <div style={{fontSize:12,color:"#888",marginBottom:8}}>Minimal changes to fall below threshold (40)</div>
      {changes.map((c,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}>
          <span style={{fontSize:15}}>{c.icon}</span>
          <div style={{flex:1}}><div style={{fontSize:13,color:"#333"}}>{c.desc}</div><div style={{fontSize:11,color:"#bbb"}}>{c.feasible?"Can be verified":"Fixed historical fact"}</div></div>
          <span style={{fontSize:12,color:"#1a7a4a",fontWeight:500}}>−{Math.abs(c.delta)}</span>
        </div>
      ))}
      <div style={{marginTop:10,padding:"9px 12px",background:"#f8f8f8",borderRadius:8,fontSize:13}}>
        All applied: <strong style={{color:ns<40?"#1a7a4a":"#c0392b"}}>{ns}/100</strong>
        <span style={{color:"#aaa",marginLeft:6}}>{ns<40?"→ below threshold":"→ still above"}</span>
      </div>
    </div>
  );
}

function LogRegPanel({tx}) {
  const score=lrScore(tx); const r=rl(score);
  const amt=tx.amount/tx.avgSpend;
  const coeffs=[
    {f:"Intercept",       coef:-1.20,val:1,                         c:-1.20},
    {f:"Amount ratio",    coef:0.18, val:amt,                        c:0.18*amt},
    {f:"International",   coef:0.90, val:tx.intl?1:0,                c:tx.intl?0.90:0},
    {f:"Distance (×1km)", coef:0.60, val:tx.distanceKm/1000,         c:0.60*(tx.distanceKm/1000)},
    {f:"Velocity/hr",     coef:0.07, val:tx.velocity,                 c:0.07*tx.velocity},
    {f:"Card not pres.",  coef:0.50, val:tx.cardPresent?0:1,         c:tx.cardPresent?0:0.50},
    {f:"New merchant",    coef:0.40, val:tx.newMerchant?1:0,         c:tx.newMerchant?0.40:0},
    {f:"Off-hours",       coef:0.70, val:tx.hour<5?1:0,              c:tx.hour<5?0.70:0},
    {f:"Crypto",          coef:0.80, val:tx.category==="Crypto"?1:0, c:tx.category==="Crypto"?0.80:0},
  ].sort((a,b)=>Math.abs(b.c)-Math.abs(a.c));
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <Pill label="Logistic Regression" col="#16a085" bg="#e8f8f5"/>
        <span style={{fontSize:12,color:"#888"}}>Score: <strong style={{color:r.col}}>{Math.round(score*100)}/100</strong></span>
      </div>
      <div style={{fontFamily:"monospace",fontSize:10,background:"#f8f8f8",borderRadius:6,padding:"8px",marginBottom:10,lineHeight:1.7,color:"#555",overflowX:"auto"}}>
        P = σ({coeffs.map((c,i)=>`${i>0&&c.c>0?"+":""}${c.c.toFixed(2)}`).join(" ")})
      </div>
      {coeffs.map((c,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #f5f5f5"}}>
          <span style={{flex:1,fontSize:12,color:"#444"}}>{c.f}</span>
          <span style={{fontSize:11,color:"#aaa",minWidth:60,fontSize:10}}>{c.coef.toFixed(2)}×{c.val.toFixed(1)}</span>
          <span style={{fontSize:12,fontWeight:500,minWidth:40,textAlign:"right",color:c.c>0?"#c0392b":"#1a7a4a"}}>{c.c>0?"+":""}{c.c.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function DTreePanel({tx}) {
  const score=dtScore(tx); const r=rl(score);
  const amt=tx.amount/tx.avgSpend;
  const path=[];
  if(amt>10&&tx.intl)                         {path.push({q:"Amount > 10× avg?",a:"Yes"},{q:"International?",a:"Yes"});}
  else if(amt>5&&tx.velocity>5)               {path.push({q:"Amount > 5× avg?",a:"Yes"},{q:"Velocity > 5/hr?",a:"Yes"});}
  else if(tx.distanceKm>1000&&!tx.cardPresent){path.push({q:"Distance > 1000km?",a:"Yes"},{q:"Card not present?",a:"Yes"});}
  else if(tx.hour<5&&tx.intl)                 {path.push({q:"Hour 00–05?",a:"Yes"},{q:"International?",a:"Yes"});}
  else if(amt<2&&!tx.intl&&tx.distanceKm<50)  {path.push({q:"Amount < 2× avg?",a:"Yes"},{q:"Domestic & local?",a:"Yes"});}
  else                                         {path.push({q:"Amount > 3× avg?",a:amt>3?"Yes":"No"},{q:"New merchant?",a:tx.newMerchant?"Yes":"No"});}
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <Pill label="Decision Tree" col="#16a085" bg="#e8f8f5"/>
        <span style={{fontSize:12,color:"#888"}}>Score: <strong style={{color:r.col}}>{Math.round(score*100)}/100</strong></span>
      </div>
      {path.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:6,background:i%2===0?"#f9f9f9":"#fff",borderRadius:8,border:"1px solid #f0f0f0"}}>
          <span style={{fontSize:13,color:"#aaa"}}>{"→".repeat(i+1)}</span>
          <span style={{fontSize:12,color:"#555",flex:1}}><strong>IF</strong> {p.q}</span>
          <Pill label={p.a} col={p.a==="Yes"?"#c0392b":"#1a7a4a"} bg={p.a==="Yes"?"#fdecea":"#e8f7ee"}/>
        </div>
      ))}
      <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:r.bg,color:r.col,fontSize:13,fontWeight:500}}>
        Result: {Math.round(score*100)}/100 — {r.text}
      </div>
    </div>
  );
}

function PeersPanel() {
  const peers=[
    {sim:97,outcome:"confirmed_fraud",amount:3890,merchant:"TechStore BG",country:"BG",hour:3,vel:9},
    {sim:91,outcome:"confirmed_fraud",amount:5100,merchant:"ElecZone RO",  country:"RO",hour:1,vel:7},
    {sim:84,outcome:"suspected",      amount:2750,merchant:"GadgetHub UA", country:"UA",hour:4,vel:6},
    {sim:78,outcome:"legitimate",     amount:1200,merchant:"MediaMarkt",   country:"DE",hour:14,vel:1},
    {sim:71,outcome:"legitimate",     amount:980,  merchant:"Saturn",       country:"DE",hour:10,vel:2},
    {sim:65,outcome:"suspected",      amount:640,  merchant:"Zalando",      country:"DE",hour:22,vel:2},
  ];
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {Object.entries(TRUTH).map(([k,v])=>{
          const n=peers.filter(p=>p.outcome===k).length;
          return <div key={k} style={{flex:1,background:v.bg,borderRadius:8,padding:"7px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:500,color:v.col}}>{n}</div><div style={{fontSize:10,color:v.col,lineHeight:1.3}}>{v.label}</div></div>;
        })}
      </div>
      {peers.map((p,i)=>{
        const tc=TRUTH[p.outcome];
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{minWidth:32,textAlign:"center"}}><span style={{fontSize:11,fontWeight:500,color:"#555"}}>{p.sim}%</span></div>
            <div style={{width:26,height:26,borderRadius:"50%",background:tc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:tc.col,fontWeight:700,flexShrink:0}}>{tc.icon}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:"#333",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.merchant} · €{p.amount.toLocaleString()}</div><div style={{fontSize:11,color:"#aaa"}}>{p.country} · {p.hour}:00</div></div>
            <Pill label={tc.label} col={tc.col} bg={tc.bg}/>
          </div>
        );
      })}
    </div>
  );
}

// ── Metric input ──────────────────────────────────────────────────────────────
function MetricInput({m,val,onChange}) {
  switch(m.type) {
    case "classification":
      return (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {key:"confirmed_fraud",label:"Confirmed fraud",col:"#c0392b",bg:"#fdecea",icon:"⚠"},
            {key:"legitimate",     label:"Legitimate",     col:"#1a7a4a",bg:"#e8f7ee",icon:"✓"},
            {key:"suspected",      label:"Suspected fraud",col:"#8e44ad",bg:"#f5eeff",icon:"?"},
          ].map(o=>(
            <button key={o.key} onClick={()=>onChange(o.key)}
              style={{padding:"12px 16px",borderRadius:10,border:`2px solid ${val===o.key?o.col:"#ddd"}`,background:val===o.key?o.bg:"#fff",color:val===o.key?o.col:"#888",fontSize:15,fontWeight:val===o.key?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
              <span style={{fontSize:18}}>{o.icon}</span>{o.label}
            </button>
          ))}
        </div>
      );
    case "l7": case "l5": {
      const max=m.type==="l7"?7:5;
      return (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#aaa",marginBottom:4}}><span>Low</span><span>High</span></div>
          <div style={{display:"flex",gap:5}}>
            {Array.from({length:max},(_,i)=>i+1).map(n=>(
              <button key={n} onClick={()=>onChange(n)} style={{flex:1,height:36,borderRadius:8,border:`1px solid ${val===n?"#2980b9":"#ddd"}`,background:val===n?"#e8f0fe":"#fff",color:val===n?"#2980b9":"#888",fontSize:13,cursor:"pointer",fontWeight:val===n?500:400}}>{n}</button>
            ))}
          </div>
        </div>
      );
    }
    case "clarity": case "completeness":
      return (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#aaa",marginBottom:4}}><span>Very unclear</span><span>Very clear</span></div>
          <div style={{display:"flex",gap:5}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>onChange(n)} style={{flex:1,height:36,borderRadius:8,border:`1px solid ${val===n?"#2980b9":"#ddd"}`,background:val===n?"#e8f0fe":"#fff",color:val===n?"#2980b9":"#888",fontSize:13,cursor:"pointer"}}>{n}</button>
            ))}
          </div>
        </div>
      );
    case "speed_exp":
      return (
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {SPEED_EXP.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"6px 10px",borderRadius:14,border:`1px solid ${val===o?"#2980b9":"#ddd"}`,background:val===o?"#e8f0fe":"#fff",color:val===o?"#2980b9":"#666",fontSize:12,cursor:"pointer"}}>{o}</button>)}
        </div>
      );
    case "speed_batch":
      return (
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {SPEED_BATCH.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"6px 10px",borderRadius:14,border:`1px solid ${val===o?"#2980b9":"#ddd"}`,background:val===o?"#e8f0fe":"#fff",color:val===o?"#2980b9":"#666",fontSize:12,cursor:"pointer"}}>{o}</button>)}
        </div>
      );
    case "expselect":
      return (
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {ALL_EXP.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"6px 10px",borderRadius:14,border:`1px solid ${val===o?"#2980b9":"#ddd"}`,background:val===o?"#e8f0fe":"#fff",color:val===o?"#2980b9":"#666",fontSize:12,cursor:"pointer"}}>{o}</button>)}
        </div>
      );
    case "pct":
      return (
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {["<50%","50–70%","70–85%","85–95%",">95%"].map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"6px 10px",borderRadius:14,border:`1px solid ${val===o?"#2980b9":"#ddd"}`,background:val===o?"#e8f0fe":"#fff",color:val===o?"#2980b9":"#666",fontSize:12,cursor:"pointer"}}>{o}</button>)}
        </div>
      );
    default: return null;
  }
}

// ── Eval widget ───────────────────────────────────────────────────────────────
function EvalWidget({step,expTab,saved,onSave}) {
  const task=TASKS.find(t=>t.id===step)||TASKS[0];
  const metrics=METRICS[step]||[];
  const key=`${step}-${expTab}`;
  const [vals,setVals]=useState({});
  const [startTime]=useState(Date.now());
  if(saved[key]) return <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid #f0f0f0",fontSize:13,color:"#1a7a4a"}}>✓ Evaluation recorded</div>;
  const perExp=["clarity","completeness","speed_exp"];
  const isEsc=step==="escalate";
  const allDone=metrics.every(m=>{
    if(isEsc&&perExp.includes(m.type)) return ALL_EXP.every(t=>vals[`${m.lbl}__${t}`]!==undefined);
    return vals[m.lbl]!==undefined;
  });
  return (
    <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid #f0f0f0"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{fontSize:13,fontWeight:500,color:task.col,padding:"3px 10px",borderRadius:6,background:task.bg}}>{task.label}</span>
      </div>
      {metrics.map((m,i)=>{
        const isPerExp=isEsc&&perExp.includes(m.type);
        return (
          <div key={i} style={{marginBottom:16}}>
            <div style={{fontSize:13,color:"#333",marginBottom:8,fontWeight:500}}>{m.lbl}</div>
            {isPerExp?(
              <div>
                {ALL_EXP.map(tab=>{
                  const k=`${m.lbl}__${tab}`;
                  return (
                    <div key={tab} style={{marginBottom:10,padding:"10px",background:"#f9f9f9",borderRadius:8}}>
                      <div style={{fontSize:12,color:"#555",marginBottom:6,fontWeight:500}}>{tab}</div>
                      <MetricInput m={m} val={vals[k]} onChange={v=>setVals(p=>({...p,[k]:v}))}/>
                    </div>
                  );
                })}
              </div>
            ):(
              <MetricInput m={m} val={vals[m.lbl]} onChange={v=>setVals(p=>({...p,[m.lbl]:v}))}/>
            )}
          </div>
        );
      })}
      <button onClick={()=>onSave(key,{...vals,latency_s:Math.round((Date.now()-startTime)/1000),exp:expTab,task:step})}
        disabled={!allDone}
        style={{width:"100%",padding:"12px",borderRadius:10,border:`1px solid ${allDone?"#2980b9":"#ccc"}`,background:allDone?"#e8f0fe":"#f5f5f5",color:allDone?"#2980b9":"#aaa",fontSize:14,cursor:allDone?"pointer":"default",fontWeight:500}}>
        Save evaluation →
      </button>
      {!allDone&&<div style={{fontSize:12,color:"#bbb",textAlign:"center",marginTop:6}}>Complete all items above to save</div>}
    </div>
  );
}

// ── Priority list (Task 3) ────────────────────────────────────────────────────
function PriorityList({txns,selected,onSelect,userRanking,setUserRanking}) {
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const ranked=userRanking.length===txns.length
    ? userRanking.map(i=>({...txns[i],origIdx:i,score:xgbScore(txns[i])}))
    : txns.map((t,i)=>({...t,origIdx:i,score:xgbScore(t)}));
  const modelOrder=[...txns].map((t,i)=>({...t,origIdx:i,score:xgbScore(t)})).sort((a,b)=>b.score-a.score).map(t=>t.origIdx);
  const userOrder=ranked.map(t=>t.origIdx);
  let conc=0,disc=0;
  for(let i=0;i<userOrder.length;i++) for(let j=i+1;j<userOrder.length;j++){
    const uD=userOrder.indexOf(userOrder[i])-userOrder.indexOf(userOrder[j]);
    const mD=modelOrder.indexOf(userOrder[i])-modelOrder.indexOf(userOrder[j]);
    if(uD*mD>0)conc++; else if(uD*mD<0)disc++;
  }
  const tau=((conc-disc)/(txns.length*(txns.length-1)/2)).toFixed(2);
  const tauCol=tau>=0.7?"#1a7a4a":tau>=0.4?"#b7770d":"#c0392b";
  const hasCustom=userRanking.length===txns.length;
  const onDE=()=>{
    if(dragIdx===null||dragOver===null||dragIdx===dragOver){setDragIdx(null);setDragOver(null);return;}
    const next=[...ranked];const[moved]=next.splice(dragIdx,1);next.splice(dragOver,0,moved);
    setUserRanking(next.map(t=>t.origIdx));setDragIdx(null);setDragOver(null);
  };
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{fontSize:12,color:"#888",flex:1}}>Drag to rank — highest fraud risk at top.</div>
        {hasCustom&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:8,background:"#f0f7ff",border:"1px solid #d0e8f8",flexShrink:0}}>
          <span style={{fontSize:11,color:"#888"}}>τ:</span>
          <span style={{fontSize:12,fontWeight:500,color:tauCol,minWidth:28}}>{tau}</span>
        </div>}
        {hasCustom&&<button onClick={()=>setUserRanking([])} style={{padding:"4px 8px",borderRadius:7,border:"1px solid #ddd",background:"#fafafa",color:"#888",fontSize:11,cursor:"pointer",flexShrink:0}}>Reset</button>}
      </div>
      {ranked.map((t,i)=>{
        const r=rl(t.score);const tc=TRUTH[t.groundTruth];
        const isSel=selected===t.origIdx;const isDrag=dragIdx===i;const isOver=dragOver===i;
        return (
          <div key={t.id} draggable
            onDragStart={()=>setDragIdx(i)} onDragEnter={()=>setDragOver(i)}
            onDragEnd={onDE} onDragOver={e=>e.preventDefault()}
            style={{display:"flex",alignItems:"center",gap:8,padding:"9px 8px",marginBottom:4,borderRadius:10,
              border:`1px solid ${isOver?"#2980b9":isSel?"#2980b9":"#eee"}`,
              background:isDrag?"#e8f0fe":isOver?"#f0f7ff":isSel?"#f0f7ff":"#fff",
              cursor:"grab",opacity:isDrag?0.5:1}}>
            <span style={{minWidth:20,fontSize:11,color:"#aaa",fontWeight:500}}>#{i+1}</span>
            <span style={{fontSize:16,color:"#ccc",userSelect:"none"}}>⠿</span>
            <div onClick={()=>onSelect(t.origIdx)} style={{flex:1,minWidth:0,cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:500,color:"#333"}}>{t.id}</div>
              <div style={{fontSize:11,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.merchant}</div>
            </div>
            <Pill label={Math.round(t.score*100)} col={r.col} bg={r.bg} sz={10}/>
            <span style={{fontSize:14,color:tc.col}}>{tc.icon}</span>
          </div>
        );
      })}
      <div style={{marginTop:6,fontSize:11,color:"#bbb"}}>⠿ drag · tap row to inspect</div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("home"); // home | task
  const [step,setStep]=useState("triage");
  const [selected,setSelected]=useState(0);
  const [expTab,setExpTab]=useState("shap");
  const [saved,setSaved]=useState({});
  const [userRanking,setUserRanking]=useState([]);
  const [showPriority,setShowPriority]=useState(false);
  const participantId=useState(()=>`P-${Date.now().toString(36).toUpperCase()}`)[0];

  const tx=ALL_TXN[selected]||ALL_TXN[0];
  const score=xgbScore(tx);
  const tc=TRUTH[tx.groundTruth];
  const isTriage=step==="triage";
  const isPriority=step==="priority";
  const completedCount=Object.keys(saved).length;

  const downloadCSV=()=>{
    if(completedCount===0){alert("No responses yet.");return;}
    const labels=new Set();
    Object.values(saved).forEach(r=>Object.keys(r).forEach(k=>{if(!["latency_s","exp","task"].includes(k))labels.add(k);}));
    const fixed=["participant_id","timestamp","workflow_step","explanation_type","transaction_id","latency_seconds"];
    const metCols=[...labels];const allCols=[...fixed,...metCols];
    const rows=Object.entries(saved).map(([key,data])=>{
      const[wf]=key.split("-");
      const row={participant_id:participantId,timestamp:new Date().toISOString(),workflow_step:data.task||wf,explanation_type:data.exp||"",transaction_id:tx.id,latency_seconds:data.latency_s??""};
      metCols.forEach(c=>{row[c]=data[c]??"";});return row;
    });
    const esc=v=>{const s=String(v??"");return s.includes(",")||s.includes('"')||s.includes("\n")?`"${s.replace(/"/g,'""')}"`:s;};
    const csv=[allCols.map(esc).join(","),...rows.map(r=>allCols.map(c=>esc(r[c])).join(","))].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=`xai_study_${participantId}_${new Date().toISOString().slice(0,10)}.csv`;a.click();
  };

  const taskDesc={
    triage:"Review the transaction details and risk score only. Classify the transaction and record your confidence.",
    escalate:"Explore the explanation views. Rate each explanation on clarity, completeness and understanding time.",
    priority:"Rank all 15 transactions by fraud priority. Drag rows to reorder.",
  };

  // ── Home screen ─────────────────────────────────────────────────────────────
  if(screen==="home") return (
    <div style={{fontFamily:"system-ui,sans-serif",padding:"20px 16px",maxWidth:480,margin:"0 auto"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:10,color:"#bbb",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Research Prototype · Adapted from Zafar & Wu (2026)</div>
        <div style={{fontSize:22,fontWeight:600,color:"#222",marginBottom:4}}>XAI Fraud Detection</div>
        <div style={{fontSize:13,color:"#888"}}>Human-grounded evaluation study</div>
      </div>
      <div style={{background:"#f9f9f9",borderRadius:12,padding:"14px",marginBottom:20,fontSize:12,color:"#555",lineHeight:1.6}}>
        <strong>Participant ID:</strong> <span style={{fontFamily:"monospace",color:"#2980b9"}}>{participantId}</span><br/>
        <strong>Dataset:</strong> IEEE-CIS + ULB Credit Card Fraud<br/>
        <strong>Model:</strong> XGBoost v1.7
      </div>
      <div style={{marginBottom:20}}>
        {TASKS.map((t,i)=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1px solid ${step===t.id?"#2980b9":"#eee"}`,background:step===t.id?"#f0f7ff":"#fff",marginBottom:8,cursor:"pointer"}} onClick={()=>setStep(t.id)}>
            <span style={{fontSize:22}}>{t.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:500,color:t.col}}>{t.label}</div>
              <div style={{fontSize:11,color:"#888",marginTop:2}}>{taskDesc[t.id]}</div>
            </div>
            {saved[`${t.id}-${expTab}`]&&<span style={{fontSize:12,color:"#1a7a4a"}}>✓</span>}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setScreen("task")} style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:"#2980b9",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer"}}>Start →</button>
        <button onClick={downloadCSV} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #27ae60",background:completedCount>0?"#edf7f0":"#f5f5f5",color:completedCount>0?"#1a7a4a":"#aaa",fontSize:13,fontWeight:500,cursor:completedCount>0?"pointer":"default"}}>⬇ CSV{completedCount>0?` (${completedCount})`:""}</button>
      </div>
    </div>
  );

  // ── Task screen ─────────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"system-ui,sans-serif",padding:"12px 14px",maxWidth:480,margin:"0 auto"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <button onClick={()=>setScreen("home")} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #ddd",background:"#f5f5f5",fontSize:13,cursor:"pointer",color:"#555"}}>← Home</button>
        <div style={{flex:1,display:"flex",gap:6}}>
          {TASKS.map(t=>(
            <button key={t.id} onClick={()=>setStep(t.id)}
              style={{flex:1,padding:"6px 4px",borderRadius:8,border:`1px solid ${step===t.id?t.col:"#eee"}`,background:step===t.id?t.bg:"#fafafa",cursor:"pointer",textAlign:"center",fontSize:10,color:step===t.id?t.col:"#888",fontWeight:step===t.id?500:400}}>
              {t.icon}<br/>{t.label.split("·")[1]?.trim()||t.label}
              {saved[`${t.id}-${expTab}`]&&<span style={{display:"block",fontSize:9,color:"#1a7a4a"}}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Task instruction */}
      <Card style={{background:"#f9f9f9",border:"1px solid #eee"}}>
        <div style={{fontSize:14,color:"#444",fontWeight:500,lineHeight:1.6}}>{taskDesc[step]}</div>
      </Card>

      {/* Legend */}
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {Object.entries(TRUTH).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:8,background:v.bg,border:`1px solid ${v.col}30`}}>
            <span style={{fontSize:12,color:v.col,fontWeight:700}}>{v.icon}</span>
            <span style={{fontSize:10,color:v.col,fontWeight:500}}>{v.label}</span>
          </div>
        ))}
      </div>

      {/* Task 3: Priority list */}
      {isPriority && (
        <Card>
          <PriorityList txns={ALL_TXN} selected={selected} onSelect={i=>{setSelected(i);setShowPriority(false);}} userRanking={userRanking} setUserRanking={setUserRanking}/>
          <EvalWidget step={step} expTab={expTab} saved={saved} onSave={(k,d)=>setSaved(s=>({...s,[k]:d}))}/>
        </Card>
      )}

      {/* Tasks 1 & 2: Single transaction */}
      {!isPriority && (
        <>
          {/* Nav */}
          <Card style={{padding:"10px 12px"}}>
            <div style={{fontSize:10,color:"#bbb",textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Current alert</div>
            <div style={{fontSize:14,fontWeight:500,color:"#333"}}>{tx.id} — {tx.merchant}</div>
            <div style={{display:"flex",gap:6,marginTop:10,alignItems:"center"}}>
              <button onClick={()=>setSelected(i=>Math.max(0,i-1))} disabled={selected===0}
                style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid #e0e0e0",background:selected===0?"#fafafa":"#fff",color:selected===0?"#ccc":"#555",fontSize:13,cursor:selected===0?"default":"pointer"}}>← Prev</button>
              <span style={{fontSize:11,color:"#aaa",minWidth:40,textAlign:"center"}}>{selected+1}/{ALL_TXN.length}</span>
              <button onClick={()=>setSelected(i=>Math.min(ALL_TXN.length-1,i+1))} disabled={selected===ALL_TXN.length-1}
                style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid #e0e0e0",background:selected===ALL_TXN.length-1?"#fafafa":"#fff",color:selected===ALL_TXN.length-1?"#ccc":"#555",fontSize:13,cursor:selected===ALL_TXN.length-1?"default":"pointer"}}>Next →</button>
            </div>
          </Card>

          {/* Transaction details */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:600,color:"#222",marginBottom:2}}>{tx.merchant}</div>
                <div style={{fontSize:12,color:"#888",marginBottom:10}}>{tx.category} · {tx.country}</div>
                {!isTriage&&<Pill label={`${tc.icon} ${tc.label}`} col={tc.col} bg={tc.bg}/>}
              </div>
              <ScoreRing score={score}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
              {[
                ["Amount",    `€${tx.amount.toLocaleString()}`, `Avg: €${tx.avgSpend}`],
                ["Time",      tx.time,                          `Hour ${tx.hour}`],
                ["Location",  tx.country,                       `${tx.distanceKm}km from home`],
                ["Velocity",  `${tx.velocity}/hr`,              tx.intl?"International":"Domestic"],
                ["Card",      tx.cardPresent?"Present":"Absent",tx.newMerchant?"New merchant":"Known"],
                ["Category",  tx.category,                      ""],
              ].map(([l,v,s])=>(
                <div key={l} style={{background:"#f9f9f9",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:"#bbb",marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:500,color:"#333"}}>{v}</div>
                  {s&&<div style={{fontSize:11,color:"#888"}}>{s}</div>}
                </div>
              ))}
            </div>
          </Card>

          {/* Task 1: Eval only */}
          {isTriage&&(
            <Card>
              <EvalWidget step={step} expTab={expTab} saved={saved} onSave={(k,d)=>setSaved(s=>({...s,[k]:d}))}/>
            </Card>
          )}

          {/* Task 2: Explanations + eval */}
          {!isTriage&&(
            <Card>
              {EXP_GROUPS.map(g=>(
                <div key={g.id} style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:500,color:g.col,marginBottom:4}}>{g.label} <span style={{fontSize:10,color:"#bbb",fontWeight:400}}>— {g.desc}</span></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {g.tabs.map(t=>(
                      <button key={t.id} onClick={()=>setExpTab(t.id)}
                        style={{padding:"6px 12px",fontSize:12,border:`1px solid ${expTab===t.id?g.col:"#e0e0e0"}`,borderRadius:16,background:expTab===t.id?g.bg:"#fff",color:expTab===t.id?g.col:"#888",cursor:"pointer",fontWeight:expTab===t.id?500:400}}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{borderTop:"1px solid #f0f0f0",paddingTop:14,marginTop:4}}>
                {expTab==="shap"           &&<ShapPanel tx={tx}/>}
                {expTab==="lime"           &&<LimePanel tx={tx}/>}
                {expTab==="llm"            &&<LLMPanel tx={tx} score={score}/>}
                {expTab==="counterfactual" &&<CounterfactualPanel tx={tx} score={score}/>}
                {expTab==="logreg"         &&<LogRegPanel tx={tx}/>}
                {expTab==="dtree"          &&<DTreePanel tx={tx}/>}
                {expTab==="peers"          &&<PeersPanel/>}
              </div>
              <EvalWidget step={step} expTab={expTab} saved={saved} onSave={(k,d)=>setSaved(s=>({...s,[k]:d}))}/>
            </Card>
          )}
        </>
      )}
    </div>
  );
}