export const DATA_KEY = 'life-os-v1';
export const SETTINGS_KEY = 'life-os-settings-v2';
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const shiftDate = (key, n) => { const d = new Date(`${key}T12:00:00`); d.setDate(d.getDate() + n); return dateKey(d); };
export const dateLabel = (key, options = {month:'short', day:'numeric'}) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, options);
export const defaultSettings = {name:'Ramida', currency:'LKR', waterGoal:3000, sleepGoal:8, mealGoal:3, focusMinutes:25, accent:'blue', theme:'dark', cards:['water','sleep','workout','mood','meals','spending'], habits:[{id:'cgma',name:'CGMA prep'},{id:'reading',name:'Reading'}]};
export function blankDay() { return {tasks:[], health:{water:0,sleep:null,workout:false,workoutLog:'',meals:[]}, mental:{mood:null}, habits:{}, finance:{spent:0,expenses:[]}, focusMinutes:0, logged:{}}; }
export function normalizeDay(raw) {
 const b=blankDay(); const d={...b,...raw,health:{...b.health,...raw.health},mental:{...b.mental,...raw.mental},finance:{...b.finance,...raw.finance},habits:{...raw.habits}};
 d.legacy=raw.legacy??!raw.logged;
 d.logged=raw.logged||{water:true,sleep:raw.health?.sleep!=null,workout:true,meals:true,mood:!!raw.mental?.mood,spending:true,habits:Object.keys(raw.habits||{}).length>0};
 d.habitTargetIds=raw.habitTargetIds||Object.keys(raw.habits||{});
 d.finance.expenses=(raw.finance?.expenses||[]).map((x,i)=>typeof x==='number'?{id:`legacy-${i}`,amount:x,note:'Expense'}:x);
 const sum=d.finance.expenses.reduce((s,x)=>s+x.amount,0);
 if(d.finance.spent>sum)d.finance.expenses.push({id:'legacy-balance',amount:d.finance.spent-sum,note:'Earlier spending'});
 return d;
}
export function loadData(){const raw=JSON.parse(localStorage.getItem(DATA_KEY)||'{}');if(!raw||Array.isArray(raw)||typeof raw!=='object')throw Error('Invalid saved data');return Object.fromEntries(Object.entries(raw).filter(([k])=>/^\d{4}-\d{2}-\d{2}$/.test(k)).map(([k,v])=>[k,normalizeDay(v)]));}
export function metricValue(day,key,settings){
 if(!day)return null;
 if(key==='habits'){const ids=day.habitTargetIds||settings.habits.map(h=>h.id);return day.logged.habits&&ids.length?Math.round(ids.filter(id=>day.habits[id]).length/ids.length*100):null;}
 if(key==='focus')return day.logged.focus?day.focusMinutes:null;
 if(!day.logged[key])return null;
 return {water:day.health.water,sleep:day.health.sleep,workout:day.health.workout?1:0,meals:day.health.meals.length,spending:day.finance.expenses.reduce((s,x)=>s+x.amount,0)}[key]??null;
}
export function seriesFor(data,end,days,metric,settings){return Array.from({length:days},(_,i)=>{const date=shiftDate(end,i-days+1);return {date,value:metricValue(data[date],metric,settings)};});}
export function streakFor(data,end,id){let date=end,count=0;if(!data[date]?.habits[id])date=shiftDate(date,-1);while(data[date]?.habits[id]&&count<10000){count++;date=shiftDate(date,-1);}return count;}
export const average=series=>{const v=series.filter(x=>x.value!==null);return v.length?v.reduce((s,x)=>s+x.value,0)/v.length:null;};
export const number=v=>Number(v.toFixed(2)).toLocaleString();
