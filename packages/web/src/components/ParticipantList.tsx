import { Participant, Task } from "@planning-poker/shared";

const ROLE_LABELS: Record<string, string> = {
  organizer: "Organizador",
  spectator: "Espectador",
  voter: "Votante",
};

interface Props {
  participants: Participant[];
  currentTask: Task | null;
}

export default function ParticipantList({ participants, currentTask }: Props) {
  const revealed = currentTask?.status === "revealed";

  return (
    <div className="card-surface" style={styles.wrap}>
      <h3 style={styles.title}>Participantes ({participants.filter((p) => p.isConnected).length})</h3>
      <ul style={styles.list}>
        {participants.map((p) => {
          const vote = currentTask?.votes.find((v) => v.participantId === p.id);
          return (
            <li key={p.id} style={{ ...styles.item, opacity: p.isConnected ? 1 : 0.4 }}>
              <div>
                <div style={styles.name}>{p.name}</div>
                <div style={styles.role}>{ROLE_LABELS[p.role]}</div>
              </div>
              {p.role === "voter" && currentTask && (
                <div style={styles.voteStatus}>
                  {revealed ? (
                    <span style={styles.voteValue}>{vote?.value ?? "—"}</span>
                  ) : vote ? (
                    <span title="Votou" style={styles.dotVoted} />
                  ) : (
                    <span title="Ainda não votou" style={styles.dotPending} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 18, width: 220, flexShrink: 0 },
  title: { fontSize: 15, marginBottom: 12, color: "var(--ink-muted)" },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 },
  item: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 },
  name: { fontWeight: 600 },
  role: { fontSize: 12, color: "var(--ink-muted)" },
  voteStatus: { display: "flex", alignItems: "center" },
  voteValue: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    background: "var(--paper-100)",
    color: "var(--ink-900)",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 13,
  },
  dotVoted: { width: 10, height: 10, borderRadius: "50%", background: "var(--success-500)", display: "inline-block" },
  dotPending: { width: 10, height: 10, borderRadius: "50%", background: "var(--felt-600)", display: "inline-block" },
};
