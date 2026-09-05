// Tipos centrais compartilhados por backend, web e mobile.
// Manter este arquivo como única fonte de verdade evita que os três
// times (API, web, mobile) fiquem com modelos de dados divergentes.

export type Role = "organizer" | "spectator" | "voter";

export type VotingScaleKey =
  | "fibonacci"
  | "tshirt"
  | "points"
  | "powers2"
  | "sequential";

export type TaskStatus = "pending" | "voting" | "revealed";

export interface Participant {
  id: string;
  name: string;
  role: Role;
  isConnected: boolean;
  hasVoted: boolean;
}

export interface Vote {
  participantId: string;
  value: string; // valor bruto da carta escolhida, ex: "5", "M", "☕"
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  votes: Vote[];
  finalEstimate: string | null;
  createdAt: number;
}

export interface RoomSettings {
  votingScale: VotingScaleKey;
  autoReveal: boolean;
}

export interface Room {
  code: string;
  name: string;
  settings: RoomSettings;
  participants: Participant[];
  tasks: Task[];
  currentTaskId: string | null;
  createdAt: number;
}

export interface VoteStats {
  average: number | null;
  min: string | null;
  max: string | null;
  consensus: boolean;
  distribution: Record<string, number>;
}

export interface ApiError {
  message: string;
  code: string;
}
