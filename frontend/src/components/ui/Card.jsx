/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: Card.jsx
 * Architecture Tier: Design System Primitive (UI Layer)
 * Path: frontend/src/components/ui/Card.jsx
 *
 * Purpose:
 *   Design system surface container component with glassmorphism styling, border gradients, and hover elevations.
 */

import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`app-card p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-primary ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}
