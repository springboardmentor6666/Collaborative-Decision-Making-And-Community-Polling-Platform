/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: frontend/vite.config.js
 * Architecture Tier: Build Tool & Development Server Configuration
 *
 * Purpose:
 *   Configures Vite 5 bundler, React plugin, local dev server on port 3000,
 *   and proxy rules for REST API (/api), WebSocket (/ws), and Google OAuth2 (/oauth2).
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws-chat': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});



