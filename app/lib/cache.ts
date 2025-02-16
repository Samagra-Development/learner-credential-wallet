import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum CacheKey {
  PublicLink = 'publiclink',
  VerificationResult = 'verificationResult',
}

export class Cache {
  private static instance?: Cache;

  private storage: Storage;
  private constructor() {
    this.storage = new Storage({
      storageBackend: AsyncStorage,
    });
  }

  async load(key: string, id: string): Promise<unknown> {
    return this.storage.load({ key, id }) || {};
  }

  async store(key: string, id: string, data: unknown, expires: number | null = null ): Promise<void> {
    return this.storage.save({ key, id, data, expires });
  }

  async remove(key: string, id: string): Promise<void> {
    return this.storage.remove({ key, id });
  }

  async removeAll(key: string): Promise<void> {
    return this.storage.clearMapForKey(key);
  }

  static getInstance(): Cache {
    if (this.instance === undefined) {
      this.instance = new Cache();
    }
    return this.instance;
  }
}
