import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role, VOTING_SCALE_LIST, VotingScaleKey } from "@planning-poker/shared";
import { useRoomStore } from "../store/useRoomStore";

type Mode = "create" | "join";

export default function Home() {
  const navigate = useNavigate();
  const { room, errorMessage, clearError, createRoom, joinRoom } = useRoomStore();
  const [mode, setMode] = useState<Mode>("create");

  const [roomName, setRoomName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [votingScale, setVotingScale] = useState<VotingScaleKey>("fibonacci");
  const [autoReveal, setAutoReveal] = useState(true);

  const [roomCode, setRoomCode] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [role, setRole] = useState<Role>("voter");

  useEffect(() => {
    if (room) navigate(`/sala/${room.code}`);
  }, [room, navigate]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createRoom({ roomName, organizerName, votingScale, autoReveal });
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    joinRoom({ roomCode: roomCode.trim(), participantName, role });
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Planning Poker</h1>
        <p style={styles.subtitle}>Estime tarefas com o time, em tempo real.</p>
      </div>

      <div className="card-surface" style={styles.panel}>
        <div style={styles.tabs}>
          <button
            className="btn-ghost btn"
            style={mode === "create" ? styles.tabActive : styles.tab}
            onClick={() => setMode("create")}
          >
            Criar sala
          </button>
          <button
            className="btn-ghost btn"
            style={mode === "join" ? styles.tabActive : styles.tab}
            onClick={() => setMode("join")}
          >
            Entrar em uma sala
          </button>
        </div>

        {errorMessage && (
          <div style={styles.error}>
            {errorMessage}
            <button className="btn-ghost btn" style={styles.errorClose} onClick={clearError}>
              ✕
            </button>
          </div>
        )}

        {mode === "create" ? (
          <form onSubmit={handleCreate} style={styles.form}>
            <label style={styles.label}>
              Nome da sala
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Sprint 24 - Refinamento"
                required
              />
            </label>
            <label style={styles.label}>
              Seu nome (você será o organizador)
              <input
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </label>
            <label style={styles.label}>
              Escala de votação
              <select value={votingScale} onChange={(e) => setVotingScale(e.target.value as VotingScaleKey)}>
                {VOTING_SCALE_LIST.map((scale) => (
                  <option key={scale.key} value={scale.key}>
                    {scale.label} — {scale.description}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={autoReveal}
                onChange={(e) => setAutoReveal(e.target.checked)}
              />
              Revelar votos automaticamente quando todos votarem
            </label>
            <button type="submit" className="btn btn-primary" style={styles.submit}>
              Criar sala
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} style={styles.form}>
            <label style={styles.label}>
              Código da sala
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                required
              />
            </label>
            <label style={styles.label}>
              Seu nome
              <input
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </label>
            <label style={styles.label}>
              Como você vai participar?
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="voter">Votante — vota e vê os resultados</option>
                <option value="spectator">Espectador — só acompanha</option>
              </select>
            </label>
            <button type="submit" className="btn btn-primary" style={styles.submit}>
              Entrar na sala
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 20px", gap: 40 },
  hero: { textAlign: "center", maxWidth: 480 },
  title: { fontSize: 44, fontWeight: 700 },
  subtitle: { marginTop: 10, color: "var(--ink-muted)", fontSize: 17 },
  panel: { width: "100%", maxWidth: 440, padding: 28 },
  tabs: { display: "flex", gap: 8, marginBottom: 20 },
  tab: { flex: 1, opacity: 0.65 },
  tabActive: { flex: 1, background: "var(--felt-700)" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "var(--ink-muted)" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 14 },
  submit: { marginTop: 8, width: "100%" },
  error: {
    background: "rgba(193,85,61,0.15)",
    border: "1px solid var(--danger-500)",
    color: "#f4b8ab",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },
  errorClose: { padding: "2px 8px", border: "none" },
};
