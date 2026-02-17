import React, { useEffect, useRef, useState, useCallback, useId } from 'react';
import { usePhysics } from './PhysicsProvider';

interface DraggablePhysicsBodyProps {
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  className?: string;
}

export function DraggablePhysicsBody({
  children,
  initialX,
  initialY,
  className = '',
}: DraggablePhysicsBodyProps) {
  const id = useId();
  const elementRef = useRef<HTMLDivElement>(null);
  const {
    isReady,
    createBody,
    removeBody,
    setKinematic,
    setKinematicPosition,
    applyImpulse,
  } = usePhysics();

  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: initialX, y: initialY });
  const velocityRef = useRef({ x: 0, y: 0 });

  // Create physics body when ready
  useEffect(() => {
    if (!isReady || !elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    createBody(id, initialX, initialY, rect.width, rect.height, (x, y, rot) => {
      if (!isDragging) {
        setPosition({ x: x - rect.width / 2, y: y - rect.height / 2 });
        setRotation(rot);
      }
    });

    return () => {
      removeBody(id);
    };
  }, [isReady, id, initialX, initialY, createBody, removeBody]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setKinematic(id, true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    lastPosRef.current = { x: position.x, y: position.y };
    velocityRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [id, position, setKinematic]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;

    // Track velocity for throw effect
    velocityRef.current = {
      x: (newX - lastPosRef.current.x) * 20,
      y: (newY - lastPosRef.current.y) * 20,
    };
    lastPosRef.current = { x: newX, y: newY };

    setPosition({ x: newX, y: newY });
    setKinematicPosition(id, newX, newY);
  }, [isDragging, id, setKinematicPosition]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    setKinematic(id, false);

    // Apply throw velocity
    applyImpulse(id, velocityRef.current.x, velocityRef.current.y);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [isDragging, id, setKinematic, applyImpulse]);

  return (
    <div
      ref={elementRef}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}rad)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  );
}
