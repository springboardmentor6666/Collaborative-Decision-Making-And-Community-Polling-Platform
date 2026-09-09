/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: Input.jsx
 * Architecture Tier: Design System Primitive (UI Layer)
 * Path: frontend/src/components/ui/Input.jsx
 *
 * Purpose:
 *   Design system text input and textarea component with validation states, helper text, and icon adornments.
 */

import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input 
      className={`app-input px-4 py-2 ${className}`} 
      {...props} 
    />
  );
}

export function TextArea({ className = '', ...props }) {
  return (
    <textarea 
      className={`app-input px-4 py-2 ${className}`} 
      {...props} 
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select 
      className={`app-input px-4 py-2 ${className}`} 
      {...props}
    >
      {children}
    </select>
  );
}
