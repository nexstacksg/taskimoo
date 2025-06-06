import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

export type ImmerStateCreator<T> = StateCreator<
  T,
  [["zustand/immer", never], never],
  [],
  T
>;

export { immer };
