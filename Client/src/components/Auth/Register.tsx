import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { register } from "@/hooks/auth";
import useAuthStore from "@/store/authStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      setLoading(true);
      const { user, token } = await register(name, email, password);
      setUser(user);
      setToken(token);
      setLoading(false);
      toast.success("Registered Successfullly");
      navigate("/chat");
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data === "User already exists") {
        toast.error("User already exists");
        return;
      }
      toast.error("Something went wrong, please try again");
    }
  };
  return (
    <div className="h-full flex items-center justify-center">
      <form onSubmit={(e) => handleSubmit(e)} className="w-full max-w-md px-8">
        <h1 className="font-bold text-3xl my-2">Create an account</h1>
        <p className="mb-5 text-sm text-gray-500">
          Enter your name, email and password below to create an account
        </p>
        <Input
          className="my-3 bg-gray-800 border-gray-700 text-white"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          className="my-3 bg-gray-800 border-gray-700 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          className="my-3 bg-gray-800 border-gray-700 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className="my-2 w-full bg-blue-900/30 border border-blue-700 text-blue-100 hover:bg-blue-900/50">
          {!loading ? "Register" : <FaSpinner className="animate-spin" />}
        </Button>
        <p className="mt-5 text-sm text-gray-500">Already have an account?</p>
        <Link
          to="/"
          className="h-10 px-4 py-2 text-center inline-block rounded-md my-2 w-full bg-blue-900/30 border border-blue-700 text-blue-100 hover:bg-blue-900/50 text-sm"
        >
          Sign In
        </Link>
      </form>
    </div>
  );
};

export default Register;
