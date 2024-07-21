import { ActionAdapter, ActionContext } from "@dialectlabs/blinks";
import { CanvasClient } from "@dscvr-one/canvas-client-sdk";
import * as base58 from "bs58";

const CANVAS_CHAIN_ID = "solana:101";

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
      return response.untrusted.address;
    } catch (error) {
      console.error("Connection error:", error);
      return null;
    }
  };

  base64tobase58 = (base64: string) => {
    return base58.encode(Buffer.from(base64, "base64"));
  };

  signTransaction = async (_tx: string, _context: ActionContext) => {
    console.log("signTransaction");
    try {
      console.log("signTransaction", _tx);
      const results = await this.canvasClient.signAndSendTransaction({
        unsignedTx: this.base64tobase58(_tx),
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
