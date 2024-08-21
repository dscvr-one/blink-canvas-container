import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Action,
  Blink,
  useActionsRegistryInterval,
} from "@dialectlabs/blinks";
import '@dialectlabs/blinks/index.css';
import './blink.css'
import { CanvasAdapter, isIframe } from "./canvas-adapter";
import { CanvasClient } from "@dscvr-one/canvas-client-sdk";

const App = () => {
  const [action, setAction] = useState<Action | null>(null);
  const [_, setIsInIframe] = useState(false);
  const [websiteText, setWebsiteText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasClientRef = useRef<CanvasClient | undefined>();
  const { isRegistryLoaded } = useActionsRegistryInterval();

  useEffect(() => {
    const iframe = isIframe();
    if (iframe) {
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
          setWebsiteText(actionUrl.hostname)
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

  const containerStyle = {
    maxWidth: '450px',
    margin: '0 auto',
    width: '100%'
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Changed this from the ActionContainer to using the Blink Component, I think this was the major change, and I also updated some packages and added get metadata to the canvas Adapter */}
      {isRegistryLoaded && action ? <Blink stylePreset="x-dark" action={action} websiteText={websiteText} /> : null}
    </div>
  );
};

export default App;