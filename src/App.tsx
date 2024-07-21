import { useEffect, useState } from "react";
import "./App.css";
import {
  Action,
  type ActionAdapter,
  ActionContainer,
  ActionContext,
} from "@dialectlabs/blinks";
import '@dialectlabs/blinks/index.css';
import './blink.css'
import { CanvasClient } from '@dscvr-one/canvas-client-sdk';
import * as base58 from 'bs58';


const chainId = 'solana:101';

class MyActionAdapter implements ActionAdapter {
  canvasClient: CanvasClient;
  constructor() {
    this.canvasClient = new CanvasClient();
    this.canvasClient.ready().then(() => {
      console.log('Canvas client ready');
    });

  }

  connect = async (_context: ActionContext) => {
    try {
      if (!this.canvasClient) {
        throw new Error('Canvas client not initialized');
      }
      
      let response = await this.canvasClient.connectWallet(chainId);
      if (!response?.untrusted.success) {
        throw new Error('Failed to connect wallet');
      }
      return response.untrusted.address;
    } catch (error) {
      console.error("Connection error:", error);
      return null;
    }
  };

  base64tobase58 = (base64: string) => {
    return base58.encode(Buffer.from(base64, 'base64'));
  }

  signTransaction = async (_tx: string, _context: ActionContext) => {
    console.log('signTransaction');
    try {
      console.log('signTransaction', _tx);
      const results = await this.canvasClient.signAndSendTransaction({
        unsignedTx: this.base64tobase58(_tx),
        awaitCommitment: 'confirmed',
        chainId: chainId,
      });

      if (!results?.untrusted.success) {
        throw new Error('Failed to sign transaction');
      }
      return {signature: results.untrusted.signedTx};
    } catch (error) {
      console.error("Transaction signing error:", error);
      return { error: "Failed to sign transaction" };
    }
  };

  confirmTransaction = async (_signature: string, _context: ActionContext) => {
    console.log('confirmTransaction');
    try {
      await true;
    } catch (error) {
      console.error("Transaction confirmation error:", error);
    }
  };
}



const App = () => {
  //const [count, setCount] = useState(0);
  const [action, setAction] = useState<Action | null>(null);


  useEffect(() => {

    const fetchAction = async () => {
      const action = await Action.fetch(
        "https://blink-chat.xyz/api/actions/chat",
        new MyActionAdapter()
      );
      setAction(action);
    };
    fetchAction();
  }, []);

  const exampleCallbacks = {
    onActionMount: (action: any, url: any, actionState: any) => {
      console.log("Action mounted:", action, url, actionState);
    },
  };

  const exampleSecurityLevel = "only-trusted";

  return (
    <>
      {action && (
        <ActionContainer
          action={action}
          websiteUrl="https://example.com"
          websiteText="Example Website"
          callbacks={exampleCallbacks}
          securityLevel={exampleSecurityLevel}
          stylePreset="x-dark"
        />
      )}
    </>
  );
};

export default App;