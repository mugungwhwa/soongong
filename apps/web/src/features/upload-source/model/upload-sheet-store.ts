import { create } from "zustand";

interface UploadSheetState {
  open: boolean;
  setOpen: (v: boolean) => void;
  openSheet: () => void;
  closeSheet: () => void;
}

export const useUploadSheetStore = create<UploadSheetState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  openSheet: () => set({ open: true }),
  closeSheet: () => set({ open: false }),
}));
