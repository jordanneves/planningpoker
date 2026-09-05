import { Room } from "@planning-poker/shared";

const rooms = new Map<string, Room>();

export interface SocketBinding {
  roomCode: string;
  participantId: string;
}
const socketBindings = new Map<string, SocketBinding>();

export function saveRoom(room: Room): void {
  rooms.set(room.code, room);
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function deleteRoom(code: string): void {
  rooms.delete(code.toUpperCase());
}

export function bindSocket(socketId: string, binding: SocketBinding): void {
  socketBindings.set(socketId, binding);
}

export function getSocketBinding(socketId: string): SocketBinding | undefined {
  return socketBindings.get(socketId);
}

export function unbindSocket(socketId: string): void {
  socketBindings.delete(socketId);
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code: string;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms.has(code));
  return code;
}
