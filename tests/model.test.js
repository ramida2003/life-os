import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDay,blankDay,metricValue,seriesFor,average,defaultSettings,shiftDate,streakFor} from '../src/model.js';
test('legacy entries keep tasks, sleep, mood, habits and complete expense totals',()=>{
 const d=normalizeDay({tasks:[{id:1,text:'Gym',done:true}],health:{water:1500,sleep:7,meals:['Oats']},mental:{mood:'Calm'},habits:{cgma:true,reading:false},finance:{spent:1250,expenses:[300,500]}});
 assert.equal(d.tasks[0].done,true);assert.equal(d.health.sleep,7);assert.equal(d.mental.mood,'Calm');assert.equal(d.habits.cgma,true);assert.equal(metricValue(d,'spending',defaultSettings),1250);assert.equal(d.legacy,true);
 assert.deepEqual(normalizeDay(d),d);
});
test('unlogged days are gaps; an explicitly logged zero contributes to the average',()=>{
 const d=blankDay();d.health.water=1000;d.logged.water=true;
 const zero=blankDay();zero.logged.water=true;
 const s=seriesFor({'2026-10-01':d,'2026-10-03':zero,'2026-10-02':blankDay()},'2026-10-03',3,'water',defaultSettings);
 assert.deepEqual(s.map(x=>x.value),[1000,null,0]);assert.equal(average(s),500);
 assert.equal(metricValue(blankDay(),'habits',defaultSettings),null);
});
test('changing habit settings does not rewrite historical percentages',()=>{
 const d=normalizeDay({habits:{cgma:true,reading:false}});
 assert.equal(metricValue(d,'habits',{...defaultSettings,habits:[{id:'new'}]}),50);
});
test('date arithmetic crosses months and streaks use calendar days',()=>{
 assert.equal(shiftDate('2026-10-01',-1),'2026-09-30');
 const d={'2026-10-01':{habits:{a:true}},'2026-09-30':{habits:{a:true}}};
 assert.equal(streakFor(d,'2026-10-02','a'),2);assert.equal(streakFor(d,'2026-10-03','a'),0);
});
