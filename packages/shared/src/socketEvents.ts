import { Role, Room, Task, VoteStats, VotingScaleKey } from "./types.js";

export const SOCKET_EVENTS = {
  CREATE_ROOM: "room:create",
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",
  CREATE_TASK: "task:create",
  UPDATE_TASK: "task:update",
  DELETE_TASK: "task:delete",
  SELECT_TASK: "task:select",
  CAST_VOTE: "vote:cast",
  REVEAL_VOTES: "vote:reveal",
  RESET_VOTES: "vote:reset",
  UPDATE_SETTINGS: "room:updateSettings",

  ROOM_STATE: "room:state",
  VOTES_REVEALED: "vote:revealed",
  ERROR: "app:error",
} as const;

export interface CreateRoomPayload {
  roomName: string;
  organizerName: string;
  votingScale: VotingScaleKey;
  autoReveal: boolean;
}

export interface JoinRoomPayload {
  roomCode: string;
  participantName: string;
  role: Role;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
}

export interface UpdateTaskPayload {
  taskId: string;
  title: string;
  description: string;
}

export interface CastVotePayload {
  value: string;
}

export interface RoomStatePayload {
  room: Room;
  yourParticipantId: string;
}

export interface VotesRevealedPayload {
  task: Task;
  stats: VoteStats;
}
