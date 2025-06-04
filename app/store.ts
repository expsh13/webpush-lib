import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FilterState = {
  isAlert: boolean;
  setIsAlert: (value: boolean) => void;
};

export const useSpNavigation = create<FilterState>()(
  persist(
    (set) => ({
      isAlert: false,
      setIsAlert: (value: boolean) => set(() => ({ isAlert: value })),
    }),
    {
      name: "storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
