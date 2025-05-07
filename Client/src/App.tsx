import { Route, Routes } from "react-router-dom";
import Layout from "@/Layout";
import Home from "@/pages/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import Assistant from "./components/Dashboard/Assistant";
import Resources from "./components/Dashboard/Resources";
import Records from "./components/Dashboard/Records";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="/dashboard" element={<Assistant />} />
          <Route path="/dashboard/resources" element={<Resources />} />
          <Route path="/dashboard/records" element={<Records />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
