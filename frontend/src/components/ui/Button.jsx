/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: Button.jsx
 * Architecture Tier: Design System Primitive (UI Layer)
 * Path: frontend/src/components/ui/Button.jsx
 *
 * Purpose:
 *   Design system button primitive supporting primary, secondary, danger, and ghost variants with loading states.
 */

import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}) {
  const baseClasses = variant === 'outline' ? 'app-button-outline' : 'app-button';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
