import React, { useState, useCallback, useEffect } from 'react';
import { PhysicsProvider, usePhysics } from './components/PhysicsProvider';
import { SuggestionCard } from './components/SuggestionCard';
import { SuggestionForm } from './components/SuggestionForm';

interface Suggestion {
  id: string;
  text: string;
  votes: number;
  x: number;
  y: number;
}

// Generate random position avoiding center (where form is)
function getRandomPosition(): { x: number; y: number } {
  const padding = 50;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const formWidth = 350;
  const formHeight = 200;

  let x: number, y: number;
  let attempts = 0;

  do {
    x = padding + Math.random() * (window.innerWidth - padding * 2 - 200);
    y = padding + Math.random() * (window.innerHeight - padding * 2 - 100);
    attempts++;
  } while (
    attempts < 20 &&
    x > centerX - formWidth / 2 - 100 &&
    x < centerX + formWidth / 2 + 100 &&
    y > centerY - formHeight / 2 - 50 &&
    y < centerY + formHeight / 2 + 50
  );

  return { x, y };
}

function getInitialSuggestions(): Suggestion[] {
  return [
    { id: '1', text: 'Add a calendar view', votes: 5, ...getRandomPosition() },
    { id: '2', text: 'Dark mode toggle', votes: 3, ...getRandomPosition() },
    { id: '3', text: 'Export to PDF', votes: 1, ...getRandomPosition() },
  ];
}

// Inner component that has access to physics context
function SuggestionBoard() {
  const { worldVersion, isReady } = usePhysics();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(getInitialSuggestions);

  // Reset suggestions with new positions when world resets
  useEffect(() => {
    if (worldVersion > 0) {
      setSuggestions((prev) =>
        prev.map((s) => ({ ...s, ...getRandomPosition() }))
      );
    }
  }, [worldVersion]);

  const addSuggestion = useCallback((text: string) => {
    const newSuggestion: Suggestion = {
      id: Date.now().toString(),
      text,
      votes: 0,
      ...getRandomPosition(),
    };
    setSuggestions((prev) => [...prev, newSuggestion]);
  }, []);

  const voteSuggestion = useCallback((id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s))
    );
  }, []);

  return (
    <>
      {/* Fixed form in center */}
      <SuggestionForm onSubmit={addSuggestion} />

      {/* Draggable suggestion cards - key includes worldVersion to force remount on resize */}
      {isReady && suggestions.map((suggestion) => (
        <SuggestionCard
          key={`${worldVersion}-${suggestion.id}`}
          id={suggestion.id}
          text={suggestion.text}
          votes={suggestion.votes}
          onVote={voteSuggestion}
          initialX={suggestion.x}
          initialY={suggestion.y}
        />
      ))}
    </>
  );
}

function App() {
  return (
    <PhysicsProvider>
      <SuggestionBoard />
    </PhysicsProvider>
  );
}

export default App;
