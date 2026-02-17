import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Avatar({ children, className = '', ...props }: AvatarProps) {
  return (
    <div className={`avatar ${className}`} {...props}>
      {children}
    </div>
  );
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function AvatarImage({ className = '', ...props }: AvatarImageProps) {
  return <img className={`avatar-image ${className}`} {...props} />;
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AvatarFallback({ children, className = '', ...props }: AvatarFallbackProps) {
  return (
    <div className={`avatar-fallback ${className}`} {...props}>
      {children}
    </div>
  );
}
