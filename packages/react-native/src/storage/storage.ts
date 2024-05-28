import AsyncStorage from "@react-native-async-storage/async-storage";

import { ClientStorageInterface } from "@bundly/ares-core";

export class ReactNativeStorage implements ClientStorageInterface {
  public async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  public async setItem(key: string, value: string): Promise<void> {
    AsyncStorage.setItem(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    AsyncStorage.removeItem(key);
  }
}
