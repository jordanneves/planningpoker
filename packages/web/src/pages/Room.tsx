import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoomStore, getCurrentTask, getYourRole } from "../store/useRoomStore";
import ParticipantList from "../components/ParticipantList";
import TaskList from "../components/TaskList";
import TaskPanel from "../components/TaskPanel";

export default function RoomPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { room, yourParticipantId, lastRevealedStats, updateAutoReveal } = useRoomStore();

  useEffect(() => {
    if (!room) {
      const timeout = setTimeout(() => navigate("/"), 400);
      return () => clearTimeout(timeout);
    }
  }, [room, navigate]);

  if (!room) {
    return (
      <div style={styles.loading}>
        <p>Conectando à sala {code}…</p>
      </div>
    );
  }

  const currentTask = getCurrentTask(room);
  const yourRole = getYourRole(room, yourParticipantId);
  const inviteLink = `${window.location.origin}/sala/${room.code}`;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.roomName}>{room.name}</h1>
          <p style={styles.roomMeta}>
            Código: <strong>{room.code}</strong> · Escala: {room.settings.votingScale}
          </p>
        </div>
        <div style={styles.headerActions}>
          {yourRole === "organizer" && (
            <label style={styles.autoRevealToggle}>
              <input
                type="checkbox"
                checked={room.settings.autoReveal}
                onChange={(e) => updateAutoReveal(e.target.checked)}
              />
              Revelar automaticamente
            </label>
          )}
          <button
            className="btn-ghost btn"
            style={{ fontSize: 13 }}
            onClick={() => navigator.clipboard.writeText(inviteLink)}
          >
            Copiar link de convite
          </button>
        </div>
      </header>

      <div style={styles.body}>
        <ParticipantList participants={room.participants} currentTask={currentTask} />
        <TaskPanel
          task={currentTask}
          yourRole={yourRole}
          yourParticipantId={yourParticipantId}
          votingScale={room.settings.votingScale}
          stats={currentTask?.status === "revealed" ? lastRevealedStats : null}
        />
        <TaskList tasks={room.tasks} currentTaskId={room.currentTaskId} yourRole={yourRole} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
  page: { display: "flex", flexDirection: "column", height: "100%", padding: "24px 32px", gap: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 },
  roomName: { fontSize: 26 },
  roomMeta: { fontSize: 13, color: "var(--ink-muted)", marginTop: 6 },
  headerActions: { display: "flex", alignItems: "center", gap: 16 },
  autoRevealToggle: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-muted)" },
  body: { display: "flex", gap: 20, flex: 1, flexWrap: "wrap" },
};
