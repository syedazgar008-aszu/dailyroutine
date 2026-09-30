import { useState, useEffect } from 'react'

const useLS = (k, d) => {
  const [v, s] = useState(() => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } })
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)) }, [k, v])
  return [v, s]
}
const uid = () => Math.random().toString(36).slice(2, 9)
const PAGES = [['home','Home','🏠'],['nutrition','Nutrition','🍴'],['protein','Protein Calculator','💪'],['kcal','Kcal Calculator','🔥'],['workout','Workout','🏋️'],['routine','Daily Routine','📅'],['progress','Progress','📊'],['journal','Journal','📓'],['settings','Settings','⚙️']]
const D = {
  profile: { name:'Aszu', height:173, weight:58, age:20, sex:'M', kcal:2500, protein:115, carbs:300, fats:70 },
  meals: [
    { id:1, type:'Breakfast', time:'08:00', name:'Oats + Banana + Almonds', e:'🥣', kcal:450, p:20, c:60, f:15, done:true },
    { id:2, type:'Lunch', time:'13:00', name:'Chicken Breast + Brown Rice + Veggies', e:'🍗', kcal:600, p:50, c:70, f:18, done:true },
    { id:3, type:'Evening Snack', time:'16:30', name:'Greek Yogurt + Berries', e:'🍓', kcal:250, p:25, c:20, f:8, done:false },
    { id:4, type:'Dinner', time:'20:00', name:'Egg Whites + Salad + Quinoa', e:'🥗', kcal:400, p:40, c:40, f:12, done:false }],
  routine: [
    { id:1, t:'Morning', d:'Wake up & Hydrate', time:'6:00 AM', i:'☀️', done:true },
    { id:2, t:'Breakfast', d:'High Protein Meal', time:'8:00 AM', i:'🍴', done:true },
    { id:3, t:'Workout', d:'Strength Training', time:'5:00 PM', i:'🏋️', done:true },
    { id:4, t:'Lunch', d:'Balanced Meal', time:'1:00 PM', i:'🥘', done:false },
    { id:5, t:'Study / Work', d:'Focus Time', time:'3:00 PM', i:'💻', done:false },
    { id:6, t:'Sleep', d:'7-8 Hours', time:'10:00 PM', i:'🌙', done:false }],
  workouts: [{ id:1, name:'Chest & Triceps', min:45, day:'Mon', done:true }, { id:2, name:'Back & Biceps', min:50, day:'Wed', done:true }],
  weights: [{ id:1, date:'2026-09-01', kg:71.2 }, { id:2, date:'2026-09-14', kg:70.6 }, { id:3, date:'2026-09-25', kg:70 }],
  journal: [{ id:1, date:'2026-09-27', mood:'😊', text:'Hit my protein target and finished all workouts this week.' }],
  week: [800,1150,1000,1500,1200,1350,1240],
}
const QUOTES = ['Better Choices, Bigger Results','Small steps every day make big results','Healthy habits build a stronger you','Consistency beats intensity']

function Bar({ v, max, c }) { return <div className="bar"><i style={{ width: Math.min(100, (v / max) * 100) + '%', background: c }} /></div> }
function Modal({ title, onClose, onSubmit, children }) {
  return <div className="modal" onClick={onClose}><form className="card" onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); onSubmit(Object.fromEntries(new FormData(e.target))) }}>
    <div className="hd"><h3>{title}</h3><button type="button" className="x" onClick={onClose}>✕</button></div>{children}
    <div className="hd mt"><button type="button" className="btn o" onClick={onClose}>Cancel</button><button className="btn">Save</button></div></form></div>
}
function Line({ pts, labels, h = 170 }) {
  const w = 500, max = Math.max(...pts, 1) * 1.15, min = 0
  const xy = pts.map((p, i) => [20 + i * ((w - 40) / Math.max(1, pts.length - 1)), h - 24 - ((p - min) / (max - min)) * (h - 44)])
  const path = xy.map(a => a.join(',')).join(' ')
  return <svg viewBox={`0 0 ${w} ${h}`} width="100%"><polygon points={`${xy[0][0]},${h - 24} ${path} ${xy.at(-1)[0]},${h - 24}`} fill="#2f8f5b22" />
    <polyline points={path} fill="none" stroke="#2f8f5b" strokeWidth="2.5" />{xy.map((a, i) => <g key={i}><circle cx={a[0]} cy={a[1]} r="4" fill="#2f8f5b"><title>{pts[i]}</title></circle><text x={a[0]} y={h - 6} fontSize="11" textAnchor="middle" fill="#7a8a82">{labels[i]}</text></g>)}</svg>
}

