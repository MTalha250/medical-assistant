import { create } from "zustand";
import { User } from "@/types";

type AuthStore = {
  token: string | null | undefined;
  user: User | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  token: "",
  user: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));

export default useAuthStore;
