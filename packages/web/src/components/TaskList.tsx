import { useState } from "react";
import { Role, Task } from "@planning-poker/shared";
import { useRoomStore } from "../store/useRoomStore";

interface Props {
  tasks: Task[];
  currentTaskId: string | null;
  yourRole: Role | null;
}

const STATUS_LABELS: Record<Task["status"], string> = {
  pending: "Aguardando",
  voting: "Em votação",
  revealed: "Revelada",
};

export default function TaskList({ tasks, currentTaskId, yourRole }: Props) {
  const { createTask, deleteTask, selectTask } = useRoomStore();
  const isOrganizer = yourRole === "organizer";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createTask(title, description);
    setTitle("");
    setDescription("");
    setShowForm(false);
  }

  return (
    <div className="card-surface" style={styles.wrap}>
      <div style={styles.header}>
        <h3 style={styles.title}>Tarefas ({tasks.length})</h3>
        {isOrganizer && (
          <button className="btn-ghost btn" style={styles.addBtn} onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancelar" : "+ Nova"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da tarefa" autoFocus />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descrição (opcional)"
            rows={2}
          />
          <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
            Adicionar tarefa
          </button>
        </form>
      )}

      <ul style={styles.list}>
        {tasks.length === 0 && <li style={styles.empty}>Nenhuma tarefa ainda.</li>}
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              ...styles.item,
              borderLeftColor: task.id === currentTaskId ? "var(--brass-500)" : "transparent",
            }}
          >
            <div style={styles.itemMain} onClick={() => isOrganizer && selectTask(task.id)}>
              <div style={styles.itemTitle}>{task.title}</div>
              <div style={styles.itemMeta}>
                {STATUS_LABELS[task.status]}
                {task.finalEstimate ? ` · estimativa: ${task.finalEstimate}` : ""}
              </div>
            </div>
            {isOrganizer && (
              <button className="btn-ghost btn" style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 18, width: 280, flexShrink: 0 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 15, color: "var(--ink-muted)" },
  addBtn: { fontSize: 12, padding: "6px 10px" },
  form: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6, maxHeight: 420, overflowY: "auto" },
  empty: { fontSize: 13, color: "var(--ink-muted)" },
  item: { display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "3px solid transparent", paddingLeft: 10, borderRadius: 4 },
  itemMain: { cursor: "pointer", flex: 1, padding: "6px 0" },
  itemTitle: { fontSize: 14, fontWeight: 500 },
  itemMeta: { fontSize: 12, color: "var(--ink-muted)", marginTop: 2 },
  deleteBtn: { padding: "4px 8px", fontSize: 12, border: "none" },
};
