import React from 'react';

interface RunStatusProps {
  status: 'idle' | 'running' | 'completed' | 'error';
  message?: string;
  finalScreenshot?: string;
}

export const RunStatus: React.FC<RunStatusProps> = ({ status, message, finalScreenshot }) => {
  return (
    <div className={`status-banner status-${status}`}>
      <div className="status-text">
        <span className="status-indicator"></span>
        <span>{status}</span>
      </div>
      {message && <div className="status-message">{message}</div>}
      {finalScreenshot && <img className="status-screenshot" src={finalScreenshot} alt="Final browser capture" />}
    </div>
  );
};
