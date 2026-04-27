import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Brain, Crown, Dumbbell, Home, PlusCircle, Settings, User2 } from 'lucide-react';

const seed = [
  { id: 1, date: '2026-04-21', exercise: 'Press banca', sets: 3, weight: 100, reps: '8,8,7', muscle: 'Pecho', volume: 2300 },
  { id: 2, date: '2026-04-23', exercise: 'Dominadas', sets: 3, weight: 0, reps: '10,9,8', muscle: 'Espalda', volume: 27 },
  { id: 3, date: '2026-04-25', exercise: 'Press militar', sets: 3, weight: 50, reps: '10,9,8', muscle: 'Hombro', volume: 1350 }
];

const muscleMap = {
  banca: 'Pecho',
  dominadas: 'Espalda',
  remo: 'Espalda',
  curl: 'Bíceps',
  sentadilla: 'Pierna',
  búlgara: 'Pierna',
  militar: 'Hombro',
  pantorrilla: 'Pantorrilla'
};

const defaultPrefs = {
  goal: 'Hipertrofia',
  unit: 'kg',
  rest: '90 s',
  coach: 'Normal',
  weekly: '4 días'
};

const parseReps = (text) => text.split(',').map((value) => Number(value.trim())).filter((value) => Number.isFinite(value) && value > 0);

const inferMuscle = (exerciseName) => {
  const normalized = exerciseName.toLowerCase();
  const keyword = Object.keys(muscleMap).find((key) => normalized.includes(key));
  return keyword ? muscleMap[keyword] : 'General';
};

