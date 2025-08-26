import React, { useState, useEffect } from "react";
import Select from "react-select";
import "../Styles/adminHome.css";

const initialForm = {
  sportType: "",
  matchName: "",
  homeTeam: "",
  awayTeam: "",
  startTime: "",
  venue: "",
};

const SPORT_OPTIONS = ["Football", "Basketball", "Tennis", "Cricket", "Rugby"];

export default function AdminHome() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);

  // Fetch matches + teams
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(
          "https://prime-backend.azurewebsites.net/api/users/viewMatches"
        );
        const data = await res.json();
        setMatches(data);
        if (!res.ok) throw new Error(data?.error || "Failed to load matches");
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      }
    };

    const fetchTeam = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/admin/getTeams"
        );
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      }
    };

    fetchMatch();
    fetchTeam();
  }, []);

  // Convert teams into react-select options
  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.teamName,
  }));

  // Open/close modal
  const openModal = () => {
    setMessage(null);
    setForm(initialForm);
    setShowModal(true);
  };
  const closeModal = () => {
    if (!submitting) setShowModal(false);
  };

  // Handle Select (react-select)
  const handleSelectChange = (selectedOption, actionMeta) => {
    setForm((prev) => ({
      ...prev,
      [actionMeta.name]: selectedOption ? selectedOption.value : "",
    }));
  };

  // Handle normal inputs
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const required = [
      "sportType",
      "matchName",
      "homeTeam",
      "awayTeam",
      "startTime",
      "venue",
    ];
    const missing = required.filter((k) => !form[k]?.trim());
    if (missing.length) {
      setMessage({ type: "error", text: `Missing: ${missing.join(", ")}` });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(
        `https://prime-backend.azurewebsites.net/api/admin/createMatch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to create match");
      }

      setForm(initialForm);
      setShowModal(false);
      setMessage({ type: "success", text: "✅ Match created successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Admin Home</h1>
        <button className="primaryBtn" onClick={openModal}>
          ＋ Create Match
        </button>
      </header>

      {message && (
        <div
          className={`alert ${
            message.type === "success" ? "alertSuccess" : "alertError"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="card">
        <h2>Quick Actions</h2>
        <p>Use the button above to schedule a new match.</p>
        <ul>
          <li>Create matches with home/away teams, start time, and venue.</li>
          <li>This page posts to <code>/api/admin/createMatch</code>.</li>
        </ul>
      </section>

      <section className="matches">
        {matches.map((match) => (
          <li key={match.id}>
            {match.matchName} - {match.sportType}
          </li>
        ))}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="modalBackdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Create New Match</h3>
              <button
                className="iconBtn"
                onClick={closeModal}
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="form">
              <label>
                Sport Type
                <select
                  name="sportType"
                  value={form.sportType}
                  onChange={onChange}
                >
                  <option value="">-- Select Sport --</option>
                  {SPORT_OPTIONS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Match Name
                <input
                  name="matchName"
                  placeholder="MTN Semi Final"
                  value={form.matchName}
                  onChange={onChange}
                />
              </label>

              <div className="row">
                <label>
                  Home Team
                  <Select
                    name="homeTeam"
                    value={teamOptions.find(
                      (option) => option.value === form.homeTeam
                    )}
                    onChange={handleSelectChange}
                    options={teamOptions}
                    isSearchable
                    placeholder="Select Home Team"
                  />
                </label>

                <label>
                  Away Team
                  <Select
                    name="awayTeam"
                    value={teamOptions.find(
                      (option) => option.value === form.awayTeam
                    )}
                    onChange={handleSelectChange}
                    options={teamOptions}
                    isSearchable
                    placeholder="Select Away Team"
                  />
                </label>
              </div>

              <div className="row">
                <label>
                  Start Time
                  <input
                    name="startTime"
                    type="datetime-local"
                    value={form.startTime}
                    onChange={onChange}
                  />
                </label>
                <label>
                  Venue
                  <input
                    name="venue"
                    placeholder="Orlando Stadium"
                    value={form.venue}
                    onChange={onChange}
                  />
                </label>
              </div>

              <div className="btnRow">
                <button
                  type="button"
                  onClick={closeModal}
                  className="secondaryBtn"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="primaryBtn" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Match"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
