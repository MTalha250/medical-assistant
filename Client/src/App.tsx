import { Route, Routes } from "react-router-dom";
import Layout from "@/Layout";
import Home from "@/pages/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Chat from "./pages/Chat";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Routes>
  );
}

export default App;