const sortByDateDesc = (items) =>
  [...items].sort((a, b) => {
    if (a.date === b.date) return b.id - a.id;
    return b.date.localeCompare(a.date);
  });

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [tab, setTab] = useState('home');
  const [data, setData] = useState(() => sortByDateDesc(readStorage('miq_v5', seed)));
  const [prefs, setPrefs] = useState(() => readStorage('miq_prefs', defaultPrefs));
  const [form, setForm] = useState({ exercise: 'Press banca', sets: '3', weight: '100', reps: '8,8,7' });
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('miq_v5', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('miq_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const totalVolume = useMemo(() => data.reduce((acc, session) => acc + session.volume, 0), [data]);

  const sessionsThisWeek = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    return data.filter((session) => new Date(session.date) >= weekStart).length;
  }, [data]);

  const muscles = useMemo(() => {
    const grouped = {};
    data.forEach((session) => {
      grouped[session.muscle] = (grouped[session.muscle] || 0) + session.volume;
    });

    const max = Math.max(1, ...Object.values(grouped));
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value, percent: Math.round((value * 100) / max) }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const coachMessage = useMemo(() => {
    if (!data.length) return 'Registra tu primera sesión.';

    const latest = data[0];
    const previous = data.find((session, index) => index > 0 && session.exercise === latest.exercise);

    if (!previous) return `Buen inicio con ${latest.exercise}.`;
    if (latest.volume > previous.volume) {
      return `Subiste volumen en ${latest.exercise}. Si la técnica fue sólida, intenta +2.5 ${prefs.unit}.`;
    }
    if (latest.volume < previous.volume) {
      return `Tu volumen bajó en ${latest.exercise}. Descansa y repite carga antes de subir.`;
    }
    return `Te mantuviste igual en ${latest.exercise}. Busca una repetición extra total.`;
  }, [data, prefs.unit]);

  const save = () => {
    const reps = parseReps(form.reps);
    const weight = Number(form.weight) || 0;
    const sets = Number(form.sets) || 0;

    if (!form.exercise.trim()) {
      setError('El ejercicio es obligatorio.');
      return;
    }
    if (!sets || sets < 1) {
      setError('Las series deben ser al menos 1.');
      return;
    }
    if (!reps.length) {
      setError('Las repeticiones deben tener formato como 8,8,7.');
      return;
    }

    const nextEntry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      exercise: form.exercise.trim(),
      sets,
      weight,
      reps: form.reps,
      muscle: inferMuscle(form.exercise),
      volume: (weight || 1) * reps.reduce((acc, value) => acc + value, 0)
    };

    setError('');
    setData((previous) => sortByDateDesc([nextEntry, ...previous]));
    setTab('history');
  };

  const s = {
    app: { minHeight: '100dvh', padding: 'max(14px,env(safe-area-inset-top)) 14px max(18px,env(safe-area-inset-bottom))', background: 'radial-gradient(circle at top, rgba(10,132,255,.23), transparent 28%),radial-gradient(circle at bottom, rgba(255,212,0,.12), transparent 24%),#060b16', color: '#f5f7ff', fontFamily: 'Inter,system-ui,-apple-system,sans-serif' },
    phone: { maxWidth: 430, margin: '0 auto', minHeight: 'calc(100dvh - 28px)', borderRadius: 32, background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 24px 80px rgba(0,0,0,.45)', overflow: 'hidden', paddingBottom: 110 },
    top: { display: 'flex', justifyContent: 'space-between', padding: '20px 18px 12px', gap: 12 },
    brand: { margin: 0, letterSpacing: '.14em', textTransform: 'uppercase', color: '#ffd400', fontWeight: 800, fontSize: 12 },
    pill: { background: '#ffd400', color: '#07101d', borderRadius: 999, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 },
    screen: { padding: '0 16px', display: 'grid', gap: 14 },
    card: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 18px 40px rgba(0,0,0,.22)', backdropFilter: 'blur(18px)', borderRadius: 24, padding: 18 },
    hero: { fontSize: 28, lineHeight: 1.02, margin: '4px 0 10px' },
    chip: { display: 'inline-block', padding: '6px 10px', borderRadius: 999, background: 'rgba(10,132,255,.16)', color: '#78b8ff', fontWeight: 700, fontSize: 12 },
    cta: { width: '100%', border: 0, borderRadius: 18, padding: '15px 18px', background: 'linear-gradient(135deg,#0a84ff,#0059ff)', color: '#fff', fontWeight: 800 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 },
    mini: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, padding: 14 },
    field: { display: 'grid', gap: 8, marginBottom: 14 },
    input: { border: '1px solid rgba(255,255,255,.1)', background: 'rgba(7,12,24,.9)', color: '#fff', borderRadius: 16, padding: 16, fontSize: 16 },
    tab: { position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'max(12px,env(safe-area-inset-bottom))', width: 'min(398px, calc(100% - 20px))', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, padding: 10, borderRadius: 24, background: 'rgba(7,12,24,.92)', border: '1px solid rgba(255,255,255,.08)' }
  };

  const Tab = ({ id, icon, label }) => (
    <button onClick={() => setTab(id)} style={{ border: 0, background: tab === id ? 'rgba(10,132,255,.16)' : 'transparent', color: tab === id ? '#fff' : '#7d8aa5', borderRadius: 18, padding: '10px 6px', display: 'grid', gap: 6, placeItems: 'center' }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
    </button>
  );

  const Pref = ({ label, prefKey, options }) => (
    <label style={s.field}>
      <span>{label}</span>
      <select value={prefs[prefKey]} onChange={(event) => setPrefs({ ...prefs, [prefKey]: event.target.value })} style={{ ...s.input, appearance: 'none' }}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div style={s.app}>
      <div style={s.phone}>
        <header style={s.top}>
          <div>
            <p style={s.brand}>MuscleIQ</p>
            <h1 style={{ margin: '4px 0 0', fontSize: 29, lineHeight: 1.02 }}>Coach de bolsillo</h1>
          </div>
          <div style={s.pill}>
            <Crown size={14} />
            Pro
          </div>
        </header>

        {tab === 'home' && (
          <div style={s.screen}>
            <section style={s.card}>
              <span style={s.chip}>100% iPhone</span>
              <h2 style={s.hero}>Más visual, más útil, más tuya.</h2>
              <p style={{ color: '#acb8d4' }}>Objetivo: {prefs.goal} · Frecuencia: {prefs.weekly} · Descanso: {prefs.rest}</p>
            </section>

            <section style={s.grid}>
              <div style={s.mini}>
                <Dumbbell size={16} color="#ffd400" />
                <p style={{ margin: '12px 0 6px', fontSize: 13, color: '#91a0bd' }}>Volumen</p>
                <strong>{totalVolume.toLocaleString()} {prefs.unit}</strong>
              </div>
              <div style={s.mini}>
                <Brain size={16} color="#ffd400" />
                <p style={{ margin: '12px 0 6px', fontSize: 13, color: '#91a0bd' }}>IA local</p>
                <strong>{prefs.coach}</strong>
              </div>
              <div style={s.mini}>
                <User2 size={16} color="#ffd400" />
                <p style={{ margin: '12px 0 6px', fontSize: 13, color: '#91a0bd' }}>Últimos 7 días</p>
                <strong>{sessionsThisWeek} sesiones</strong>
              </div>
            </section>

            <section style={s.card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                <Brain size={16} />
                Coach IA local
              </h3>
              <p style={{ color: '#acb8d4', margin: 0 }}>{coachMessage}</p>
            </section>

            <section style={s.card}>
              <h3 style={{ margin: '0 0 12px' }}>Mapa muscular</h3>
              {muscles.map((item) => (
                <div key={item.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>{item.name}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percent}%`, height: '100%', background: 'linear-gradient(90deg,#0a84ff,#ffd400)' }} />
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === 'log' && (
          <div style={s.screen}>
            <section style={s.card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                <PlusCircle size={16} />
                Nuevo entrenamiento
              </h3>

              <label style={s.field}>
                <span>Ejercicio</span>
                <input style={s.input} value={form.exercise} onChange={(event) => setForm({ ...form, exercise: event.target.value })} />
              </label>
              <label style={s.field}>
                <span>Series</span>
                <input type="number" min="1" style={s.input} value={form.sets} onChange={(event) => setForm({ ...form, sets: event.target.value })} />
              </label>
              <label style={s.field}>
                <span>Peso ({prefs.unit})</span>
                <input type="number" min="0" style={s.input} value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} />
              </label>
              <label style={s.field}>
                <span>Repeticiones</span>
                <input style={s.input} value={form.reps} onChange={(event) => setForm({ ...form, reps: event.target.value })} />
                <small style={{ color: '#7d8aa5' }}>Ejemplo: 8,8,7</small>
              </label>

              {error && <p style={{ color: '#ff8f8f', marginTop: 0 }}>{error}</p>}
              <button style={s.cta} onClick={save}>Guardar entrenamiento</button>
            </section>
          </div>
        )}

        {tab === 'history' && (
          <div style={s.screen}>
            <section style={s.card}>
              <h3 style={{ margin: '0 0 12px' }}>Historial</h3>
              {data.map((entry) => (
                <article key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <div>
                    <strong>{entry.exercise}</strong>
                    <p style={{ color: '#acb8d4', margin: '4px 0 0' }}>{entry.date} · {entry.muscle}</p>
                    <small style={{ color: '#acb8d4' }}>{entry.sets} series · {entry.weight} {prefs.unit} · reps {entry.reps}</small>
                  </div>
                  <span style={{ color: '#ffd400', fontWeight: 800 }}>{entry.volume}</span>
                </article>
              ))}
            </section>
          </div>
        )}

        {tab === 'profile' && (
          <div style={s.screen}>
            <section style={{ ...s.card, textAlign: 'center' }}>
              <div style={{ width: 68, height: 68, borderRadius: 22, background: 'linear-gradient(135deg,#0a84ff,#ffd400)', display: 'grid', placeItems: 'center', color: '#07101d', margin: '0 auto 14px' }}>
                <User2 size={20} />
              </div>
              <h3>Alexis</h3>
              <p style={{ color: '#acb8d4' }}>Avanzado · {prefs.goal}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: 14 }}>
                <div style={s.mini}>
                  <small style={{ display: 'block', color: '#91a0bd' }}>Plan</small>
                  <strong>Pro</strong>
                </div>
                <div style={s.mini}>
                  <small style={{ display: 'block', color: '#91a0bd' }}>Coach</small>
                  <strong>{prefs.coach}</strong>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'settings' && (
          <div style={s.screen}>
            <section style={s.card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                <Settings size={16} />
                Configuración
              </h3>
              <Pref label="Objetivo" prefKey="goal" options={['Hipertrofia', 'Fuerza', 'Definición']} />
              <Pref label="Unidad" prefKey="unit" options={['kg', 'lb']} />
              <Pref label="Descanso" prefKey="rest" options={['60 s', '90 s', '120 s']} />
              <Pref label="Coach IA" prefKey="coach" options={['Suave', 'Normal', 'Intenso']} />
              <Pref label="Frecuencia semanal" prefKey="weekly" options={['3 días', '4 días', '5 días', '6 días']} />
            </section>
          </div>
        )}

        <nav style={s.tab}>
          <Tab id="home" icon={<Home size={18} />} label="Inicio" />
          <Tab id="log" icon={<PlusCircle size={18} />} label="Registrar" />
          <Tab id="history" icon={<Dumbbell size={18} />} label="Historial" />
          <Tab id="profile" icon={<User2 size={18} />} label="Perfil" />
          <Tab id="settings" icon={<Settings size={18} />} label="Ajustes" />
        </nav>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
