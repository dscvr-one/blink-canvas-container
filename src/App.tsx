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
  const [action, setAction] = useState<Action | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    const iframe = isIframe();
    setIsInIframe(iframe);
    const adapter = iframe ? new CanvasAdapter() : undefined;

    const fetchAction = async () => {
      const url = new URL(window.location.href);
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

  const containerStyle = !isInIframe ? {
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%'
  } : {};

  return (
    <div style={containerStyle}>
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
    </div>
  );
};

export default App;