import { ActionAdapter, ActionContext } from "@dialectlabs/blinks";
import { CanvasClient } from "@dscvr-one/canvas-client-sdk";
import {
  Message,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import * as base58 from "bs58";

const CANVAS_CHAIN_ID = "solana:101";
const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const base64tobase58 = (base64: string) => {
  return base58.encode(Buffer.from(base64, "base64"));
};

const parseTransaction = (base58Tx: string) => {
  const txUint8Array = base58.decode(base58Tx);

  try {
    return VersionedTransaction.deserialize(txUint8Array);
  } catch {
    const response = Message.from(txUint8Array);
    return new VersionedTransaction(response);
  }
};

const addMemoTracker = (base64Tx: string, address: string) => {
  let base58Tx = base64tobase58(base64Tx);

  try {
    const tx = parseTransaction(base58Tx);

    if (tx.message.addressTableLookups.length > 0) {
      console.log("Transaction lookup tables");
      return base58Tx;
    }

    let newMessage = TransactionMessage.decompile(tx.message);

    newMessage.instructions.push(
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from("dscvr.one", "utf8"),
        keys: [
          {
            pubkey: new PublicKey(address),
            isSigner: true,
            isWritable: false,
          },
        ],
      })
    );

    const compiledMessage =
      tx.version === "legacy"
        ? newMessage.compileToLegacyMessage()
        : newMessage.compileToV0Message();

    const newTransaction = new VersionedTransaction(compiledMessage);
    const serializedNewTransaction = newTransaction.serialize();

    if (serializedNewTransaction.byteLength > 1232) {
      return base58Tx;
    }
    return base58.encode(serializedNewTransaction);
  } catch (error) {
    console.error("Error adding memo tracker:", error);
    return base58Tx;
  }
};

export const isIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

export class CanvasAdapter implements ActionAdapter {
  canvasClient: CanvasClient;
  chainId: string;
  address?: string;
  constructor(chainId: string = CANVAS_CHAIN_ID) {
    this.canvasClient = new CanvasClient();
    this.chainId = chainId;
    this.canvasClient.ready().then(() => {
      console.log("Canvas client ready");
    });
  }

  connect = async (_context: ActionContext) => {
    try {
      if (!this.canvasClient) {
        throw new Error("Canvas client not initialized");
      }

      let response = await this.canvasClient.connectWallet(this.chainId);
      if (!response?.untrusted.success) {
        throw new Error("Failed to connect wallet");
      }
      this.address = response.untrusted.address;
      return response.untrusted.address;
    } catch (error) {
      console.error("Connection error:", error);
      return null;
    }
  };

  signTransaction = async (tx: string, _context: ActionContext) => {
    console.log("signTransaction");
    try {
      console.log("signTransaction", tx, this.address);
      const results = await this.canvasClient.signAndSendTransaction({
        unsignedTx: base64tobase58(tx), //addMemoTracker(tx, this.address),
        awaitCommitment: "confirmed",
        chainId: this.chainId,
      });

      if (!results?.untrusted.success) {
        throw new Error("Failed to sign transaction");
      }
      return { signature: results.untrusted.signedTx };
    } catch (error) {
      console.error("Transaction signing error:", error);
      return { error: "Failed to sign transaction" };
    }
  };

  confirmTransaction = async (_signature: string, _context: ActionContext) => {
    console.log("confirmTransaction");
    try {
      await true;
    } catch (error) {
      console.error("Transaction confirmation error:", error);
    }
  };
}
