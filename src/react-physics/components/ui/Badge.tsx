import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
}

export function Badge({
  children,
  className = '',
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </div>
  );
}
