import { SignIdentity, Signature } from "@dfinity/agent";
import { Ed25519PublicKey } from "@dfinity/identity";

export class IncompleteEd25519KeyIdentity extends SignIdentity {
  constructor(private readonly _publicKey: Ed25519PublicKey) {
    super();
  }

  // We don't need to implement this method
  // @ts-ignore
  public sign(blob: ArrayBuffer): Promise<Signature> {}

  public getPublicKey(): Ed25519PublicKey {
    return this._publicKey;
  }
}
