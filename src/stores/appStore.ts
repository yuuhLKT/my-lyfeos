import { create } from "zustand";

interface AppState {
  activeScreen: string;
  setActiveScreen: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeScreen: "home",
  setActiveScreen: (id) => set({ activeScreen: id }),
}));
