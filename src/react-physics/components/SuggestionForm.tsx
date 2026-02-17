import React, { useState, useEffect, useRef, useId } from 'react';
import { usePhysics } from './PhysicsProvider';

interface SuggestionFormProps {
  onSubmit: (text: string) => void;
}

export function SuggestionForm({ onSubmit }: SuggestionFormProps) {
  const [text, setText] = useState('');
  const id = useId();
  const formRef = useRef<HTMLDivElement>(null);
  const { isReady, createStaticBody, removeBody } = usePhysics();

  // Create static physics body for the form
  useEffect(() => {
    if (!isReady || !formRef.current) return;

    const rect = formRef.current.getBoundingClientRect();
    const containerRect = formRef.current.parentElement?.getBoundingClientRect();

    if (containerRect) {
      // Calculate position relative to container
      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top;

      createStaticBody(id, x, y, rect.width, rect.height);
    }

    return () => {
      removeBody(id);
    };
  }, [isReady, id, createStaticBody, removeBody]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <div ref={formRef} className="suggestion-form-container">
      <form className="suggestion-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Add a Suggestion</h2>
        <input
          type="text"
          className="suggestion-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What feature would you like to see?"
          maxLength={100}
        />
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
}
