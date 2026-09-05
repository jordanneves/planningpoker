import { randomUUID } from "crypto";
import {
  Participant,
  Room,
  Role,
  Task,
  VoteStats,
  VotingScaleKey,
  getCardsForScale,
} from "@planning-poker/shared";
import { generateRoomCode } from "./roomStore";

export class RoomError extends Error {
  code: string;
  constructor(message: string, code = "ROOM_ERROR") {
    super(message);
    this.code = code;
  }
}

export function createRoom(
  roomName: string,
  organizerName: string,
  votingScale: VotingScaleKey,
  autoReveal: boolean
): { room: Room; organizerId: string } {
  const organizerId = randomUUID();
  const organizer: Participant = {
    id: organizerId,
    name: organizerName.trim() || "Organizador",
    role: "organizer",
    isConnected: true,
    hasVoted: false,
  };

  const room: Room = {
    code: generateRoomCode(),
    name: roomName.trim() || "Sala de Planning Poker",
    settings: { votingScale, autoReveal },
    participants: [organizer],
    tasks: [],
    currentTaskId: null,
    createdAt: Date.now(),
  };

  return { room, organizerId };
}

export function addParticipant(room: Room, name: string, role: Role): Participant {
  const participant: Participant = {
    id: randomUUID(),
    name: name.trim() || "Convidado",
    role,
    isConnected: true,
    hasVoted: false,
  };
  room.participants.push(participant);
  return participant;
}

export function requireRole(participant: Participant | undefined, allowed: Role[]): void {
  if (!participant) throw new RoomError("Participante não encontrado na sala.", "NOT_FOUND");
  if (!allowed.includes(participant.role)) {
    throw new RoomError("Você não tem permissão para fazer isso.", "FORBIDDEN");
  }
}

export function createTask(room: Room, title: string, description: string): Task {
  const task: Task = {
    id: randomUUID(),
    title: title.trim() || "Tarefa sem título",
    description: description.trim(),
    status: "pending",
    votes: [],
    finalEstimate: null,
    createdAt: Date.now(),
  };
  room.tasks.push(task);
  return task;
}

export function updateTask(room: Room, taskId: string, title: string, description: string): Task {
  const task = room.tasks.find((t) => t.id === taskId);
  if (!task) throw new RoomError("Tarefa não encontrada.", "NOT_FOUND");
  task.title = title.trim() || task.title;
  task.description = description.trim();
  return task;
}

export function deleteTask(room: Room, taskId: string): void {
  room.tasks = room.tasks.filter((t) => t.id !== taskId);
  if (room.currentTaskId === taskId) room.currentTaskId = null;
}

export function selectTask(room: Room, taskId: string): Task {
  const task = room.tasks.find((t) => t.id === taskId);
  if (!task) throw new RoomError("Tarefa não encontrada.", "NOT_FOUND");
  task.status = "voting";
  task.votes = [];
  task.finalEstimate = null;
  room.currentTaskId = task.id;
  room.participants.forEach((p) => (p.hasVoted = false));
  return task;
}

export function castVote(room: Room, participant: Participant, value: string): Task {
  if (participant.role !== "voter") {
    throw new RoomError("Apenas votantes podem votar.", "FORBIDDEN");
  }
  const task = room.tasks.find((t) => t.id === room.currentTaskId);
  if (!task) throw new RoomError("Nenhuma tarefa em votação no momento.", "NO_TASK");
  if (task.status !== "voting") {
    throw new RoomError("A votação desta tarefa não está aberta.", "VOTING_CLOSED");
  }
  const allowedCards = getCardsForScale(room.settings.votingScale);
  if (!allowedCards.includes(value)) {
    throw new RoomError("Valor de voto inválido para esta escala.", "INVALID_VOTE");
  }
  const existing = task.votes.find((v) => v.participantId === participant.id);
  if (existing) {
    existing.value = value;
  } else {
    task.votes.push({ participantId: participant.id, value });
  }
  participant.hasVoted = true;
  return task;
}

export function allVotersHaveVoted(room: Room, task: Task): boolean {
  const voters = room.participants.filter((p) => p.role === "voter" && p.isConnected);
  if (voters.length === 0) return false;
  return voters.every((v) => task.votes.some((vote) => vote.participantId === v.id));
}

export function revealVotes(room: Room, taskId: string): { task: Task; stats: VoteStats } {
  const task = room.tasks.find((t) => t.id === taskId);
  if (!task) throw new RoomError("Tarefa não encontrada.", "NOT_FOUND");
  task.status = "revealed";
  const stats = computeStats(room, task);
  task.finalEstimate = stats.consensus ? task.votes[0]?.value ?? null : stats.average !== null ? String(stats.average) : null;
  return { task, stats };
}

export function resetVotes(room: Room, taskId: string): Task {
  const task = room.tasks.find((t) => t.id === taskId);
  if (!task) throw new RoomError("Tarefa não encontrada.", "NOT_FOUND");
  task.votes = [];
  task.status = "voting";
  task.finalEstimate = null;
  room.participants.forEach((p) => (p.hasVoted = false));
  return task;
}

export function computeStats(room: Room, task: Task): VoteStats {
  const scale = room.settings.votingScale;
  const numericCards = getCardsForScale(scale).filter((c) => !isNaN(Number(c)));
  const numericVotes = task.votes
    .map((v) => v.value)
    .filter((v) => numericCards.includes(v))
    .map(Number);

  const distribution: Record<string, number> = {};
  for (const vote of task.votes) {
    distribution[vote.value] = (distribution[vote.value] ?? 0) + 1;
  }

  const uniqueValues = new Set(task.votes.map((v) => v.value));
  const consensus = task.votes.length > 0 && uniqueValues.size === 1;

  const average = numericVotes.length
    ? Math.round((numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length) * 10) / 10
    : null;

  return {
    average,
    min: numericVotes.length ? String(Math.min(...numericVotes)) : null,
    max: numericVotes.length ? String(Math.max(...numericVotes)) : null,
    consensus,
    distribution,
  };
}

export function removeParticipant(room: Room, participantId: string): void {
  const participant = room.participants.find((p) => p.id === participantId);
  if (participant) participant.isConnected = false;
}
