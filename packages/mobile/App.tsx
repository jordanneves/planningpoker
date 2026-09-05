import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import RoomScreen from "./src/screens/RoomScreen";

export default function App() {
  const [inRoom, setInRoom] = useState(false);

  return (
    <>
      <StatusBar style="light" />
      {inRoom ? (
        <RoomScreen onLeave={() => setInRoom(false)} />
      ) : (
        <HomeScreen onEnterRoom={() => setInRoom(true)} />
      )}
    </>
  );
}
