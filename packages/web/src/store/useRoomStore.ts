import { create } from "zustand";
import {
  CreateRoomPayload,
  JoinRoomPayload,
  Role,
  Room,
  RoomStatePayload,
  SOCKET_EVENTS,
  Task,
  VoteStats,
  VotesRevealedPayload,
} from "@planning-poker/shared";
import { getSocket } from "../lib/socket";

interface RoomStoreState {
  room: Room | null;
  yourParticipantId: string | null;
  lastRevealedStats: VoteStats | null;
  errorMessage: string | null;

  createRoom: (payload: CreateRoomPayload) => void;
  joinRoom: (payload: JoinRoomPayload) => void;
  createTask: (title: string, description: string) => void;
  updateTask: (taskId: string, title: string, description: string) => void;
  deleteTask: (taskId: string) => void;
  selectTask: (taskId: string) => void;
  castVote: (value: string) => void;
  revealVotes: () => void;
  resetVotes: () => void;
  updateAutoReveal: (autoReveal: boolean) => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomStoreState>((set) => {
  const socket = getSocket();

  socket.on(SOCKET_EVENTS.ROOM_STATE, (payload: RoomStatePayload) => {
    set({ room: payload.room, yourParticipantId: payload.yourParticipantId });
  });

  socket.on(SOCKET_EVENTS.VOTES_REVEALED, (payload: VotesRevealedPayload) => {
    set({ lastRevealedStats: payload.stats });
  });

  socket.on(SOCKET_EVENTS.ERROR, (payload: { message: string }) => {
    set({ errorMessage: payload.message });
  });

  return {
    room: null,
    yourParticipantId: null,
    lastRevealedStats: null,
    errorMessage: null,

    createRoom: (payload) => socket.emit(SOCKET_EVENTS.CREATE_ROOM, payload),
    joinRoom: (payload) => socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload),
    createTask: (title, description) =>
      socket.emit(SOCKET_EVENTS.CREATE_TASK, { title, description }),
    updateTask: (taskId, title, description) =>
      socket.emit(SOCKET_EVENTS.UPDATE_TASK, { taskId, title, description }),
    deleteTask: (taskId) => socket.emit(SOCKET_EVENTS.DELETE_TASK, { taskId }),
    selectTask: (taskId) => socket.emit(SOCKET_EVENTS.SELECT_TASK, { taskId }),
    castVote: (value) => socket.emit(SOCKET_EVENTS.CAST_VOTE, { value }),
    revealVotes: () => socket.emit(SOCKET_EVENTS.REVEAL_VOTES),
    resetVotes: () => socket.emit(SOCKET_EVENTS.RESET_VOTES),
    updateAutoReveal: (autoReveal) =>
      socket.emit(SOCKET_EVENTS.UPDATE_SETTINGS, { autoReveal }),
    clearError: () => set({ errorMessage: null }),
  };
});

export function getCurrentTask(room: Room | null): Task | null {
  if (!room || !room.currentTaskId) return null;
  return room.tasks.find((t) => t.id === room.currentTaskId) ?? null;
}

export function getYourRole(room: Room | null, participantId: string | null): Role | null {
  if (!room || !participantId) return null;
  return room.participants.find((p) => p.id === participantId)?.role ?? null;
}
