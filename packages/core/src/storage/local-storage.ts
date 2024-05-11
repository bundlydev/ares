import { ClientStorageInterface } from "./storage.interface";

export class LocalStorage implements ClientStorageInterface {
  public async getItem(key: string) {
    return localStorage.getItem(key);
  }

  public async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  public async removeItem(key: string) {
    localStorage.removeItem(key);
  }
}
