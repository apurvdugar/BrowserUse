import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { startRun, subscribeToRun } from './api';
import type { StepEvent, RunState } from './api';
import './index.css';

const HINT_TASKS = [
  'Search Google for "latest AI news"',
  'Go to github.com and explore trending',
  'Open wikipedia.org and search for "quantum computing"',
];

function App() {
  const [runState, setRunState] = useState<RunState>({
    status: 'idle',
    steps: []
  });
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userMessages, setUserMessages] = useState<{ text: string; time: string }[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [runState.steps, userMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleStart = async (task: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setUserMessages(prev => [...prev, { text: task, time: now }]);
    setInput('');

    try {
      setRunState({ status: 'running', steps: [] });
      const runId = await startRun(task);
      
      subscribeToRun(
        runId, 
        (event: StepEvent) => {
          setRunState(prev => {
            const newState = { ...prev, steps: [...prev.steps, event] };
            if (event.type === 'error') newState.status = 'error';
            if (event.type === 'done') newState.status = 'completed';
            if (event.message) newState.finalMessage = event.message;
            return newState;
          });
        },
        () => {
          setRunState(prev => prev.status === 'running' ? { ...prev, status: 'completed' } : prev);
        }
      );
    } catch (err: any) {
      setRunState({ status: 'error', steps: [], finalMessage: err.message });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && runState.status !== 'running') {
      handleStart(input.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isRunning = runState.status === 'running';
  const hasConversation = userMessages.length > 0;

  const statusLabel = {
    idle: 'Ready',
    running: 'Working…',
    completed: 'Done',
    error: 'Error'
  }[runState.status];

  // Interleave user messages and agent steps for display
  const renderMessages = () => {
    const elements: React.ReactNode[] = [];

    userMessages.forEach((msg, msgIdx) => {
      // User message
      elements.push(
        <div key={`user-${msgIdx}`} className="msg-row user">
          <div>
            <div className="msg-bubble user-bubble">{msg.text}</div>
            <div className="msg-meta">{msg.time}</div>
          </div>
          <div className="msg-avatar user-avatar">U</div>
        </div>
      );

      // If this is the latest user message, show agent steps
      if (msgIdx === userMessages.length - 1) {
        runState.steps.forEach((step, stepIdx) => {
          elements.push(
            <ChatMessage key={`step-${stepIdx}`} step={step} />
          );
        });
      }
    });

    return elements;
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-icon">🌐</div>
        <div className="chat-header-text">
          <h1>BrowserAgent</h1>
          <p>AI-powered browser automation</p>
        </div>
        <div className="header-status">
          <span className={`header-status-dot ${runState.status}`} />
          {statusLabel}
        </div>
      </header>

      {/* Chat area */}
      <div className="chat-area">
        {!hasConversation ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">🤖</div>
            <h2>What should I browse?</h2>
            <p>Tell me a task and I'll control the browser to get it done. I can navigate, click, type, and take screenshots.</p>
            <div className="chat-empty-hints">
              {HINT_TASKS.map((hint, i) => (
                <button
                  key={i}
                  className="chat-hint-chip"
                  onClick={() => handleStart(hint)}
                  disabled={isRunning}
                  type="button"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {renderMessages()}
            {isRunning && (
              <div className="typing-indicator">
                <div className="msg-avatar agent-avatar">B</div>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning ? 'Agent is working…' : 'Describe what the browser should do…'}
            disabled={isRunning}
            rows={1}
            id="chat-input"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={isRunning || !input.trim()}
            aria-label="Send message"
          >
            ↑
          </button>
        </form>
        <div className="input-hint">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

export default App;
