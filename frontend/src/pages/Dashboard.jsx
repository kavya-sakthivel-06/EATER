import { useEffect, useState } from "react";
import { api } from "../api.js";

const Stat = ({ label, value }) => (
  <div className="card"><div className="text-sm text-ink/60">{label}</div><div className="text-2xl font-semibold">{value}</div></div>
);

export default function Dashboard({ onAdd }) {
  const [s, setS] = useState(null);
  const [logs, setLogs] = useState([]);
  const [daily, setDaily] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api("/api/summary"), api("/api/food-logs/today")])
      .then(([sum, l]) => { setS(sum); setLogs(l); setDaily(Math.round(sum.avg_daily_spend)); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!s) return <p>Loading…</p>;

  const pct = Math.min(100, Math.round((s.month.spend / s.budget) * 100));
  const maxWeek = Math.max(...s.weekly.map((w) => w.spend), 1);
  const projected = daily * 30;
  const saving = Math.round(s.avg_daily_spend * 30 - projected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Hi {s.name}</h2>
        <button className="btn" onClick={onAdd}>+ Add food</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Spent today" value={`₹${s.today.spend}`} />
        <Stat label="Spent this month" value={`₹${s.month.spend}`} />
        <Stat label="Protein today" value={`${s.today.protein} g`} />
        <Stat label="Calories today" value={`${s.today.calories} kcal`} />
      </div>

      <div className="card">
        <div className="flex justify-between text-sm"><span>Monthly budget</span><span>₹{s.month.spend} / ₹{s.budget} ({pct}%)</span></div>
        <div className="h-2 bg-ink/10 rounded mt-2"><div className={`h-2 rounded ${pct > 90 ? "bg-red-500" : "bg-leaf"}`} style={{ width: `${pct}%` }} /></div>
        <div className="mt-4 space-y-1.5">
          {s.weekly.map((w) => (
            <div key={w.week} className="flex items-center gap-2 text-sm">
              <span className="w-14">Week {w.week}</span>
              <div className="flex-1 h-4 bg-ink/5 rounded"><div className="h-4 bg-sun rounded" style={{ width: `${(w.spend / maxWeek) * 100}%` }} /></div>
              <span className="w-14 text-right">₹{w.spend}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Today's food</h3>
        {logs.length === 0 ? <p className="text-sm text-ink/60">Nothing logged yet. Add what you ate to see today's totals.</p> :
          logs.map((l) => (
            <div key={l.id} className="flex justify-between py-1 border-b border-ink/5 last:border-0">
              <span>{l.name} × {l.quantity}</span><span>₹{l.cost}</span>
            </div>
          ))}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">What if I spend less per day?</h3>
        <p className="text-sm text-ink/60 mb-2">Your average so far this month: ₹{s.avg_daily_spend}/day</p>
        <label className="text-sm">Daily spend: ₹{daily}</label>
        <input type="range" min="0" max="300" value={daily} onChange={(e) => setDaily(+e.target.value)} className="w-full accent-leaf" />
        <p className="text-sm">Estimated month: <b>₹{projected}</b> ·{" "}
          {saving >= 0 ? <>you'd save <b>₹{saving}</b></> : <>you'd spend <b>₹{-saving}</b> more</>} · budget left <b>₹{s.budget - projected}</b></p>
      </div>
    </div>
  );
}
