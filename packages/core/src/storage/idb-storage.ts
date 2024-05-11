import { DBCreateOptions, IdbKeyVal } from "@dfinity/auth-client";

import { ClientStorageInterface } from "./storage.interface";

export class IdbStorage implements ClientStorageInterface {
  #options: DBCreateOptions;

  /**
   * @param options - DBCreateOptions
   * @param options.dbName - name for the indexeddb database
   * @param options.storeName - name for the indexeddb Data Store
   * @param options.version - version of the database. Increment to safely upgrade
   * @constructs an {@link IdbStorage}
   * @example
   * ```typescript
   * const storage = new IdbStorage({ dbName: 'my-db', storeName: 'my-store', version: 2 });
   * ```
   */
  constructor(options?: DBCreateOptions) {
    this.#options = options ?? {};
  }

  // Initializes a KeyVal on first request
  private initializedDb: IdbKeyVal | undefined;

  get _db(): Promise<IdbKeyVal> {
    return new Promise((resolve) => {
      if (this.initializedDb) {
        resolve(this.initializedDb);
        return;
      }

      IdbKeyVal.create(this.#options).then((db) => {
        this.initializedDb = db;
        resolve(db);
      });
    });
  }

  public async getItem<T = string>(key: string): Promise<T | null> {
    const db = await this._db;
    return await db.get<T>(key);
    // return (await db.get<string>(key)) ?? null;
  }

  public async setItem<T = string>(key: string, value: T): Promise<void> {
    const db = await this._db;
    await db.set(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    const db = await this._db;
    await db.remove(key);
  }
}

new IdbStorage({ dbName: "ares", storeName: "ares-client", version: 2 });
