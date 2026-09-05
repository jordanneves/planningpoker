import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { Role, VOTING_SCALE_LIST, VotingScaleKey } from "@planning-poker/shared";
import { useRoomStore } from "../store/useRoomStore";
import { colors } from "../theme";

type Mode = "create" | "join";

export default function HomeScreen({ onEnterRoom }: { onEnterRoom: () => void }) {
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
    if (room) onEnterRoom();
  }, [room]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Planning Poker</Text>
      <Text style={styles.subtitle}>Estime tarefas com o time, em tempo real.</Text>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, mode === "create" && styles.tabActive]} onPress={() => setMode("create")}>
          <Text style={styles.tabText}>Criar sala</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, mode === "join" && styles.tabActive]} onPress={() => setMode("join")}>
          <Text style={styles.tabText}>Entrar em sala</Text>
        </TouchableOpacity>
      </View>

      {errorMessage && (
        <TouchableOpacity style={styles.errorBox} onPress={clearError}>
          <Text style={styles.errorText}>{errorMessage} (toque pra fechar)</Text>
        </TouchableOpacity>
      )}

      {mode === "create" ? (
        <View style={styles.form}>
          <Field label="Nome da sala" value={roomName} onChangeText={setRoomName} placeholder="Sprint 24" />
          <Field label="Seu nome (organizador)" value={organizerName} onChangeText={setOrganizerName} placeholder="Seu nome" />

          <Text style={styles.label}>Escala de votação</Text>
          <View style={styles.chipRow}>
            {VOTING_SCALE_LIST.map((scale) => (
              <TouchableOpacity
                key={scale.key}
                style={[styles.chip, votingScale === scale.key && styles.chipActive]}
                onPress={() => setVotingScale(scale.key)}
              >
                <Text style={styles.chipText}>{scale.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Revelar automaticamente</Text>
            <Switch value={autoReveal} onValueChange={setAutoReveal} thumbColor={colors.brass} />
          </View>

          <TouchableOpacity
            style={styles.submit}
            onPress={() => createRoom({ roomName, organizerName, votingScale, autoReveal })}
          >
            <Text style={styles.submitText}>Criar sala</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Field
            label="Código da sala"
            value={roomCode}
            onChangeText={(t) => setRoomCode(t.toUpperCase())}
            placeholder="ABC123"
            autoCapitalize="characters"
          />
          <Field label="Seu nome" value={participantName} onChangeText={setParticipantName} placeholder="Seu nome" />

          <Text style={styles.label}>Como você vai participar?</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity style={[styles.chip, role === "voter" && styles.chipActive]} onPress={() => setRole("voter")}>
              <Text style={styles.chipText}>Votante</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, role === "spectator" && styles.chipActive]} onPress={() => setRole("spectator")}>
              <Text style={styles.chipText}>Espectador</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submit}
            onPress={() => joinRoom({ roomCode: roomCode.trim(), participantName, role })}
          >
            <Text style={styles.submitText}>Entrar na sala</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "characters" | "words";
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#8a998f"
        autoCapitalize={props.autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 24, paddingTop: 64, backgroundColor: colors.feltDark, flexGrow: 1 },
  title: { fontSize: 34, fontWeight: "700", color: colors.paper, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.inkMuted, textAlign: "center", marginTop: 8, marginBottom: 28 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.feltLight, alignItems: "center" },
  tabActive: { backgroundColor: colors.feltMid },
  tabText: { color: colors.paper, fontWeight: "600", fontSize: 14 },
  form: { backgroundColor: colors.feltMid, borderRadius: 14, padding: 18 },
  label: { fontSize: 13, color: colors.inkMuted, marginBottom: 6 },
  input: { backgroundColor: colors.paper, color: colors.ink, borderRadius: 8, padding: 12, fontSize: 15 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.feltLight },
  chipActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  chipText: { color: colors.paper, fontSize: 13 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  submit: { backgroundColor: colors.brass, borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  submitText: { color: colors.ink, fontWeight: "700", fontSize: 15 },
  errorBox: { backgroundColor: "#c1553d33", borderColor: colors.danger, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 },
  errorText: { color: "#f4b8ab", fontSize: 13 },
});
