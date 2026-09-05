import { Role, Task, VoteStats, VotingScaleKey } from "@planning-poker/shared";
import VoteCard from "./VoteCard";
import { useRoomStore } from "../store/useRoomStore";

interface Props {
  task: Task | null;
  yourRole: Role | null;
  yourParticipantId: string | null;
  votingScale: VotingScaleKey;
  stats: VoteStats | null;
}

export default function TaskPanel({ task, yourRole, yourParticipantId, votingScale, stats }: Props) {
  const { castVote, revealVotes, resetVotes } = useRoomStore();

  if (!task) {
    return (
      <div className="card-surface" style={{ ...styles.wrap, ...styles.empty }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: "var(--ink-muted)" }}>
          {yourRole === "organizer"
            ? "Selecione uma tarefa na lista para começar a votação."
            : "Aguardando o organizador iniciar a votação de uma tarefa."}
        </h2>
      </div>
    );
  }

  const myVote = task.votes.find((v) => v.participantId === yourParticipantId)?.value ?? null;
  const revealed = task.status === "revealed";
  const votesCount = task.votes.length;

  return (
    <div className="card-surface" style={styles.wrap}>
      <div style={styles.taskHeader}>
        <h2 style={styles.taskTitle}>{task.title}</h2>
        {task.description && <p style={styles.taskDesc}>{task.description}</p>}
      </div>

      {revealed && stats ? (
        <div style={styles.results}>
          <div style={styles.statsRow}>
            <Stat label="Média" value={stats.average !== null ? String(stats.average) : "—"} />
            <Stat label="Mínimo" value={stats.min ?? "—"} />
            <Stat label="Máximo" value={stats.max ?? "—"} />
            <Stat label="Consenso" value={stats.consensus ? "Sim 🎉" : "Não"} />
          </div>
          <div style={styles.distribution}>
            {Object.entries(stats.distribution).map(([value, count]) => (
              <div key={value} className="poker-card" data-value={value} style={{ width: 60, height: 84, fontSize: 18 }}>
                {value}
                <span style={styles.countBadge}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p style={styles.voteCount}>{votesCount} voto(s) registrado(s)</p>
          {yourRole === "voter" ? (
            <VoteCard votingScale={votingScale} selectedValue={myVote} disabled={false} onVote={castVote} />
          ) : (
            <div style={styles.hand}>
              {Array.from({ length: Math.max(votesCount, 1) }).map((_, i) => (
                <div key={i} className="poker-card poker-card-back" data-value="" style={{ color: "transparent" }} />
              ))}
            </div>
          )}
        </>
      )}

      {yourRole === "organizer" && (
        <div style={styles.actions}>
          {!revealed ? (
            <button className="btn btn-primary" onClick={revealVotes} disabled={votesCount === 0}>
              Revelar votos
            </button>
          ) : (
            <button className="btn btn-primary" onClick={resetVotes}>
              Nova votação desta tarefa
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 24, minHeight: 420 },
  empty: { alignItems: "center", justifyContent: "center", textAlign: "center" },
  taskHeader: { borderBottom: "1px solid var(--felt-700)", paddingBottom: 16 },
  taskTitle: { fontSize: 24, fontWeight: 700 },
  taskDesc: { marginTop: 8, color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.5 },
  voteCount: { fontSize: 13, color: "var(--ink-muted)", textAlign: "center" },
  hand: { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" },
  actions: { display: "flex", justifyContent: "center", marginTop: 8 },
  results: { display: "flex", flexDirection: "column", gap: 24 },
  statsRow: { display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" },
  stat: { textAlign: "center" },
  statValue: { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--brass-400)" },
  statLabel: { fontSize: 12, color: "var(--ink-muted)", marginTop: 4 },
  distribution: { display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  countBadge: {
    position: "absolute",
    bottom: -8,
    background: "var(--brass-500)",
    color: "var(--ink-900)",
    borderRadius: "50%",
    width: 20,
    height: 20,
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
