import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { usePhysicsWorld } from '../hooks/usePhysicsWorld';

interface PhysicsContextType {
  isReady: boolean;
  worldVersion: number;
  createBody: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onPositionUpdate: (x: number, y: number, rotation: number) => void
  ) => void;
  createStaticBody: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onPositionUpdate?: (x: number, y: number, rotation: number) => void
  ) => void;
  removeBody: (id: string) => void;
  setBodyPosition: (id: string, x: number, y: number) => void;
  applyImpulse: (id: string, impulseX: number, impulseY: number) => void;
  setKinematic: (id: string, isKinematic: boolean) => void;
  setKinematicPosition: (id: string, x: number, y: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const PhysicsContext = createContext<PhysicsContextType | null>(null);

export function usePhysics() {
  const context = useContext(PhysicsContext);
  if (!context) {
    throw new Error('usePhysics must be used within a PhysicsProvider');
  }
  return context;
}

interface PhysicsProviderProps {
  children: ReactNode;
}

export function PhysicsProvider({ children }: PhysicsProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const physics = usePhysicsWorld(containerRef);

  return (
    <PhysicsContext.Provider value={{ ...physics, containerRef }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </PhysicsContext.Provider>
  );
}
