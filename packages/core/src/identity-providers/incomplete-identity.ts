import { SignIdentity, Signature } from "@dfinity/agent";
import { Ed25519PublicKey } from "@dfinity/identity";

export class IncompleteIdentity extends SignIdentity {
  constructor(private readonly _publicKey: Ed25519PublicKey) {
    super();
  }

  // We don't need to implement this method
  // @ts-ignore
  public sign(blob: ArrayBuffer): Promise<Signature> {}

  // @ts-ignore
  public getPublicKey() {
    return this._publicKey;
  }
}
