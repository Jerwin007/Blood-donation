import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    allowedHosts: [
      'blood-donation-8a46.onrender.com', // 👈 your Render domain
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    allowedHosts: [
      'blood-donation-8a46.onrender.com', // 👈 your Render domain again
    ],
  },
});
