import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";

export const DEFAULT_UTOOLS_STATE: {
  action: { code: string; type: string; payload: any; option: any } | null;
} = {
  action: null,
};

export type UToolsState = typeof DEFAULT_UTOOLS_STATE;

export const useUToolsStore = createPersistStore(
  { ...DEFAULT_UTOOLS_STATE },
  (set, get) => ({
    updateAction: (action: UToolsState["action"]) => {
      set({ action });
    },
  }),
  {
    name: StoreKey.UTools,
    version: 1.0,
  },
);
