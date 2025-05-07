import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { login } from "@/hooks/auth";
import useAuthStore from "@/store/authStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      setLoading(true);
      const { user, token } = await login(email, password);
      setUser(user);
      setToken(token);
      setLoading(false);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        toast.error(error.response.data);
        return;
      }
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <form onSubmit={(e) => handleSubmit(e)} className="w-full max-w-md px-8">
        <h1 className="font-bold text-3xl my-2 text-slate">
          Sign in to your account
        </h1>
        <p className="mb-5 text-sm text-slate/70">
          Enter your email and password below to sign in
        </p>

        <Input
          className="my-3 bg-skyBlue/10 border-skyBlue hover:border-slate focus-visible:ring-1 focus-visible:ring-slate focus-visible:border-slate text-slate placeholder-slate/50 rounded-lg"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          className="my-3 bg-skyBlue/10 border-skyBlue hover:border-slate focus-visible:ring-1 focus-visible:ring-slate focus-visible:border-slate text-slate placeholder-slate/50 rounded-lg"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button className="my-2 w-full bg-slate hover:bg-slate/90 text-white rounded-lg py-6 font-medium shadow-sm transition-colors">
          {!loading ? "Sign In" : <FaSpinner className="animate-spin" />}
        </Button>

        <p className="mt-5 text-sm text-slate/70">Don't have an account?</p>

        <Link
          to="/register"
          className="h-10 px-4 py-2 text-center inline-flex items-center justify-center rounded-lg my-2 w-full bg-peach hover:bg-peach/90 text-slate font-medium transition-colors shadow-sm"
        >
          Register
        </Link>
      </form>
    </div>
  );
};

export default Login;
