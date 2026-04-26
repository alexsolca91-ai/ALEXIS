import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, BarChart3, Crown, Dumbbell, Flame, Lock, Plus, Trophy, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import './styles.css';

const muscles = {
  'press banca': 'Pecho', 'press inclinado': 'Pecho', 'aperturas': 'Pecho',
  'dominadas': 'Espalda', 'remo': 'Espalda', 'jalon': 'Espalda',
  'curl': 'Biceps', 'triceps': 'Triceps', 'sentadilla': 'Pierna', 'prensa': 'Pierna',
  'peso muerto': 'Espalda', 'bulgara': 'Pierna', 'pantorrilla': 'Pantorrilla',
  'press militar': 'Hombro', 'laterales': 'Hombro'
};

function muscleFor(name){
  const key = name.toLowerCase();
  return Object.keys(muscles).find(k => key.includes(k)) ? muscles[Object.keys(muscles).find(k => key.includes(k))] : 'General';
}
function parseReps(value){ return value.split(',').map(v => Number(v.trim())).filter(Boolean); }
function oneRM(weight, reps){ return Math.round(weight * (1 + reps / 30)); }

function App(){
  const [plan,setPlan]=useState('Elite');
  const [tab,setTab]=useState('dashboard');
  const [entries,setEntries]=useState(()=>JSON.parse(localStorage.getItem('muscleiq_entries')||'[]'));
  const [form,setForm]=useState({exercise:'Press banca',sets:'3',weight:'100',reps:'8,8,7'});
  useEffect(()=>localStorage.setItem('muscleiq_entries',JSON.stringify(entries)),[entries]);
  const stats=useMemo(()=>{
    const totalVolume=entries.reduce((a,e)=>a+e.volume,0);
    const best1RM=Math.max(0,...entries.map(e=>e.est1rm));
    const byMuscle={}; entries.forEach(e=>byMuscle[e.muscle]=(byMuscle[e.muscle]||0)+e.volume);
    return {totalVolume,best1RM,byMuscle};
  },[entries]);
  function addEntry(){
    const reps=parseReps(form.reps); const weight=Number(form.weight)||0; const volume=weight*reps.reduce((a,b)=>a+b,0);
    const maxRep=Math.max(...reps,0); const entry={id:crypto.randomUUID(),date:new Date().toLocaleDateString(),exercise:form.exercise,sets:Number(form.sets),weight,reps:form.reps,muscle:muscleFor(form.exercise),volume,est1rm:oneRM(weight,maxRep)};
    setEntries([entry,...entries]); setTab('dashboard');
  }
  const chart=[...entries].reverse().slice(-8).map((e,i)=>({name:i+1,vol:e.volume,rm:e.est1rm}));
  const muscleChart=Object.entries(stats.byMuscle).map(([name,vol])=>({name,vol}));
  return <main>
    <header className="hero"><div><p className="eyebrow">MuscleIQ PRO</p><h1>Coach inteligente de hipertrofia</h1><p>Registra simple. Analiza profundo. Cobra acceso a tus amigos.</p></div><div className="badge"><Crown/> {plan}</div></header>
    <nav>{['dashboard','registrar','historial','admin'].map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</nav>
    {tab==='dashboard'&&<section className="grid"><Card icon={<Flame/>} title="Volumen total" value={`${stats.totalVolume.toLocaleString()} kg`}/><Card icon={<Trophy/>} title="Mejor 1RM" value={`${stats.best1RM} kg`}/><Card icon={<Users/>} title="Modelo SaaS" value="Pagos activos"/><div className="panel wide"><h2>Progreso reciente</h2><ResponsiveContainer height={220}><LineChart data={chart}><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="vol" strokeWidth={3}/><Line type="monotone" dataKey="rm" strokeWidth={3}/></LineChart></ResponsiveContainer></div><div className="panel wide"><h2>Volumen por músculo</h2><ResponsiveContainer height={220}><BarChart data={muscleChart}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="vol"/></BarChart></ResponsiveContainer></div><Coach entries={entries}/></section>}
    {tab==='registrar'&&<section className="panel"><h2>Nuevo entrenamiento</h2>{['exercise','sets','weight','reps'].map(k=><label key={k}>{k}<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}<button className="primary" onClick={addEntry}><Plus/> Guardar entrenamiento</button></section>}
    {tab==='historial'&&<section className="panel"><h2>Historial</h2>{entries.map(e=><div className="row" key={e.id}><Dumbbell/><div><b>{e.exercise}</b><p>{e.date} · {e.muscle} · {e.sets} series · {e.weight} kg · reps {e.reps}</p></div><strong>{e.volume} kg</strong></div>)}</section>}
    {tab==='admin'&&<section className="grid"><div className="panel wide"><h2>Panel de monetización</h2><p>Planes sugeridos: Gratis, Pro y Elite. Conecta Supabase para usuarios y Mercado Pago o Stripe para cobros.</p><div className="plans"><Plan name="Gratis" price="$0" items={['Registro básico','Historial limitado']}/><Plan name="Pro" price="$99/mes" items={['Dashboard avanzado','AutoLift','Records']}/><Plan name="Elite" price="$199/mes" items={['IA Coach','Rutinas','Retos privados']}/></div></div><div className="panel"><h2><Lock/> Acceso</h2><p>Control por rol: admin, cliente e invitado.</p></div></section>}
  </main>
}
function Card({icon,title,value}){return <div className="card">{icon}<p>{title}</p><h2>{value}</h2></div>}
function Plan({name,price,items}){return <div className="plan"><h3>{name}</h3><h2>{price}</h2>{items.map(i=><p key={i}>✓ {i}</p>)}</div>}
function Coach({entries}){const last=entries[0]; return <div className="panel wide"><h2><Activity/> IA Coach</h2><p>{last?`Último: ${last.exercise}. Sugerencia: si completaste todas las reps con buena técnica, sube 2.5 kg la próxima sesión.`:'Registra tu primer entrenamiento para activar recomendaciones.'}</p></div>}

createRoot(document.getElementById('root')).render(<App/>);