function Calc({ p, setP, toast, mode, setMode, tabs }) {
  const [w, setW] = useState(p.weight), [goal, setGoal] = useState('Muscle Gain'), [perKg, setPerKg] = useState(2)
  const [h, setH] = useState(p.height), [a, setA] = useState(p.age), [sex, setSex] = useState(p.sex), [act, setAct] = useState(1.55), [kg, setKg] = useState('Maintain')
  const RATE = { 'Muscle Gain':2, 'Fat Loss':1.8, Maintain:1.6, Endurance:1.4 }
  const prot = Math.round(w * perKg)
  const bmr = Math.round(10 * w + 6.25 * h - 5 * a + (sex === 'M' ? 5 : -161)), tdee = Math.round(bmr * act)
  const target = kg === 'Lose' ? tdee - 400 : kg === 'Gain' ? tdee + 300 : tdee
  return <div>
    {tabs && <div className="tabs"><button className={mode === 'protein' ? 'on' : ''} onClick={() => setMode('protein')}>💪 Protein</button><button className={mode === 'kcal' ? 'on' : ''} onClick={() => setMode('kcal')}>🔥 Calories</button></div>}
    <label>Weight (kg)</label><input type="number" value={w} onChange={e => setW(+e.target.value)} />
    {mode === 'protein' ? <>
      <label>Goal</label><select value={goal} onChange={e => { setGoal(e.target.value); setPerKg(RATE[e.target.value]) }}>{Object.keys(RATE).map(g => <option key={g}>{g}</option>)}</select>
      <label>Protein per kg (g)</label><input type="number" step="0.1" value={perKg} onChange={e => setPerKg(+e.target.value)} />
      <div className="res"><small>Recommended Protein Intake</small><b>{prot}</b> g per day</div>
      <button className="btn o mt" onClick={() => { setP({ ...p, protein: prot }); toast('Protein target set to ' + prot + ' g') }}>Set as my target</button>
    </> : <>
      <div className="g2"><div><label>Height (cm)</label><input type="number" value={h} onChange={e => setH(+e.target.value)} /></div><div><label>Age</label><input type="number" value={a} onChange={e => setA(+e.target.value)} /></div></div>
      <div className="g2"><div><label>Sex</label><select value={sex} onChange={e => setSex(e.target.value)}><option value="M">Male</option><option value="F">Female</option></select></div>
      <div><label>Goal</label><select value={kg} onChange={e => setKg(e.target.value)}><option>Lose</option><option>Maintain</option><option>Gain</option></select></div></div>
      <label>Activity</label><select value={act} onChange={e => setAct(+e.target.value)}><option value={1.2}>Sedentary</option><option value={1.375}>Light</option><option value={1.55}>Moderate</option><option value={1.725}>Very active</option></select>
      <div className="res"><small>BMR {bmr} · Maintenance {tdee} kcal</small><b>{target}</b> kcal per day</div>
      <button className="btn o mt" onClick={() => { setP({ ...p, kcal: target }); toast('Calorie target set to ' + target + ' kcal') }}>Set as my target</button>
    </>}
  </div>
}

