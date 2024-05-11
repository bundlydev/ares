import AsyncStorage from "@react-native-async-storage/async-storage";

import { ClientStorageInterface } from "@bundly/ares-core";

export class ReactNativeStorage implements ClientStorageInterface {
  public async getItem(key: string) {
    return AsyncStorage.getItem(key);
  }

  public async setItem(key: string, value: string) {
    AsyncStorage.setItem(key, value);
  }

  public async removeItem(key: string) {
    AsyncStorage.removeItem(key);
  }
}
