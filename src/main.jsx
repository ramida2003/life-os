import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlarmClock, Check, ChevronLeft, ChevronRight, Circle, Droplets, Dumbbell,
  Moon, Pause, Play, Plus, RotateCcw, TimerReset, Trash2, Wallet, X
} from 'lucide-react';
import './styles.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

const STORAGE_KEY = 'life-os-v1';
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayKey = () => dateKey(new Date());
const defaultDay = () => ({
  tasks: [
    { id: 'plan-the-day', text: 'Plan the day', done: false },
    { id: 'move-your-body', text: 'Move your body', done: false }
  ],
  health: { workout: false, workoutLog: '', meals: [], water: 0, sleep: 7 },
  mental: { mood: 'Focused' },
  habits: { cgma: false, reading: false },
  finance: { spent: 0, expenses: [] }
});
const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } };

function App() {
  const [allData, setAllData] = useState(load);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [now, setNow] = useState(new Date());
  const [newTask, setNewTask] = useState('');
  const [meal, setMeal] = useState('');
  const [expense, setExpense] = useState('');
  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const data = allData[selectedDate] || defaultDay();

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(allData)); }, [allData]);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer(v => v > 0 ? v - 1 : 25 * 60), 1000);
    return () => clearInterval(id);
  }, [running]);
  const update = (fn) => setAllData(prev => ({ ...prev, [selectedDate]: fn(prev[selectedDate] || defaultDay()) }));
  const setPath = (group, patch) => update(d => ({ ...d, [group]: { ...d[group], ...patch } }));
  const dateObj = new Date(`${selectedDate}T12:00:00`);
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 3 + i); return d;
  }), []);
  const tasksDone = data.tasks.filter(t => t.done).length;
  const dailyDone = [data.health.workout, data.health.water >= 3000, data.habits.cgma, data.habits.reading, data.tasks.length && tasksDone === data.tasks.length].filter(Boolean).length;
  const progress = Math.round((dailyDone / 5) * 100);
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const chooseDate = (d) => setSelectedDate(dateKey(d));

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient ambient-three" />
    <section className="content">
      <header className="topbar">
        <div><p className="eyebrow">{dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>{greeting}, Ramida.</h1></div>
        <div className="live-time">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </header>

      <section className="glass hero-card">
        <div><p className="label">TODAY’S RHYTHM</p><h2>Build a life you want to wake up to.</h2><p className="muted">{dailyDone} of 5 daily intentions completed</p></div>
        <div className="ring" style={{ '--p': `${progress * 3.6}deg` }}><span>{progress}%</span><small>done</small></div>
      </section>

      <div className="week-strip">{week.map(d => { const id = dateKey(d); const active = id === selectedDate; return <button key={id} onClick={() => chooseDate(d)} className={`day-chip ${active ? 'active' : ''}`}><span>{d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span><b>{d.getDate()}</b></button>; })}</div>

      <section className="grid operational">
        <article className="glass card tasks-card"><div className="card-title"><div><span className="icon-pill"><Check size={16}/></span><h3>Checklist</h3></div><span className="count">{tasksDone}/{data.tasks.length}</span></div>
          <div className="task-list">{data.tasks.map(t => <div className={`task ${t.done ? 'complete' : ''}`} key={t.id}><button aria-label="toggle task" onClick={() => update(d => ({...d, tasks:d.tasks.map(x => x.id === t.id ? {...x, done: !x.done} : x)}))}>{t.done ? <Check size={17}/> : <Circle size={17}/>}</button><span>{t.text}</span><button className="delete" onClick={() => update(d => ({...d, tasks:d.tasks.filter(x => x.id !== t.id)}))}><X size={15}/></button></div>)}</div>
          <form className="inline-form" onSubmit={e => {e.preventDefault(); if (!newTask.trim()) return; update(d => ({...d, tasks:[...d.tasks, {id:crypto.randomUUID(), text:newTask.trim(), done:false}]})); setNewTask('');}}><input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Add an intention…"/><button><Plus size={17}/></button></form>
        </article>
        <article className="glass card focus-card"><div className="card-title"><div><span className="icon-pill"><AlarmClock size={16}/></span><h3>Focus flow</h3></div><span className="muted">Pomodoro</span></div><div className="timer-display">{fmt(timer)}</div><div className="timer-controls"><button onClick={()=>setRunning(!running)} className="primary round">{running ? <Pause size={18}/> : <Play size={18}/>}</button><button onClick={()=>{setRunning(false);setTimer(25*60)}} className="round"><RotateCcw size={17}/></button></div></article>
      </section>

      <section className="section-heading"><h2>Mind & body</h2><span>small actions, daily</span></section>
      <section className="grid health-grid">
        <article className="glass card workout"><div className="card-title"><div><span className="icon-pill"><Dumbbell size={16}/></span><h3>Workout</h3></div><button onClick={()=>setPath('health',{workout:!data.health.workout})} className={`toggle ${data.health.workout?'on':''}`}><i/></button></div><input value={data.health.workoutLog} onChange={e=>setPath('health',{workoutLog:e.target.value})} placeholder="Today’s routine…"/></article>
        <article className="glass card water"><div className="card-title"><div><span className="icon-pill"><Droplets size={16}/></span><h3>Hydration</h3></div><b>{data.health.water / 1000}L</b></div><button className="water-button" onClick={()=>setPath('health',{water:Math.min(5000,data.health.water+250)})}><Droplets size={30} fill="currentColor"/><span>+250 ml</span></button><div className="progress"><i style={{width:`${Math.min(100,data.health.water/30)}%`}}/></div><p className="muted">Target: 3.0L</p></article>
        <article className="glass card sleep"><div className="card-title"><div><span className="icon-pill"><Moon size={16}/></span><h3>Sleep</h3></div><b>{data.health.sleep}h</b></div><input type="range" min="0" max="12" step="0.5" value={data.health.sleep} onChange={e=>setPath('health',{sleep:Number(e.target.value)})}/></article>
        <article className="glass card mood"><div className="card-title"><div><span className="icon-pill">◌</span><h3>Mood</h3></div></div><div className="moods">{['Focused','Calm','Stressed'].map(m=><button key={m} onClick={()=>setPath('mental',{mood:m})} className={data.mental.mood===m?'selected':''}>{m}</button>)}</div></article>
      </section>

      <section className="section-heading"><h2>Daily logistics</h2><span>keep it simple</span></section>
      <section className="grid bottom-grid">
       <article className="glass card"><div className="card-title"><div><span className="icon-pill">◒</span><h3>Meals</h3></div><b>{data.health.meals.length}</b></div><div className="tags">{data.health.meals.map((m,i)=><span key={i}>{m}<button onClick={()=>setPath('health',{meals:data.health.meals.filter((_,x)=>x!==i)})}>×</button></span>)}</div><form className="inline-form" onSubmit={e=>{e.preventDefault();if(!meal.trim())return;setPath('health',{meals:[...data.health.meals,meal.trim()]});setMeal('')}}><input value={meal} onChange={e=>setMeal(e.target.value)} placeholder="Breakfast, snack…"/><button><Plus size={17}/></button></form></article>
       <article className="glass card"><div className="card-title"><div><span className="icon-pill"><Wallet size={16}/></span><h3>Spent today</h3></div><b>LKR {Number(data.finance.spent).toLocaleString()}</b></div><form className="expense-form" onSubmit={e=>{e.preventDefault(); const n=Number(expense); if(!n)return;setPath('finance',{spent:data.finance.spent+n,expenses:[...data.finance.expenses,n]});setExpense('')}}><span>LKR</span><input inputMode="decimal" value={expense} onChange={e=>setExpense(e.target.value)} placeholder="0"/><button>Add</button></form></article>
       <article className="glass card habits"><div className="card-title"><div><span className="icon-pill"><TimerReset size={16}/></span><h3>Streaks</h3></div></div>{[['cgma','CGMA prep'],['reading','Reading']].map(([key,label])=><button className={`habit ${data.habits[key]?'checked':''}`} key={key} onClick={()=>setPath('habits',{[key]:!data.habits[key]})}><span>{data.habits[key] && <Check size={14}/>}</span>{label}<em>{data.habits[key]?'done':'today'}</em></button>)}</article>
      </section>
    </section>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
