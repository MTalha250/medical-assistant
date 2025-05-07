import { Menu } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Dashboard/Sidebar";
import useAuthStore from "@/store/authStore";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white shadow-sm py-4 px-4 flex items-center">
          <button
            className="p-1 mr-4"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold">MedAssist</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
