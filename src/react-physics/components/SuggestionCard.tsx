import React from 'react';
import { DraggablePhysicsBody } from './DraggablePhysicsBody';

// Simple thumbs-up SVG icon
function ThumbsUpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

interface SuggestionCardProps {
  id: string;
  text: string;
  votes: number;
  onVote: (id: string) => void;
  initialX: number;
  initialY: number;
}

export function SuggestionCard({
  id,
  text,
  votes,
  onVote,
  initialX,
  initialY,
}: SuggestionCardProps) {
  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger drag
    onVote(id);
  };

  return (
    <DraggablePhysicsBody initialX={initialX} initialY={initialY}>
      <div className="suggestion-card">
        <p className="suggestion-text">{text}</p>
        <button className="vote-button" onClick={handleVoteClick}>
          <ThumbsUpIcon />
          <span className="vote-count">{votes}</span>
        </button>
      </div>
    </DraggablePhysicsBody>
  );
}
