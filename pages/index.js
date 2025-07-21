import { useState, useEffect } from "react";

export default function Home() {
  const generateRandomNames = () => [ /* ...your 16 names... */ ];
  const getChangeBackgroundColor = eloChange => parseInt(eloChange) > 0 ? "bg-green-200" : "bg-red-200";
  const getTeamBackgroundColor = team => { /* ...existing switch... */ };
  const getLeagueFontColor = league => { /* ...existing switch... */ };

  const defaultPlayers = generateRandomNames().map((name, idx) => { /* ...as before... */ });

  const [players, setPlayers] = useState(defaultPlayers);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [winningTeam, setWinningTeam] = useState("Village");
  const [results, setResults] = useState(null);

  const BACKEND_URL = "http://15.204.218.33:8000";

  useEffect(() => {
    fetchSavedProfiles();
  }, []);

  const fetchSavedProfiles = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/get-players`);
      const data = await res.json();
      setSavedProfiles(data.map(p => ({
        name: p.name,
        elo: p.current_elo,
        team: p.team,
        diedNight1: false,
        penalty: false,
      })));
    } catch (err) {
      console.error("Fetch error:", err);
      setSavedProfiles([]);
    }
  };

  const handleChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const saveProfiles = async () => {
    try {
      const profilesToSave = players.map(p => ({
        name: p.name,
        current_elo: Number(p.elo),
        team: p.team,
        died_night_1: p.diedNight1,
        penalty: p.penalty
      }));
      const res = await fetch(`${BACKEND_URL}/save-players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilesToSave),
      });
      if (!res.ok) throw new Error("Failed to save profiles");
      const data = await res.json();
      alert(data.message || "Saved!");
      fetchSavedProfiles();
    } catch (err) {
      console.error(err);
      alert("Error saving profiles.");
    }
  };

  const deleteProfile = async (name) => {
    try {
      const res = await fetch(`${BACKEND_URL}/delete-player/${encodeURIComponent(name)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchSavedProfiles();
    } catch (err) {
      console.error(err);
      alert("Could not delete profile.");
    }
  };

  const handleProfileSelect = (slotIndex, profile) => {
    const newPlayers = [...players];
    newPlayers[slotIndex] = {
      ...newPlayers[slotIndex],
      name: profile.name,
      elo: profile.elo,
      team: profile.team,
      diedNight1: false,
      penalty: false,
    };
    setPlayers(newPlayers);
  };

  const submitMatch = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/calculate-elo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players_data: players.map(p => ({
            name: p.name,
            current_elo: Number(p.elo),
            team: p.team,
            died_night_1: p.diedNight1,
            penalty: p.penalty,
          })),
          village_won: winningTeam === "Village",
          solo_killer_won: winningTeam === "Solo Killer",
          solo_voting_won: winningTeam === "Solo Voting",
          couple_instigator_won: winningTeam === "Couple/Instigator",
        }),
      });
      if (!res.ok) throw new Error("Network ok false");
      const data = await res.json();
      setResults({
        players: data.results,
        avgVillageElo: data.avg_village_elo,
        avgEvilAllianceElo: data.avg_evil_alliance_elo,
        expectedResult: data.expected_result,
      });
      setPlayers(players.map(p => {
        const upd = data.results.find(r => r.name === p.name);
        return upd ? { ...p, elo: upd.new_elo } : p;
      }));
      fetchSavedProfiles();
    } catch (err) {
      console.error(err);
      alert("Error submitting match.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">🏆 Calculadora Liga Española 🏆</h1>

      <div className="bg-white shadow-md p-4 rounded-lg w-full max-w-4xl">
        <label className="font-semibold">Search Profiles:</label>
        <input
          type="text"
          className="w-full p-1 mb-2 border rounded"
          placeholder="Type to filter..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto mb-4">
          {savedProfiles
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-100 p-1 mb-1 rounded">
                <button
                  className="text-left text-blue-600 hover:underline flex-1"
                  onClick={() => {
                    const emptyIndex = players.findIndex(pl => pl.name === "");
                    if (emptyIndex >= 0) handleProfileSelect(emptyIndex, p);
                    else alert("No empty slot!");
                  }}
                >
                  {p.name} ({p.elo}) – {p.team}
                </button>
                <button className="text-red-600" onClick={() => deleteProfile(p.name)}>❌</button>
              </div>
            ))
          }
        </div>

        {players.map((player, index) => (
          <div key={index} className="grid grid-cols-6 gap-2 mb-2 items-center">
            <input
              type="text"
              placeholder="Name"
              className="p-2 border rounded"
              value={player.name}
              onChange={e => handleChange(index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Elo"
              className="p-2 border rounded"
              value={player.elo}
              onChange={e => handleChange(index, "elo", e.target.value)}
            />
            <select
              className="p-2 border rounded"
              value={player.team}
              onChange={e => handleChange(index, "team", e.target.value)}
            >
              {/* options as before */}
            </select>
            <label className="flex items-center">
              <input type="checkbox" checked={player.diedNight1} onChange={e => handleChange(index, "diedNight1", e.target.checked)} />
              Died Night 1
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={player.penalty} onChange={e => handleChange(index, "penalty", e.target.checked)} />
              Penalización
            </label>
            <div></div>
          </div>
        ))}

        <div className="mt-4">
          <label>Winning Team: </label>
          <select className="p-2 border rounded ml-2" value={winningTeam} onChange={e => setWinningTeam(e.target.value)}>
            {["Village","Werewolf","Solo Killer","Solo Voting","Couple/Instigator"].map(vt => (
              <option key={vt} value={vt}>{vt}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 space-x-2">
          <button className="bg-blue-500 text-white p-2 rounded" onClick={submitMatch}>Submit Match</button>
          <button className="bg-green-500 text-white p-2 rounded" onClick={saveProfiles}>Save Profiles</button>
        </div>
      </div>

      {results && (
        <div className="mt-6 w-full max-w-4xl space-y-6">
          {/* display results summary and table here */}
        </div>
      )}
    </div>
  );
}
