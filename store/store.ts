import { create } from "zustand";
const useName = create((set) => ({
  name: "",
  setName: (newname: string) => set({ name: newname }),
}));
export default useName;
