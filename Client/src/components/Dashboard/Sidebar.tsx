import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import {
  FaRobot,
  FaUserMd,
  FaBook,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCrown,
} from "react-icons/fa";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/hooks/auth";
import toast from "react-hot-toast";
import SubscriptionDialog from "./SubscriptionDialog";

interface SidebarProps {
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar = ({ onLogout, mobileOpen, setMobileOpen }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      path: "/dashboard",
      icon: <FaRobot size={20} />,
      label: "Medical Assistant",
    },
    {
      path: "/dashboard/records",
      icon: <FaUserMd size={20} />,
      label: "Health Records",
    },
    {
      path: "/dashboard/resources",
      icon: <FaBook size={20} />,
      label: "Medical Resources",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    onLogout();
    toast.success("Logged out successfully");
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case "free":
        return "Free";
      case "basic":
        return "Basic";
      case "premium":
        return "Premium";
      default:
        return "Free";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500";
      case "basic":
        return "bg-blue-500";
      case "premium":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate/30 backdrop-blur-sm z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`
          fixed left-0 top-0 h-full bg-gradient-to-b from-slate to-[#3A526A] text-white
          transition-all duration-300 ease-in-out z-20
          ${collapsed ? "w-24" : "w-72"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-lg
        `}
      >
        <div className="hidden md:block absolute -right-3 top-10 z-10">
          <button
            className="p-1.5 bg-peach text-slate rounded-full shadow-md hover:bg-peach/90 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaBars size={12} /> : <FaTimes size={12} />}
          </button>
        </div>
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <div className="flex items-center justify-center md:justify-start mb-8">
            <div
              className={`font-bold flex items-center ${
                collapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="bg-peach p-2.5 rounded-xl shadow-md text-slate">
                <FaUserMd className="text-xl" />
              </div>
              {!collapsed && (
                <span className="ml-3 text-xl font-bold text-white">
                  MedAssist
                </span>
              )}
            </div>
          </div>
          <div
            className={`p-4 bg-white/10 rounded-xl ${
              collapsed ? "flex flex-col items-center" : ""
            }`}
          >
            <div className="flex items-center justify-center">
              <Avatar className="bg-skyBlue text-slate shadow-md flex items-center justify-center">
                {user?.name?.charAt(0) || "U"}
              </Avatar>

              {!collapsed && (
                <div className="ml-4 overflow-hidden">
                  <p className="font-medium text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-white/70">{user?.email || ""}</p>
                  <div className="mt-1">
                    <Badge
                      className={`text-xs ${getPlanColor(
                        user?.subscription?.plan || "free"
                      )} text-white`}
                    >
                      {getPlanDisplayName(user?.subscription?.plan || "free")}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center ${
                      collapsed ? "justify-center px-2" : "px-4"
                    } py-3.5 
                    rounded-xl transition-all group relative
                    ${
                      isActive(item.path)
                        ? "bg-skyBlue text-slate font-medium shadow-sm"
                        : "text-white hover:bg-white/10"
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>

                  {!collapsed && <span className="ml-3">{item.label}</span>}
                  {isActive(item.path) && !collapsed && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Subscription Button */}
          <div className="mt-6 px-2">
            <button
              onClick={() => setSubscriptionDialogOpen(true)}
              className={`
                flex items-center ${
                  collapsed ? "justify-center px-2" : "px-4"
                } py-3.5 
                rounded-xl transition-all group relative w-full
                bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                text-white font-medium shadow-sm
              `}
            >
              <FaCrown className="flex-shrink-0" size={20} />
              {!collapsed && <span className="ml-3">Subscribe</span>}
              {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md border border-white/10">
                  Subscribe
                </div>
              )}
            </button>
          </div>
        </nav>
        <div className="p-6 mt-auto border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`
              flex items-center ${collapsed ? "justify-center" : ""} w-full 
              px-4 py-3.5 rounded-xl
              text-white hover:bg-peach/20
              transition-all
              relative group
            `}
          >
            <FaSignOutAlt size={20} />

            {!collapsed && <span className="ml-3">Logout</span>}
            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md border border-white/10">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ${
          collapsed ? "md:ml-24" : "md:ml-72"
        }`}
      />

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
      />
    </>
  );
};

export default Sidebar;
