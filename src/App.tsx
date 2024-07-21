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

class MyActionAdapter implements ActionAdapter {
  connect = async (_context: ActionContext) => {
    try {
      return "Connected successfully";
    } catch (error) {
      console.error("Connection error:", error);
      return null;
    }
  };

  signTransaction = async (_tx: string, _context: ActionContext) => {
    try {
      const signature = "";
      return { signature };
    } catch (error) {
      console.error("Transaction signing error:", error);
      return { error: "Failed to sign transaction" };
    }
  };

  confirmTransaction = async (_signature: string, _context: ActionContext) => {
    try {
      await true;
    } catch (error) {
      console.error("Transaction confirmation error:", error);
    }
  };
}

const App = () => {
  const [count, setCount] = useState(0);
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
      <div className="">Blinks v0.5.0</div>
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
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;