import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { loginBack, logout } from "@/hooks/auth";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const Layout = () => {
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    handleLoginBack();
  }, []);

  const handleLoginBack = async () => {
    try {
      const res = await loginBack();
      if (!res) {
        return;
      }
      setUser(res?.user);
      if (res?.token) {
        setToken(res.token);
      }
      navigate("/dashboard");
    } catch (error: any) {
      logout();
      navigate("/");
    }
  };
  return (
    <div className="bg-peach/50 text-slate min-h-screen">
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "",
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default Layout;
