import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import VideoChat from "./screens/VideoChat";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<VideoChat />} />
      </Routes>
    </div>
  );
}

export default App;
