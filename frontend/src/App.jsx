import { useState } from "react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddFood from "./pages/AddFood.jsx";
import Recommend from "./pages/Recommend.jsx";

const TABS = [["home", "Home"], ["add", "Add food"], ["pick", "What to eat"]];

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const [tab, setTab] = useState("home");
  const [refresh, setRefresh] = useState(0);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  const logout = () => { localStorage.clear(); setAuthed(false); };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-leaf">Eater</h1>
        <nav className="flex gap-1">
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === k ? "bg-leaf text-white" : "hover:bg-ink/5"}`}>{label}</button>
          ))}
          <button onClick={logout} className="px-3 py-1.5 text-sm text-ink/60">Log out</button>
        </nav>
      </header>
      {tab === "home" && <Dashboard key={refresh} onAdd={() => setTab("add")} />}
      {tab === "add" && <AddFood onSaved={() => { setRefresh((n) => n + 1); setTab("home"); }} />}
      {tab === "pick" && <Recommend />}
    </div>
  );
}
