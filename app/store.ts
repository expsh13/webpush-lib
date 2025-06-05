import { create } from "zustand";

type FilterState = {
  isAlert: boolean;
  setIsAlert: (value: boolean) => void;
};

export const useSpNavigation = create<FilterState>()((set) => ({
  isAlert: false,
  setIsAlert: (value: boolean) => set(() => ({ isAlert: value })),
}));
