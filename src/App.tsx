import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Action,
  ActionContainer,
} from "@dialectlabs/blinks";
import '@dialectlabs/blinks/index.css';
import './blink.css'
import { CanvasAdapter, isIframe } from "./canvas-adapter";
import { CanvasClient } from "@dscvr-one/canvas-client-sdk";

const App = () => {
  const [action, setAction] = useState<Action | null>(null);
  const [_, setIsInIframe] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteText, setWebsiteText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasClientRef = useRef<CanvasClient | undefined>();
  
  useEffect(() => {
    const iframe = isIframe();

    if(iframe) {
      canvasClientRef.current = new CanvasClient();
    };

    setIsInIframe(iframe);
    const adapter = iframe ? new CanvasAdapter() : undefined;

    const fetchAction = async () => {
      const url = new URL(window.location.href);
      
      const actionParam = url.searchParams.get('action') ?? 'https://blink-chat.xyz/api/actions/chat';
      
      if (actionParam) {
        try {
          const actionUrl = new URL(actionParam);
          
          setWebsiteUrl(actionUrl.toString());
          setWebsiteText(actionUrl.host);

          const action = await Action.fetch(
            actionParam,
            adapter
          );
          setAction(action);
        } catch (error) {
          console.error("Invalid action URL:", error);
        }
      } else {
        console.error("No action parameter provided in URL");
      }
    };
    fetchAction();

    const resizeObserver = new ResizeObserver((_) => {
      canvasClientRef?.current?.resize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const exampleCallbacks = {
    onActionMount: (action: any, url: any, actionState: any) => {
      console.log("Action mounted:", action, url, actionState);
    },
  };

  const exampleSecurityLevel = "only-trusted";

  const containerStyle = {
    maxWidth: '450px',
    margin: '0 auto',
    width: '100%'
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {action && (
        <ActionContainer
          action={action}
          websiteUrl={websiteUrl}
          websiteText={websiteText}
          callbacks={exampleCallbacks}
          securityLevel={exampleSecurityLevel}
          stylePreset="x-dark"
        />
      )}
    </div>
  );
};

export default App;