import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} button-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
