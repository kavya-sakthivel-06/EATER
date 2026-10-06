import { useEffect, useState } from "react";
import { api } from "../api.js";

const Card = ({ title, children }) => <div className="card"><h3 className="font-semibold mb-2">{title}</h3>{children}</div>;
const Msg = ({ d }) => (d?.message ? <p className="text-sm text-ink/60">{d.message}</p> : null);
const FoodRow = ({ f, right }) => (
  <div className="flex justify-between py-1 border-b border-ink/5 last:border-0 text-sm">
    <span>{f.name} <span className="text-ink/50">· {f.canteen}</span></span><span>₹{f.price} · {right}</span>
  </div>
);

export default function Insights() {
  const [d, setD] = useState({});
  const [w, setW] = useState({ w_price: 1, w_nutrition: 1, w_rating: 1, w_pref: 1 });
  const [multi, setMulti] = useState([]);

  useEffect(() => {
    const keys = { spend: "/api/predict/spending", anom: "/api/anomalies", seg: "/api/segment", beh: "/api/behaviour", pers: "/api/recommend/personalized" };
    Object.entries(keys).forEach(([k, url]) => api(url).then((r) => setD((o) => ({ ...o, [k]: r }))).catch(() => {}));
  }, []);
  useEffect(() => { api("/api/recommend/multi?" + new URLSearchParams(w)).then(setMulti).catch(() => {}); }, [w]);

  const { spend, anom, seg, beh, pers } = d;
  return (
    <div className="space-y-4">
      <Card title="Month-end spending forecast">
        <Msg d={spend} />
        {spend?.projected && <p>Likely <b>₹{spend.projected}</b> of your ₹{spend.budget} budget{" "}
          <span className={spend.over_budget ? "text-red-600" : "text-leaf"}>{spend.over_budget ? "(over budget)" : "(on track)"}</span>
          <span className="block text-xs text-ink/50">Method: {spend.method}</span></p>}
      </Card>

      <Card title="Unusual spending days">
        <Msg d={anom} />
        {anom?.days?.length === 0 && !anom.message && <p className="text-sm text-ink/60">No unusual days. Nice and steady.</p>}
        {anom?.days?.map((x) => <div key={x.date} className="text-sm flex justify-between"><span>{x.date}</span><span>₹{x.spend} (typical ₹{anom.typical_daily_spend})</span></div>)}
      </Card>

      <Card title="Your eating style">
        <Msg d={seg} />
        {seg?.you && <p className="mb-2">You're in the <b>{seg.you}</b> group.</p>}
        {seg?.profiles?.map((p) => <div key={p.label} className="text-sm flex justify-between"><span>{p.label} ({p.students})</span><span>₹{p.avg_daily_spend}/day · {p.avg_daily_protein} g protein</span></div>)}
      </Card>

      <Card title="Your habits">
        <Msg d={beh} />
        {beh?.top_foods && <>
          <p className="text-sm">Most eaten: {beh.top_foods.map((f) => `${f.name} (${f.qty})`).join(", ")}</p>
          <p className="text-sm">By meal: {Object.entries(beh.by_meal).map(([k, v]) => `${k} ${v}`).join(" · ")}</p>
          <p className="text-sm">Spend by canteen: {beh.by_canteen.map((c) => `${c.canteen} ₹${c.spend}`).join(" · ")}</p>
          <p className="text-sm">Spend by weekday: {beh.by_weekday.map((c) => `${c.day} ₹${c.spend}`).join(" · ")}</p>
        </>}
      </Card>

      <Card title="Picked for you">
        <p className="text-xs text-ink/50 mb-1">{pers?.based_on_history ? "Based on what you've logged" : "Log more food to personalise this"}</p>
        {pers?.items?.map((f) => <FoodRow key={f.id} f={f} right={`${f.match}% match`} />)}
      </Card>

      <Card title="Best overall: you choose what matters">
        {[["w_price", "Low price"], ["w_nutrition", "Protein"], ["w_rating", "Rating"], ["w_pref", "My taste"]].map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 text-sm"><span className="w-20">{label}</span>
            <input type="range" min="0" max="5" value={w[k]} onChange={(e) => setW({ ...w, [k]: +e.target.value })} className="flex-1 accent-leaf" /></label>
        ))}
        <div className="mt-2">{multi.map((f) => <FoodRow key={f.id} f={f} right={`score ${f.score}`} />)}</div>
      </Card>
    </div>
  );
}
