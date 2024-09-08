import { StateStorage } from "zustand/middleware";
import { storage } from "./utools";

class IndexedDBStorage implements StateStorage {
  public async getItem(name: string): Promise<string | null> {
    return storage.getItem(name);
  }

  public async setItem(name: string, value: string): Promise<void> {
    storage.setItem(name, value);
  }

  public async removeItem(name: string): Promise<void> {
    storage.removeItem(name);
  }

  public async clear(): Promise<void> {
    storage.clear();
  }
}

export const indexedDBStorage = new IndexedDBStorage();
