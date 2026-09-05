import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { VOTING_SCALES } from "@planning-poker/shared";
import { useRoomStore, getCurrentTask, getYourRole } from "../store/useRoomStore";
import { colors } from "../theme";

export default function RoomScreen({ onLeave }: { onLeave: () => void }) {
  const { room, yourParticipantId, lastRevealedStats, castVote, revealVotes, resetVotes, createTask, selectTask, deleteTask, leaveRoom } =
    useRoomStore();
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showTasks, setShowTasks] = useState(false);

  if (!room) return null;

  const currentTask = getCurrentTask(room);
  const yourRole = getYourRole(room, yourParticipantId);
  const isOrganizer = yourRole === "organizer";
  const scale = VOTING_SCALES[room.settings.votingScale];
  const allCards = [...scale.cards, ...scale.specialCards];
  const myVote = currentTask?.votes.find((v) => v.participantId === yourParticipantId)?.value ?? null;
  const revealed = currentTask?.status === "revealed";

  function handleLeave() {
    leaveRoom();
    onLeave();
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomMeta}>Código: {room.code}</Text>
        </View>
        <TouchableOpacity onPress={handleLeave}>
          <Text style={styles.leave}>Sair</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.taskToggle} onPress={() => setShowTasks((s) => !s)}>
        <Text style={styles.taskToggleText}>
          {showTasks ? "Ocultar tarefas" : `Ver tarefas (${room.tasks.length})`}
        </Text>
      </TouchableOpacity>

      {showTasks && (
        <View style={styles.taskListWrap}>
          {isOrganizer && (
            <View style={styles.newTaskForm}>
              <TextInput
                style={styles.input}
                placeholder="Título da nova tarefa"
                placeholderTextColor="#8a998f"
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Descrição (opcional)"
                placeholderTextColor="#8a998f"
                value={newDesc}
                onChangeText={setNewDesc}
              />
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => {
                  if (!newTitle.trim()) return;
                  createTask(newTitle, newDesc);
                  setNewTitle("");
                  setNewDesc("");
                }}
              >
                <Text style={styles.smallBtnText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={room.tasks}
            keyExtractor={(t) => t.id}
            style={{ maxHeight: 180 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.taskRow, item.id === room.currentTaskId && styles.taskRowActive]}
                onPress={() => isOrganizer && selectTask(item.id)}
              >
                <Text style={styles.taskRowTitle}>{item.title}</Text>
                {isOrganizer && (
                  <TouchableOpacity onPress={() => deleteTask(item.id)}>
                    <Text style={styles.taskRowDelete}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.body}>
        {!currentTask ? (
          <Text style={styles.waitingText}>
            {isOrganizer ? "Selecione uma tarefa acima para votar." : "Aguardando o organizador iniciar a votação."}
          </Text>
        ) : (
          <>
            <Text style={styles.currentTaskTitle}>{currentTask.title}</Text>
            {!!currentTask.description && <Text style={styles.currentTaskDesc}>{currentTask.description}</Text>}

            {revealed && lastRevealedStats ? (
              <View style={styles.statsBox}>
                <Text style={styles.statsHeadline}>
                  Média: {lastRevealedStats.average ?? "—"} · Consenso: {lastRevealedStats.consensus ? "Sim 🎉" : "Não"}
                </Text>
                <View style={styles.cardGrid}>
                  {room.participants
                    .filter((p) => p.role === "voter")
                    .map((p) => {
                      const v = currentTask.votes.find((vote) => vote.participantId === p.id);
                      return (
                        <View key={p.id} style={styles.resultCard}>
                          <Text style={styles.resultCardValue}>{v?.value ?? "—"}</Text>
                          <Text style={styles.resultCardName}>{p.name}</Text>
                        </View>
                      );
                    })}
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.voteCount}>{currentTask.votes.length} voto(s) registrado(s)</Text>
                {yourRole === "voter" && (
                  <View style={styles.cardGrid}>
                    {allCards.map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[styles.card, myVote === value && styles.cardSelected]}
                        onPress={() => castVote(value)}
                      >
                        <Text style={styles.cardText}>{value}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {isOrganizer && (
              <TouchableOpacity
                style={styles.revealBtn}
                onPress={revealed ? resetVotes : revealVotes}
                disabled={!revealed && currentTask.votes.length === 0}
              >
                <Text style={styles.revealBtnText}>{revealed ? "Nova votação" : "Revelar votos"}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.feltDark, paddingTop: 56 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  roomName: { color: colors.paper, fontSize: 20, fontWeight: "700" },
  roomMeta: { color: colors.inkMuted, fontSize: 12, marginTop: 2 },
  leave: { color: colors.danger, fontSize: 14 },
  taskToggle: { marginHorizontal: 20, marginTop: 14, paddingVertical: 8 },
  taskToggleText: { color: colors.brassLight, fontSize: 13 },
  taskListWrap: { marginHorizontal: 20, backgroundColor: colors.feltMid, borderRadius: 10, padding: 12, marginBottom: 8 },
  newTaskForm: { gap: 8, marginBottom: 10 },
  input: { backgroundColor: colors.paper, color: colors.ink, borderRadius: 6, padding: 8, fontSize: 13 },
  smallBtn: { backgroundColor: colors.brass, borderRadius: 6, paddingVertical: 8, alignItems: "center" },
  smallBtnText: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  taskRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderLeftWidth: 3, borderLeftColor: "transparent", paddingLeft: 6 },
  taskRowActive: { borderLeftColor: colors.brass },
  taskRowTitle: { color: colors.paper, fontSize: 13 },
  taskRowDelete: { color: colors.danger, fontSize: 13, paddingHorizontal: 6 },
  body: { padding: 24, alignItems: "center", gap: 16 },
  waitingText: { color: colors.inkMuted, textAlign: "center", marginTop: 40, fontSize: 15 },
  currentTaskTitle: { color: colors.paper, fontSize: 22, fontWeight: "700", textAlign: "center" },
  currentTaskDesc: { color: colors.inkMuted, fontSize: 14, textAlign: "center" },
  voteCount: { color: colors.inkMuted, fontSize: 12 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  card: { width: 64, height: 90, backgroundColor: colors.paper, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  cardSelected: { borderColor: colors.brass },
  cardText: { color: colors.ink, fontWeight: "700", fontSize: 18 },
  resultCard: { width: 64, alignItems: "center" },
  resultCardValue: { backgroundColor: colors.paper, color: colors.ink, fontWeight: "700", fontSize: 16, width: 56, height: 76, borderRadius: 8, textAlign: "center", textAlignVertical: "center" },
  resultCardName: { color: colors.inkMuted, fontSize: 11, marginTop: 4, textAlign: "center" },
  statsBox: { alignItems: "center", gap: 16 },
  statsHeadline: { color: colors.brassLight, fontSize: 14, fontWeight: "600" },
  revealBtn: { backgroundColor: colors.brass, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, marginTop: 10 },
  revealBtnText: { color: colors.ink, fontWeight: "700" },
});
