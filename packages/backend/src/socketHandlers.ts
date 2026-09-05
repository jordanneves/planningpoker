import { Server, Socket } from "socket.io";
import {
  CastVotePayload,
  CreateRoomPayload,
  CreateTaskPayload,
  JoinRoomPayload,
  RoomStatePayload,
  SOCKET_EVENTS,
  UpdateTaskPayload,
  VotingScaleKey,
} from "@planning-poker/shared";
import {
  bindSocket,
  getRoom,
  getSocketBinding,
  saveRoom,
  unbindSocket,
} from "./roomStore";
import * as logic from "./roomLogic";

function broadcastRoomState(io: Server, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room) return;
  const socketsInRoom = io.sockets.adapter.rooms.get(roomCode);
  if (!socketsInRoom) return;
  for (const socketId of socketsInRoom) {
    const binding = getSocketBinding(socketId);
    if (!binding) continue;
    const payload: RoomStatePayload = { room, yourParticipantId: binding.participantId };
    io.to(socketId).emit(SOCKET_EVENTS.ROOM_STATE, payload);
  }
}

function currentParticipant(roomCode: string, socketId: string) {
  const room = getRoom(roomCode);
  const binding = getSocketBinding(socketId);
  if (!room || !binding) return { room: undefined, participant: undefined };
  const participant = room.participants.find((p) => p.id === binding.participantId);
  return { room, participant };
}

export function registerSocketHandlers(io: Server, socket: Socket): void {
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload: CreateRoomPayload) => {
    try {
      const { room, organizerId } = logic.createRoom(
        payload.roomName,
        payload.organizerName,
        payload.votingScale as VotingScaleKey,
        payload.autoReveal
      );
      saveRoom(room);
      socket.join(room.code);
      bindSocket(socket.id, { roomCode: room.code, participantId: organizerId });
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload: JoinRoomPayload) => {
    try {
      const room = getRoom(payload.roomCode);
      if (!room) throw new logic.RoomError("Sala não encontrada. Confira o código.", "NOT_FOUND");
      const participant = logic.addParticipant(room, payload.participantName, payload.role);
      saveRoom(room);
      socket.join(room.code);
      bindSocket(socket.id, { roomCode: room.code, participantId: participant.id });
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.CREATE_TASK, (payload: CreateTaskPayload) => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      logic.requireRole(participant, ["organizer"]);
      logic.createTask(room, payload.title, payload.description);
      saveRoom(room);
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.UPDATE_TASK, (payload: UpdateTaskPayload) => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      logic.requireRole(participant, ["organizer"]);
      logic.updateTask(room, payload.taskId, payload.title, payload.description);
      saveRoom(room);
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.DELETE_TASK, (payload: { taskId: string }) => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      logic.requireRole(participant, ["organizer"]);
      logic.deleteTask(room, payload.taskId);
      saveRoom(room);
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.SELECT_TASK, (payload: { taskId: string }) => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      logic.requireRole(participant, ["organizer"]);
      logic.selectTask(room, payload.taskId);
      saveRoom(room);
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.CAST_VOTE, (payload: CastVotePayload) => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room || !participant) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      const task = logic.castVote(room, participant, payload.value);
      saveRoom(room);
      broadcastRoomState(io, room.code);
      if (room.settings.autoReveal && logic.allVotersHaveVoted(room, task)) {
        const { stats } = logic.revealVotes(room, task.id);
        saveRoom(room);
        io.to(room.code).emit(SOCKET_EVENTS.VOTES_REVEALED, { task, stats });
        broadcastRoomState(io, room.code);
      }
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.REVEAL_VOTES, () => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      logic.requireRole(participant, ["organizer"]);
      if (!room.currentTaskId) throw new logic.RoomError("Nenhuma tarefa selecionada.", "NO_TASK");
      const { task, stats } = logic.revealVotes(room, room.currentTaskId);
      saveRoom(room);
      io.to(room.code).emit(SOCKET_EVENTS.VOTES_REVEALED, { task, stats });
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.RESET_VOTES, () => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      logic.requireRole(participant, ["organizer"]);
      if (!room.currentTaskId) throw new logic.RoomError("Nenhuma tarefa selecionada.", "NO_TASK");
      logic.resetVotes(room, room.currentTaskId);
      saveRoom(room);
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on(SOCKET_EVENTS.UPDATE_SETTINGS, (payload: { autoReveal: boolean }) => {
    const { room, participant } = currentParticipant(getBindingRoom(socket), socket.id);
    try {
      if (!room) throw new logic.RoomError("Sala não encontrada.", "NOT_FOUND");
      logic.requireRole(participant, ["organizer"]);
      room.settings.autoReveal = payload.autoReveal;
      saveRoom(room);
      broadcastRoomState(io, room.code);
    } catch (err) {
      emitError(socket, err);
    }
  });

  socket.on("disconnect", () => {
    const binding = getSocketBinding(socket.id);
    if (!binding) return;
    const room = getRoom(binding.roomCode);
    if (room) {
      logic.removeParticipant(room, binding.participantId);
      saveRoom(room);
      broadcastRoomState(io, room.code);
    }
    unbindSocket(socket.id);
  });
}

function getBindingRoom(socket: Socket): string {
  const binding = getSocketBinding(socket.id);
  return binding?.roomCode ?? "";
}

function emitError(socket: Socket, err: unknown): void {
  const message = err instanceof logic.RoomError ? err.message : "Erro inesperado no servidor.";
  const code = err instanceof logic.RoomError ? err.code : "UNKNOWN";
  socket.emit(SOCKET_EVENTS.ERROR, { message, code });
}
