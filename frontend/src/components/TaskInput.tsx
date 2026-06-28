import React, { useState } from 'react';

interface TaskInputProps {
  onStart: (task: string, url?: string) => void;
  disabled: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onStart, disabled }) => {
  const [task, setTask] = useState('open scaler.com and try to login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) onStart(task);
  };

  return (
    <form onSubmit={handleSubmit} className="command-form">
      <label className="field-label" htmlFor="task-command">Task</label>
      <textarea
        id="task-command"
        className="cmd-input"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Describe what the browser agent should do"
        disabled={disabled}
        required
        autoComplete="off"
        spellCheck="false"
        rows={5}
      />
      <button type="submit" className="primary-btn" disabled={disabled || !task.trim()}>
        {disabled ? 'Running' : 'Start run'}
      </button>
    </form>
  );
};
