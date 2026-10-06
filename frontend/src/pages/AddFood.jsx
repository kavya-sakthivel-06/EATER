import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function AddFood({ onSaved }) {
  const [canteens, setCanteens] = useState([]);
  const [foods, setFoods] = useState([]);
  const [canteenId, setCanteenId] = useState("");
  const [foodId, setFoodId] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => { api("/api/canteens").then(setCanteens); }, []);
  useEffect(() => {
    setFoodId("");
    if (canteenId) api(`/api/foods?canteen_id=${canteenId}`).then(setFoods);
  }, [canteenId]);

  const food = foods.find((f) => f.id === +foodId);

  async function save() {
    setError("");
    try { await api("/api/food-logs", { method: "POST", body: { food_id: +foodId, quantity: +qty } }); onSaved(); }
    catch (e) { setError(e.message); }
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Add food</h2>
      <select className="input" value={canteenId} onChange={(e) => setCanteenId(e.target.value)}>
        <option value="">Select canteen</option>
        {canteens.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select className="input" value={foodId} onChange={(e) => setFoodId(e.target.value)} disabled={!canteenId}>
        <option value="">Select food</option>
        {foods.map((f) => <option key={f.id} value={f.id}>{f.name} — ₹{f.price}</option>)}
      </select>
      <input className="input" type="number" min="1" max="20" step="1" value={qty} onChange={(e) => setQty(Math.max(1, Math.floor(+e.target.value || 1)))} />
      {food && (
        <div className="bg-paper rounded-lg p-3 text-sm space-y-0.5">
          <div>Cost: <b>₹{food.price * qty}</b></div>
          <div>Calories: <b>{food.calories * qty} kcal</b></div>
          <div>Protein: <b>{(food.protein * qty).toFixed(1)} g</b></div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn" disabled={!food} onClick={save}>Add food</button>
    </div>
  );
}
