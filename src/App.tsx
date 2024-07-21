import { useEffect, useState } from "react";
import "./App.css";
import {
  Action,
  ActionContainer,
} from "@dialectlabs/blinks";
import '@dialectlabs/blinks/index.css';
import './blink.css'
import { CanvasAdapter, isIframe } from "./canvas-adapter";

const App = () => {
  //const [count, setCount] = useState(0);
  const [action, setAction] = useState<Action | null>(null);

  useEffect(() => {
    const adapter = isIframe() ? new CanvasAdapter() : undefined;

    const fetchAction = async () => {
      // Get the current URL
      const url = new URL(window.location.href);
      // Get the 'action' query parameter
      const actionParam = url.searchParams.get('action') ?? 'https://blink-chat.xyz/api/actions/chat';
      
      if (actionParam) {
        const action = await Action.fetch(
          actionParam,
          adapter
        );
        setAction(action);
      } else {
        console.error("No action parameter provided in URL");
      }
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
          websiteText=""
          callbacks={exampleCallbacks}
          securityLevel={exampleSecurityLevel}
          stylePreset="x-dark"
        />
      )}
    </>
  );
};

export default App;