export default function App() {
  const [page, setPage] = useState('home'), [q, setQ] = useState(''), [pop, setPop] = useState(null), [modal, setModal] = useState(null), [msg, setMsg] = useState(''), [mode, setMode] = useState('protein'), [qi, setQi] = useState(0)
  const [p, setP] = useLS('df_p', D.profile), [meals, setMeals] = useLS('df_m', D.meals), [routine, setRoutine] = useLS('df_r', D.routine)
  const [workouts, setWorkouts] = useLS('df_w', D.workouts), [weights, setWeights] = useLS('df_kg', D.weights), [journal, setJournal] = useLS('df_j', D.journal)
  const [week, setWeek] = useLS('df_wk', D.week), [water, setWater] = useLS('df_water', 6), [start] = useLS('df_start', Date.now())
  const toast = t => { setMsg(t); setTimeout(() => setMsg(''), 2200) }
  const go = k => { setPage(k); setPop(null); window.scrollTo(0, 0) }
  const tog = (set, id) => set(l => l.map(x => x.id === id ? { ...x, done: !x.done } : x))
  const del = (set, id) => set(l => l.filter(x => x.id !== id))
  const T = meals.filter(m => m.done).reduce((a, m) => ({ kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }), { kcal: 0, p: 0, c: 0, f: 0 })
  const rDone = routine.filter(r => r.done).length, goalPct = routine.length ? Math.round(rDone / routine.length * 100) : 0
  const day = new Date().getDay(), wk = week.map((v, i) => i === (day + 6) % 7 ? T.kcal : v)
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening'
  const today = new Date().toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
  const journey = Math.floor((Date.now() - start) / 864e5) + 1
  const gs = T.p + T.c + T.f || 1, pp = T.p / gs * 100, cp = T.c / gs * 100
  const notes = [...meals.filter(m => !m.done).map(m => `Pending: ${m.type} at ${m.time}`), ...(water < 8 ? [`Drink ${8 - water} more glasses of water`] : [])]
  const lastW = weights.at(-1)?.kg ?? p.weight, dW = +(lastW - (weights[0]?.kg ?? lastW)).toFixed(1), wDone = workouts.filter(w => w.done).length
  const search = v => { setQ(v); if (v && page !== 'nutrition') setPage('nutrition') }

  const macro = [['Calories', T.kcal, p.kcal, 'kcal', '#2f8f5b', '🔥'], ['Protein', T.p, p.protein, 'g', '#3b82f6', '💧'], ['Carbs', T.c, p.carbs, 'g', '#f59e0b', '🌾'], ['Fats', T.f, p.fats, 'g', '#8b5cf6', '🥑']]
  const MealRow = ({ m, x }) => <div className="row"><div className="e">{m.e}</div><div className="t"><b>{m.type} <small style={{ display: 'inline' }}>({m.time})</small></b><small>{m.name}</small><small>{m.kcal} kcal · {m.p}g P · {m.c}g C · {m.f}g F</small></div>
    {x && <button className="x" onClick={() => { del(setMeals, m.id); toast('Meal removed') }}>🗑</button>}
    <button className={'chk' + (m.done ? ' on' : '')} aria-label="toggle meal" onClick={() => tog(setMeals, m.id)}>{m.done && '✓'}</button></div>
  const RouteRow = ({ r, x }) => <div className="row"><div className="e" style={{ fontSize: 20 }}>{r.i}</div><div className="t"><b>{r.t}</b><small>{r.d} · {r.time}</small></div>
    {x && <button className="x" onClick={() => del(setRoutine, r.id)}>🗑</button>}<button className={'chk' + (r.done ? ' on' : '')} aria-label="toggle" onClick={() => tog(setRoutine, r.id)}>{r.done && '✓'}</button></div>

  const openMeal = () => setModal('meal'), openWork = () => setModal('workout')
  const home = <div className="layout"><div className="col">
    <div className="card hero"><div><h1>{greet}, {p.name.split(' ')[0]}! 👋</h1><p>Healthy food + Consistent routine = Better you</p></div>
      <button className="date" onClick={() => go('routine')}>📅 {today}<small>Day {journey} of your journey</small></button></div>
    <div className="g4">{macro.map(([n, v, t, u, c, i]) => <div className="card stat" key={n}><h4><span className="ico" style={{ background: c }}>{i}</span>{n}</h4><b>{v.toLocaleString()}</b> <span>/ {t.toLocaleString()} {u}</span><Bar v={v} max={t} c={c} /><div className="sm">{Math.round(v / t * 100)}% · {Math.max(0, t - v)} {u} to go</div></div>)}</div>
    <div className="g2"><div className="card"><h3>Daily Nutrition Overview</h3><div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <div className="donut" style={{ background: `conic-gradient(#2f8f5b 0 ${pp}%,#f59e0b ${pp}% ${pp + cp}%,#8b5cf6 ${pp + cp}% 100%)` }}><div><span><b>{T.kcal}</b>kcal</span></div></div>
      <ul className="lg">{[['Protein', T.p, '#2f8f5b', pp], ['Carbs', T.c, '#f59e0b', cp], ['Fats', T.f, '#8b5cf6', 100 - pp - cp]].map(([n, v, c, s]) => <li key={n}><i style={{ background: c }} /><span>{n}</span><span>{v} g</span><span>{Math.round(s)}%</span></li>)}</ul></div></div>
      <div className="card"><h3>Weekly Calorie Trend</h3><Line pts={wk} labels={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']} /></div></div>
    <div className="g2"><div className="card"><div className="hd"><h3>Today's Meals</h3><button className="link" onClick={() => go('nutrition')}>View All →</button></div>{meals.slice(0, 4).map(m => <MealRow key={m.id} m={m} />)}</div>
      <div className="card"><h3>Protein & Calories Calculator</h3><Calc p={p} setP={setP} toast={toast} mode={mode} setMode={setMode} tabs /></div></div>
    <div className="g2"><div className="card"><h3>Progress Overview</h3><div className="g2"><div><small className="empty">Weight</small><br /><b>{lastW} kg</b><div className="sm">{dW <= 0 ? '↓' : '↑'} {Math.abs(dW)} kg</div></div><div><small className="empty">Workout</small><br /><b>{wDone} days</b></div><div><small className="empty">Water</small><br /><b>{water} glasses</b></div><div><small className="empty">Routine</small><br /><b>{goalPct}%</b></div></div></div>
      <div className="banner"><span>{QUOTES[qi]}</span><button aria-label="next quote" onClick={() => setQi((qi + 1) % QUOTES.length)}>›</button></div></div>
  </div><div className="col">
    <div className="card"><div className="prof"><div className="av lg">{p.name[0]}</div><div><h3 style={{ margin: 0 }}>{p.name}</h3><small className="empty">Fitness Enthusiast</small></div></div><div className="pst"><div><b>{p.height} cm</b>Height</div><div><b>{p.weight} kg</b>Weight</div><div><b>{p.age}</b>Age</div></div></div>
    <div className="card"><h3>Quick Actions</h3><div className="col" style={{ gap: 10 }}><button className="btn w qa1" onClick={openMeal}>🍴 Log Meal</button><button className="btn w qa2" onClick={() => go('protein')}>💧 Calculate Protein</button><button className="btn w qa3" onClick={() => go('kcal')}>🔥 Calculate Kcal</button><button className="btn w qa4" onClick={openWork}>🏋️ Add Workout</button></div></div>
    <div className="card"><div className="hd"><div><h3 style={{ margin: 0 }}>Today's Goal</h3><small className="empty">Stay consistent. You're doing great!</small></div><div className="ring" style={{ background: `conic-gradient(#2f8f5b ${goalPct}%,#e5ece7 0)` }}><div>{goalPct}%</div></div></div></div>
    <div className="card"><h3>Nutrition Tips</h3><p className="empty">Add more vegetables and drink at least 3L of water daily.</p><div className="wt">💧 <button onClick={() => setWater(Math.max(0, water - 1))}>−</button><b>{water} glasses</b><button onClick={() => { setWater(water + 1); toast('Water logged') }}>+</button></div></div>
    <div className="card"><h3>Weekly Routine</h3><p className="empty">Healthy habits build a stronger you.</p><button className="btn o" onClick={() => go('routine')}>Open routine</button></div>
  </div></div>

  const pages = {
    home,
    nutrition: <div className="card"><div className="hd"><h3>Nutrition {q && `· results for "${q}"`}</h3><button className="btn" onClick={openMeal}>+ Log Meal</button></div>
      {(() => { const l = meals.filter(m => (m.name + m.type).toLowerCase().includes(q.toLowerCase())); return l.length ? l.map(m => <MealRow key={m.id} m={m} x />) : <p className="empty">No meals found. Log a meal to get started.</p> })()}</div>,
    protein: <div className="card" style={{ maxWidth: 520 }}><h3>Protein Calculator</h3><Calc p={p} setP={setP} toast={toast} mode="protein" /></div>,
    kcal: <div className="card" style={{ maxWidth: 520 }}><h3>Kcal Calculator</h3><Calc p={p} setP={setP} toast={toast} mode="kcal" /></div>,
    workout: <div className="card"><div className="hd"><h3>Workouts</h3><button className="btn" onClick={openWork}>+ Add Workout</button></div>
      {workouts.length ? workouts.map(w => <div className="row" key={w.id}><div className="e">🏋️</div><div className="t"><b>{w.name}</b><small>{w.day} · {w.min} min</small></div><button className="x" onClick={() => del(setWorkouts, w.id)}>🗑</button><button className={'chk' + (w.done ? ' on' : '')} onClick={() => tog(setWorkouts, w.id)}>{w.done && '✓'}</button></div>) : <p className="empty">No workouts yet. Add your first one.</p>}</div>,
    routine: <div className="card"><div className="hd"><h3>Daily Routine · {rDone}/{routine.length} done</h3><button className="btn" onClick={() => setModal('routine')}>+ Add Task</button></div>{routine.map(r => <RouteRow key={r.id} r={r} x />)}</div>,
    progress: <div className="g2"><div className="card"><h3>Weight Trend</h3>{weights.length > 1 ? <Line pts={weights.map(w => w.kg)} labels={weights.map(w => w.date.slice(5))} /> : <p className="empty">Add two weigh-ins to see a trend.</p>}</div>
      <div className="card"><div className="hd"><h3>Weigh-ins</h3><button className="btn" onClick={() => setModal('weight')}>+ Add</button></div>{[...weights].reverse().map(w => <div className="row" key={w.id}><div className="t"><b>{w.kg} kg</b><small>{w.date}</small></div><button className="x" onClick={() => del(setWeights, w.id)}>🗑</button></div>)}</div></div>,
    journal: <div className="card"><div className="hd"><h3>Journal</h3><button className="btn" onClick={() => setModal('journal')}>+ New Entry</button></div>
      {journal.length ? [...journal].reverse().map(j => <div className="row" key={j.id}><div className="e">{j.mood}</div><div className="t"><b>{j.date}</b><small style={{ fontSize: 14, color: 'var(--tx)' }}>{j.text}</small></div><button className="x" onClick={() => del(setJournal, j.id)}>🗑</button></div>) : <p className="empty">No entries yet. Write how today went.</p>}</div>,
    settings: <div className="card" style={{ maxWidth: 560 }}><h3>Settings</h3><form onSubmit={e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); setP({ ...p, ...f, height: +f.height, weight: +f.weight, age: +f.age, kcal: +f.kcal, protein: +f.protein, carbs: +f.carbs, fats: +f.fats }); toast('Settings saved') }}>
      <label>Name</label><input name="name" defaultValue={p.name} required />
      <div className="g2"><div><label>Height (cm)</label><input name="height" type="number" defaultValue={p.height} /></div><div><label>Weight (kg)</label><input name="weight" type="number" defaultValue={p.weight} /></div><div><label>Age</label><input name="age" type="number" defaultValue={p.age} /></div><div><label>Sex</label><select name="sex" defaultValue={p.sex}><option value="M">Male</option><option value="F">Female</option></select></div>
      <div><label>Calories target</label><input name="kcal" type="number" defaultValue={p.kcal} /></div><div><label>Protein target (g)</label><input name="protein" type="number" defaultValue={p.protein} /></div><div><label>Carbs target (g)</label><input name="carbs" type="number" defaultValue={p.carbs} /></div><div><label>Fats target (g)</label><input name="fats" type="number" defaultValue={p.fats} /></div></div>
      <div className="hd mt"><button className="btn">Save changes</button><button type="button" className="btn o" onClick={() => { if (confirm('Reset all data?')) { localStorage.clear(); location.reload() } }}>Reset all data</button></div></form></div>,
  }

  return <div className="app">
    <aside className="side"><div className="logo"><i>🌿</i><div>DailyFit<small>Eat Better · Live Better</small></div></div>
      {PAGES.map(([k, n, i]) => <button key={k} className={'nav' + (page === k ? ' on' : '')} onClick={() => go(k)}><span>{i}</span>{n}</button>)}
      <div className="quote">Small steps every day make big results.</div></aside>
    <main className="main"><div className="top"><input className="search" placeholder="🔍 Search food, recipes, workout..." value={q} onChange={e => search(e.target.value)} />
      <button className="ib" aria-label="notifications" onClick={() => setPop(pop === 'n' ? null : 'n')}>🔔{notes.length > 0 && <span className="dot" />}</button>
      <button className="user" onClick={() => setPop(pop === 'u' ? null : 'u')}><span className="av">{p.name[0]}</span><span>{p.name}<br /><small style={{ color: 'var(--mu)', fontWeight: 500 }}>Fitness Enthusiast</small></span> ▾</button>
      {pop === 'n' && <div className="pop" style={{ right: 190 }}>{notes.length ? notes.map(n => <p key={n}>{n}</p>) : <p>You're all caught up 🎉</p>}</div>}
      {pop === 'u' && <div className="pop"><button onClick={() => go('settings')}>⚙️ Settings</button><button onClick={() => go('progress')}>📊 My progress</button><button onClick={() => { setQ(''); go('home') }}>🏠 Home</button></div>}</div>
      {pages[page]}</main>
    {modal === 'meal' && <Modal title="Log Meal" onClose={() => setModal(null)} onSubmit={f => { setMeals([...meals, { id: uid(), type: f.type, time: f.time, name: f.name, e: '🍽️', kcal: +f.kcal, p: +f.p, c: +f.c, f: +f.f, done: true }]); setModal(null); toast('Meal logged') }}>
      <label>Meal type</label><select name="type"><option>Breakfast</option><option>Lunch</option><option>Evening Snack</option><option>Dinner</option></select><label>Food</label><input name="name" required placeholder="e.g. Paneer + Roti" /><label>Time</label><input name="time" type="time" defaultValue="12:00" />
      <div className="g2"><div><label>Kcal</label><input name="kcal" type="number" required /></div><div><label>Protein (g)</label><input name="p" type="number" defaultValue="0" /></div><div><label>Carbs (g)</label><input name="c" type="number" defaultValue="0" /></div><div><label>Fats (g)</label><input name="f" type="number" defaultValue="0" /></div></div></Modal>}
    {modal === 'workout' && <Modal title="Add Workout" onClose={() => setModal(null)} onSubmit={f => { setWorkouts([...workouts, { id: uid(), name: f.name, min: +f.min, day: f.day, done: false }]); setModal(null); toast('Workout added') }}>
      <label>Workout</label><input name="name" required placeholder="e.g. Leg day" /><label>Duration (min)</label><input name="min" type="number" defaultValue="45" /><label>Day</label><select name="day">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d}>{d}</option>)}</select></Modal>}
    {modal === 'routine' && <Modal title="Add Task" onClose={() => setModal(null)} onSubmit={f => { setRoutine([...routine, { id: uid(), t: f.t, d: f.d, time: f.time, i: '✅', done: false }]); setModal(null); toast('Task added') }}>
      <label>Task</label><input name="t" required /><label>Details</label><input name="d" /><label>Time</label><input name="time" placeholder="7:00 PM" /></Modal>}
    {modal === 'weight' && <Modal title="Add Weigh-in" onClose={() => setModal(null)} onSubmit={f => { setWeights([...weights, { id: uid(), date: new Date().toISOString().slice(0, 10), kg: +f.kg }]); setP({ ...p, weight: +f.kg }); setModal(null); toast('Weight saved') }}><label>Weight (kg)</label><input name="kg" type="number" step="0.1" required /></Modal>}
    {modal === 'journal' && <Modal title="New Entry" onClose={() => setModal(null)} onSubmit={f => { setJournal([...journal, { id: uid(), date: new Date().toISOString().slice(0, 10), mood: f.mood, text: f.text }]); setModal(null); toast('Entry saved') }}><label>Mood</label><select name="mood">{['😊','😐','😓','💪','😴'].map(m => <option key={m}>{m}</option>)}</select><label>Notes</label><textarea name="text" rows="4" required /></Modal>}
    {msg && <div className="toast" role="status">{msg}</div>}
  </div>
}
