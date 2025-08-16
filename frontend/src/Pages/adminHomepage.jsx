import { useState } from "react";

const initialForm = {
  sportType: "",
  matchName: "",
  homeTeam: "",
  awayTeam: "",
  startTime: "",
  venue: "",
};

export default function AdminHome() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL; //  https://prime-backend.azurewebsites.net
// http://localhost:3000/api/admin/createMatch

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setMessage(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const closeModal = () => {
    if (!submitting) setShowModal(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

 
    const required = ["sportType", "matchName", "homeTeam", "awayTeam", "startTime", "venue"];
    const missing = required.filter((k) => !form[k]?.trim());
    if (missing.length) {
      setMessage({ type: "error", text: `Missing: ${missing.join(", ")}` });
      setSubmitting(false);
      return;
    }

    try {
    //   const res = await fetch(`${backendUrl}/api/admin/createMatch`, {
        const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/createMatch`, {
        
        method: "POST",
        headers: { "Content-Type": "application/json" },
   
        body: JSON.stringify({
          sportType: form.sportType,
          matchName: form.matchName,
          homeTeam: form.homeTeam,
          awayTeam: form.awayTeam,
          startTime: form.startTime,
          venue: form.venue,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to create match");
      }

    //   setMessage({ type: "success", text: `Match created (id: ${data.id || "n/a"})` });
      setForm(initialForm);
      setShowModal(false);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}> Admin Home</h1>
        <button style={styles.primaryBtn} onClick={openModal}>＋ Create Match</button>
      </header>

      {message && (
        <div
          style={{
            ...styles.alert,
            background: message.type === "success" ? "#e6ffed" : "#ffeaea",
            borderColor: message.type === "success" ? "#2ecc71" : "#e74c3c",
            color: message.type === "success" ? "#1e824c" : "#c0392b",
          }}
        >
          {message.text}
        </div>
      )}

      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Quick Actions</h2>
        <p>Use the button above to schedule a new match.</p>
        <ul style={{ paddingLeft: "1.2rem" }}>
          <li>Create matches with home/away teams, start time, and venue.</li>
          <li>This page posts to <code>/api/admin/createMatch</code>.</li>
         
        </ul>
      </section>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalBackdrop} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Create New Match</h3>
              <button style={styles.iconBtn} onClick={closeModal} disabled={submitting}>✕</button>
            </div>

            <form onSubmit={onSubmit} style={styles.form}>
              <label style={styles.label}>
                Sport Type
                <input
                  name="sportType"
                  placeholder="Football"
                  value={form.sportType}
                  onChange={onChange}
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Match Name
                <input
                  name="matchName"
                  placeholder="MTN Semi Final"
                  value={form.matchName}
                  onChange={onChange}
                  style={styles.input}
                />
              </label>

              <div style={styles.row}>
                <label style={{ ...styles.label, flex: 1 }}>
                  Home Team
                  <input
                    name="homeTeam"
                    placeholder="Orlando Pirates"
                    value={form.homeTeam}
                    onChange={onChange}
                    style={styles.input}
                  />
                </label>
                <label style={{ ...styles.label, flex: 1 }}>
                  Away Team
                  <input
                    name="awayTeam"
                    placeholder="Mamelodi Sundowns"
                    value={form.awayTeam}
                    onChange={onChange}
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={styles.row}>
                <label style={{ ...styles.label, flex: 1 }}>
                  Start Time
                  <input
                    name="startTime"
                    placeholder="2025-08-15T15:00"
                    value={form.startTime}
                    onChange={onChange}
                    style={styles.input}
                  />
                </label>
                <label style={{ ...styles.label, flex: 1 }}>
                  Venue
                  <input
                    name="venue"
                    placeholder="Orlando Stadium"
                    value={form.venue}
                    onChange={onChange}
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button type="button" onClick={closeModal} style={styles.secondaryBtn} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn} disabled={submitting}>
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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e6e8f0",
    padding: "24px",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  card: {
    background: "#121a2b",
    border: "1px solid #1e2a44",
    borderRadius: 14,
    padding: 18,
    maxWidth: 820,
  },
  primaryBtn: {
    background: "#3b82f6",
    border: 0,
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid #2a3b61",
    color: "#c9d3ee",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
  alert: {
    margin: "12px 0",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid",
    maxWidth: 820,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 640,
    background: "#0f172a",
    border: "1px solid #223154",
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconBtn: {
    background: "transparent",
    border: 0,
    color: "#9fb3ff",
    fontSize: 20,
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 14 },
  input: {
    background: "#0b1220",
    border: "1px solid #233456",
    color: "#e6e8f0",
    padding: "10px 12px",
    borderRadius: 10,
    outline: "none",
  },
  row: { display: "flex", gap: 12 },
};
