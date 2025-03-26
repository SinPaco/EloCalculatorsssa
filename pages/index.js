import { useState } from "react";

export default function Home() {
  const generateRandomNames = () => {
    const names = [
      "Player1", "Player2", "Player3", "Player4", "Player5", "Player6", "Player7", "Player8", "Player9", "Player10",
      "Player11", "Player12", "Player13", "Player14", "Player15", "Player16"
    ];
    return names;
  };

  const defaultPlayers = generateRandomNames().map((name, index) => {
    let team = "Village";
    if (index >= 10 && index < 14) {
      team = "Werewolf";
    } else if (index === 14) {
      team = "Solo Voting";
    } else if (index === 15) {
      team = "Solo Killer";
    } else if (index === 16) {
      team = "Couple/Instigator";
    }

    return { name, elo: 1000, team, diedNight1: false };
  });

  const [players, setPlayers] = useState(defaultPlayers);
  const [winningTeam, setWinningTeam] = useState("Village");
  const [results, setResults] = useState(null);

  const handleChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const submitMatch = async () => {
    try {
      const response = await fetch("http://15.204.218.33:8000/calculate-elo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players_data: players.map(player => ({
            name: player.name,
            current_elo: player.elo,
            team: player.team,
            died_night_1: player.diedNight1
          })),
          village_won: winningTeam === "Village",
          solo_killer_won: winningTeam === "Solo Killer",
          solo_voting_won: winningTeam === "Solo Voting",
          couple_instigator_won: winningTeam === "Couple/Instigator"
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
      setResults({
        players: data.results,
        avgVillageElo: data.avg_village_elo,
        avgEvilAllianceElo: data.avg_evil_alliance_elo,
        expectedResult: data.expected_result,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      alert("There was an error submitting the match. Please try again.");
    }
  };

  const getTeamBackgroundColor = (team) => {
    switch (team) {
      case "Village":
        return "bg-green-300"; // Darker green
      case "Werewolf":
        return "bg-red-300"; // Darker red
      case "Solo Killer":
      case "Solo Voting":
        return "bg-yellow-300"; // Darker yellow
      case "Couple/Instigator":
        return "bg-pink-300"; // Darker pink
      default:
        return ""; // Default background
    }
  };

  const getChangeBackgroundColor = (change) => {
    return parseInt(change) > 0 ? "bg-green-200" : "bg-red-200"; // Green for positive, Red for negative
  };

  const getLeagueFontColor = (league) => {
    switch (league) {
      case "Aspirante":
        return "text-purple-500"; // Purple
      case "Experimentado":
        return "text-purple-300"; // Light purple
      case "Veterano":
        return "text-green-500"; // Green
      case "Profesional":
        return "text-orange-500"; // Orange
      case "Elite":
        return "text-cyan-500"; // Cyan
      case "Maestro":
        return "text-blue-800"; // Dark blue
      case "Leyenda":
        return "text-yellow-500"; // Yellow
      default:
        return ""; // Default font color
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">🏆 Calculadora Liga Española 🏆</h1>

      <div className="bg-white shadow-md p-4 rounded-lg w-full max-w-4xl">
        {players.map((player, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 mb-2">
            <input
              type="text"
              placeholder={`Player ${index + 1} Name`}
              className="p-2 border rounded"
              value={player.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Elo"
              className="p-2 border rounded"
              value={player.elo}
              onChange={(e) => handleChange(index, "elo", e.target.value)}
            />
            <select
              className="p-2 border rounded"
              value={player.team}
              onChange={(e) => handleChange(index, "team", e.target.value)}
            >
              <option value="Village">Village</option>
              <option value="Werewolf">Werewolf</option>
              <option value="Solo Killer">Solo Killer</option>
              <option value="Solo Voting">Solo Voting</option>
              <option value="Couple/Instigator">Couple/Instigator</option>
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={player.diedNight1}
                onChange={(e) => handleChange(index, "diedNight1", e.target.checked)}
              />
              <span>Died Night 1</span>
            </label>
          </div>
        ))}

        <div className="mt-4">
          <label className="font-semibold">Winning Team: </label>
          <select
            className="p-2 border rounded ml-2"
            value={winningTeam}
            onChange={(e) => setWinningTeam(e.target.value)}
          >
            <option value="Village">Village</option>
            <option value="Werewolf">Werewolf</option>
            <option value="Solo Killer">Solo Killer</option>
            <option value="Solo Voting">Solo Voting</option>
            <option value="Couple/Instigator">Couple/Instigator</option>
          </select>
        </div>

        <button
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={submitMatch}
        >
          Submit Match
        </button>
      </div>

      {results ? (
        <>
          {/* Additional Metrics Section */}
          <div className="bg-white shadow-md p-4 rounded-lg w-full max-w-4xl mt-6">
            <h2 className="text-xl font-bold mb-2">📊 Parametros Adicionales</h2>
            <p className="mb-2"><strong>Promedio Aldea Elo:</strong> {Math.round(results.avgVillageElo)}</p>
            <p className="mb-2"><strong>Promedio Alianza Malvada Elo:</strong> {Math.round(results.avgEvilAllianceElo)}</p>
            <p className="mb-2">
              <strong>Resultado Esperado:</strong> 
              <span className="ml-2">Aldea: {results.expectedResult.village_expected_score.toFixed(2)}</span>, 
              <span className="ml-2">Alianza Malvada: {results.expectedResult.evil_alliance_expected_score.toFixed(2)}</span>
            </p>
          </div>

          {/* Match Results Table */}
          <div className="bg-white shadow-md p-4 rounded-lg w-full max-w-4xl mt-6">
            <h2 className="text-2xl font-bold mb-2">📊 Resultados</h2>
            <table className="w-full border-collapse border border-gray-400 mt-4">
              <thead>
                <tr className="bg-gray-200 border border-gray-400">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Team</th>
                  <th className="border p-2">Old Elo</th>
                  <th className="border p-2">New Elo</th>
                  <th className="border p-2">Change</th>
                  <th className="border p-2">League</th>
                </tr>
              </thead>
              <tbody>
                {results.players.map((player, index) => (
                  <tr key={index} className="text-center border border-gray-400">
                    <td className="border p-2">{player.name}</td>
                    <td className={`border p-2 font-bold ${getTeamBackgroundColor(player.team)}`}>
                      {player.team}
                    </td>
                    <td className="border p-2">{player.old_elo}</td>
                    <td className="border p-2">{player.new_elo}</td>
                    <td className={`border p-2 ${getChangeBackgroundColor(player.elo_change)}`}>
                      {player.elo_change}
                    </td>
                    <td
                      className={`border border-black p-2 font-bold bg-black ${getLeagueFontColor(player.league)}`}
                    >
                      {player.league}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-md p-4 rounded-lg w-full max-w-4xl mt-6">
          <h2 className="text-2xl font-bold mb-2">📊 Match Results</h2>
          <p className="text-center">No results available</p>
        </div>
      )}
    </div>
  );
}
