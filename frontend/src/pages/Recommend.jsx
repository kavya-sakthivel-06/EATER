import { useEffect, useState } from "react";
import { api } from "../api.js";

const MODES = [["protein", "Protein-rich"], ["budget", "Budget-friendly"], ["protein_budget", "Protein per rupee"],
               ["healthy", "Healthy"], ["light", "Light"], ["spicy", "Spicy"], ["sweet", "Sweet"]];

export default function Recommend() {
  const [mode, setMode] = useState("protein");
  const [items, setItems] = useState([]);

  useEffect(() => { api(`/api/recommend?mode=${mode}`).then(setItems); }, [mode]);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">What are you craving?</h2>
      <div className="flex flex-wrap gap-2">
        {MODES.map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)}
            className={`px-3 py-1.5 rounded-full text-sm border ${mode === k ? "bg-leaf text-white border-leaf" : "border-ink/20"}`}>{label}</button>
        ))}
      </div>
      {items.length === 0 && <p className="text-sm text-ink/60">No matching food yet.</p>}
      {items.map((f) => (
        <div key={f.id} className="card flex justify-between">
          <div><div className="font-medium">{f.name}</div><div className="text-sm text-ink/60">{f.canteen}</div></div>
          <div className="text-right text-sm">₹{f.price}<br />{f.protein} g protein · {f.calories} kcal</div>
        </div>
      ))}
    </div>
  );
}
