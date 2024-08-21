import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Action, ActionContainer } from '@dialectlabs/blinks';
import '@dialectlabs/blinks/index.css';
import './blink.css';
import { canvasClient } from './canvas-client';
import { useCanvasAdapter } from './use-canvas-adapter';

const App = () => {
  const [action, setAction] = useState<Action | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteText, setWebsiteText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { initialize, canvasAdapterRef } = useCanvasAdapter();

  useEffect(() => {
    if (canvasClient) {
      initialize();
    }

    const fetchAction = async () => {
      const url = new URL(window.location.href);

      const actionParam =
        url.searchParams.get('action') ??
        'https://blink-chat.xyz/api/actions/chat';

      if (actionParam) {
        try {
          const actionUrl = new URL(actionParam);

          setWebsiteUrl(actionUrl.toString());
          setWebsiteText(actionUrl.host);

          const action = await Action.fetch(
            actionParam,
            canvasAdapterRef.current
          );
          setAction(action);
        } catch (error) {
          console.error('Invalid action URL:', error);
        }
      } else {
        console.error('No action parameter provided in URL');
      }
    };
    fetchAction();

    const resizeObserver = new ResizeObserver((_) => {
      canvasClient.resize();
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
      console.log('Action mounted:', action, url, actionState);
    },
  };

  const exampleSecurityLevel = 'only-trusted';

  const containerStyle = {
    maxWidth: '450px',
    margin: '0 auto',
    width: '100%',
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
