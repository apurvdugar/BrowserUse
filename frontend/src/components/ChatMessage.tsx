import React from 'react';
import type { StepEvent } from '../api';

interface ChatMessageProps {
  step: StepEvent;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ step }) => {
  const time = new Date(step.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const renderLabel = () => {
    switch (step.type) {
      case 'reasoning':
        return <div className="agent-step-label label-thinking">💭 Thinking</div>;
      case 'step':
        return <div className="agent-step-label label-action">⚡ {step.tool}</div>;
      case 'error':
        return <div className="agent-step-label label-error">✕ Error</div>;
      case 'done':
        return <div className="agent-step-label label-done">✓ Complete</div>;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (step.type === 'reasoning') {
      return <div>{step.message}</div>;
    }
    if (step.type === 'step') {
      return (
        <div>
          {step.args && (
            <div className="agent-action-detail">
              {JSON.stringify(step.args, null, 2)}
            </div>
          )}
          {step.result && (
            <div className={`agent-result-badge ${step.result.success ? 'result-success' : 'result-error'}`}>
              {step.result.success ? '✓ Success' : `✕ ${step.result.error}`}
            </div>
          )}
        </div>
      );
    }
    if (step.type === 'error' || step.type === 'done') {
      return <div>{step.message}</div>;
    }
    return null;
  };

  return (
    <div className="msg-row agent">
      <div className="msg-avatar agent-avatar">B</div>
      <div>
        <div className="msg-bubble agent-bubble">
          {renderLabel()}
          {renderContent()}
          {step.screenshotUrl && (
            <div className="msg-screenshot">
              <img 
                src={`http://localhost:3000${step.screenshotUrl}`} 
                alt="Browser capture"
                loading="lazy"
              />
              <div className="msg-screenshot-label">📸 Browser capture</div>
            </div>
          )}
        </div>
        <div className="msg-meta">{time}</div>
      </div>
    </div>
  );
};
