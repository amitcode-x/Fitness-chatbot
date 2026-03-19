import { useState } from "react";
import Intro from "./components/Intro";
import Rules from "./components/Rules";
import Chat from "./components/Chat";

function App() {
  const [screen, setScreen] = useState("intro");

  return (
    <>
      {screen === "intro" && <Intro setScreen={setScreen} />}
      {screen === "rules" && <Rules setScreen={setScreen} />}
      {screen === "chat" && <Chat />}
    </>
  );
}

export default App;