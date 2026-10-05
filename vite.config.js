import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets let the production build work from any GitHub Pages repo path.
export default defineConfig({ base: './', plugins: [react()] });
